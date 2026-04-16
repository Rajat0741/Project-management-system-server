import type { Types } from "mongoose";
import { Tasks } from "../../models/task.models.js";
import { ProjectMember } from "../../models/projectmember.models.js";
import { Subtask } from "../../models/subtask.models.js";
import ApiError from "../../utils/api-errors.js";
import { ensureProjectExists, toObjectId } from "../shared/index.js";
import {
    deleteTaskAttachmentsByTaskIdsService,
    uploadTaskAttachmentsService,
} from "./attachment.service.js";
import { deleteSubtasksByTaskIdService } from "./subtask.service.js";

const ensureAssignedMemberService = async (
    projectId: string,
    assignedTo: string,
) => {
    const assignedMember = await ProjectMember.findOne({
        project: toObjectId(projectId),
        user: toObjectId(assignedTo),
    });

    if (!assignedMember) {
        throw new ApiError(400, "Assigned user is not a member of the project");
    }
};

const createTaskService = async (input: {
    projectId: string;
    title: string;
    description?: string;
    assignedTo: string;
    status?: string;
    subtasks?: Array<{ title: string }>;
    userId: Types.ObjectId;
    files: Express.Multer.File[];
}) => {
    const {
        projectId,
        title,
        description,
        assignedTo,
        status,
        subtasks,
        userId,
        files,
    } = input;

    await ensureProjectExists(projectId);
    await ensureAssignedMemberService(projectId, assignedTo);

    const task = await Tasks.create({
        title,
        description,
        project: toObjectId(projectId),
        assignedTo: toObjectId(assignedTo),
        assignedBy: toObjectId(userId),
        status,
        attachments: [],
    });

    let createdSubtasks: Awaited<ReturnType<typeof Subtask.insertMany>> = [];

    if (subtasks?.length) {
        const subtaskDocuments = subtasks.map((subtask) => ({
            title: subtask.title,
            task: task._id,
            isCompleted: false,
            createdBy: toObjectId(userId),
        }));

        createdSubtasks = await Subtask.insertMany(subtaskDocuments);
    }

    const attachments = await uploadTaskAttachmentsService({
        projectId,
        taskId: task._id.toString(),
        files,
    });

    if (attachments.length) {
        task.attachments = attachments;
        await task.save();
    }

    return { task, createdSubtasks };
};

const updateTaskService = async (input: {
    taskId: string;
    title?: string;
    description?: string;
    assignedTo?: string;
    status?: string;
}) => {
    const { taskId, title, description, assignedTo, status } = input;

    const task = await Tasks.findById(toObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (assignedTo) {
        await ensureAssignedMemberService(task.project.toString(), assignedTo);
        task.assignedTo = toObjectId(assignedTo);
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    await task.save();

    return task;
};

const deleteTaskService = async (taskId: string) => {
    const task = await Tasks.findById(toObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    await deleteTaskAttachmentsByTaskIdsService([taskId]);
    await deleteSubtasksByTaskIdService(taskId);
    await task.deleteOne();

    return task;
};

export { createTaskService, updateTaskService, deleteTaskService };
