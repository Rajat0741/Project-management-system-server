import { Subtask } from "../../models/subtask.models.js";
import { Tasks } from "../../models/task.models.js";
import ApiError from "../../utils/api-errors.js";
import { TasksStatusEnum, UserRolesEnum } from "../../utils/constants.js";
import { toObjectId } from "../shared/index.js";
import type { Types } from "mongoose";

const createSubtaskService = async (input: {
    taskId: string;
    title: string;
    userId: Types.ObjectId;
}) => {
    const { taskId, title, userId } = input;

    const task = await Tasks.findById(toObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return Subtask.create({
        title,
        task: toObjectId(taskId),
        isCompleted: false,
        createdBy: toObjectId(userId),
    });
};

const updateSubtaskService = async (input: {
    subtaskId: string;
    title?: string;
    isCompleted?: boolean;
}) => {
    const { subtaskId, title, isCompleted } = input;

    const subtask = await Subtask.findById(toObjectId(subtaskId));

    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    subtask.title = title || subtask.title;

    if (isCompleted !== undefined) {
        subtask.isCompleted = isCompleted;
    }

    await subtask.save();

    return subtask;
};

const deleteSubtaskService = async (subtaskId: string) => {
    const deletedSubtask = await Subtask.findByIdAndDelete(
        toObjectId(subtaskId),
    );

    if (!deletedSubtask) {
        throw new ApiError(404, "Subtask not found");
    }

    return deletedSubtask;
};

const getTaskStatusBySubtasksService = async (taskId: Types.ObjectId) => {
    const allSubtasks = await Subtask.find({ task: taskId });
    const completedCount = allSubtasks.filter(
        (subtask) => subtask.isCompleted,
    ).length;

    if (completedCount === 0) {
        return TasksStatusEnum.TODO;
    }

    if (completedCount === allSubtasks.length) {
        return TasksStatusEnum.DONE;
    }

    return TasksStatusEnum.IN_PROGRESS;
};

const updateSubtaskStatusService = async (input: {
    subtaskId: string;
    isCompleted: boolean;
    userId: Types.ObjectId;
    userRole?: string;
}) => {
    const { subtaskId, isCompleted, userId, userRole } = input;

    const subtask = await Subtask.findById(toObjectId(subtaskId));

    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    const task = await Tasks.findById(subtask.task);

    if (!task) {
        throw new ApiError(404, "Parent task not found");
    }

    const isAssigned = task.assignedTo?.toString() === userId.toString();
    const isAdmin =
        userRole === UserRolesEnum.ADMIN ||
        userRole === UserRolesEnum.PROJECT_ADMIN;

    if (!isAssigned && !isAdmin) {
        throw new ApiError(
            403,
            "Only the assigned member or an admin can update subtask status",
        );
    }

    subtask.isCompleted = isCompleted;
    await subtask.save();

    const newTaskStatus = await getTaskStatusBySubtasksService(subtask.task);
    await Tasks.findByIdAndUpdate(subtask.task, { status: newTaskStatus });

    return { subtask, taskStatus: newTaskStatus };
};

const deleteSubtasksByTaskIdsService = async (taskIds: Types.ObjectId[]) => {
    if (!taskIds.length) {
        return;
    }

    await Subtask.deleteMany({
        task: {
            $in: taskIds,
        },
    });
};

const deleteSubtasksByTaskIdService = async (taskId: string) => {
    await Subtask.deleteMany({
        task: toObjectId(taskId),
    });
};

export {
    createSubtaskService,
    updateSubtaskService,
    deleteSubtaskService,
    updateSubtaskStatusService,
    deleteSubtasksByTaskIdsService,
    deleteSubtasksByTaskIdService,
};
