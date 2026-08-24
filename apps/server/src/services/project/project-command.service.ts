import { Project } from "../../models/project.models.js";
import { ProjectMember } from "../../models/projectmember.models.js";
import { Tasks } from "../../models/task.models.js";
import ApiError from "../../utils/api-errors.js";
import { UserRolesEnum } from "../../utils/constants.js";
import { toObjectId } from "../shared/index.js";
import { deleteTaskAttachmentsByTaskIdsService } from "../task/attachment.service.js";
import { deleteSubtasksByTaskIdsService } from "../task/subtask.service.js";
import type { Types } from "mongoose";

const createProjectService = async (input: {
    name: string;
    description?: string;
    userId: Types.ObjectId;
}) => {
    const { name, description, userId } = input;

    const project = await Project.create({
        name,
        description,
        createdBy: toObjectId(userId),
    });

    await ProjectMember.create({
        user: toObjectId(userId),
        project: toObjectId(project._id),
        role: UserRolesEnum.ADMIN,
    });

    return project;
};

const updateProjectService = async (input: {
    projectId: string;
    name: string;
    description?: string;
}) => {
    const { projectId, name, description } = input;

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        {
            new: true,
        },
    );

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return project;
};

const deleteProjectService = async (projectId: string) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const tasks = await Tasks.find({
        project: toObjectId(projectId),
    }).select("_id");

    const taskIds = tasks.map((task) => task._id.toString());

    await deleteTaskAttachmentsByTaskIdsService(taskIds);
    await deleteSubtasksByTaskIdsService(tasks.map((task) => task._id));

    await Tasks.deleteMany({
        project: toObjectId(projectId),
    });

    await ProjectMember.deleteMany({
        project: toObjectId(projectId),
    });

    await project.deleteOne();

    return project;
};

export { createProjectService, updateProjectService, deleteProjectService };
