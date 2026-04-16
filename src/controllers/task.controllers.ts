import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import type {
    GetTasksSchemaType,
    GetTaskByIdSchemaType,
    CreateTaskSchemaType,
    UpdateTaskSchemaType,
    DeleteTaskSchemaType,
    AssignAttachmentSchemaType,
    DeleteAttachmentSchemaType,
    CreateSubtaskSchemaType,
    UpdateSubtaskSchemaType,
    DeleteSubtaskSchemaType,
    UpdateSubtaskStatusSchemaType,
} from "../validators/task.validators.js";
import {
    getTasksService,
    getTaskByIdService,
    createTaskService,
    updateTaskService,
    deleteTaskService,
    createSubtaskService,
    updateSubtaskService,
    deleteSubtaskService,
    updateSubtaskStatusService,
    addSingleAttachmentToTaskService,
    deleteAttachmentFromTaskService,
    mapTaskWithFilteredAttachments,
} from "../services/task/index.js";

const getTasks = asyncHandler(async (req, res) => {
    const params = req.params as GetTasksSchemaType["params"];
    const tasks = await getTasksService(params.projectId);

    res.status(200).json(
        new ApiResponse(200, tasks, "Tasks fetched successfully"),
    );
});

const getTaskById = asyncHandler(async (req, res) => {
    const params = req.params as GetTaskByIdSchemaType["params"];
    const task = await getTaskByIdService(params.taskId);

    res.status(200).json(
        new ApiResponse(200, task, "Task and Subtasks fetched successfully"),
    );
});

const createTask = asyncHandler(async (req, res) => {
    const params = req.params as CreateTaskSchemaType["params"];
    const body = req.body as CreateTaskSchemaType["body"];
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    const { task, createdSubtasks } = await createTaskService({
        projectId: params.projectId,
        title: body.title,
        description: body.description,
        assignedTo: body.assignedTo,
        status: body.status,
        subtasks: body.subtasks,
        userId: req.user._id,
        files,
    });

    const taskResponse = {
        ...mapTaskWithFilteredAttachments(task),
        subtasks: createdSubtasks,
    };

    res.status(201).json(
        new ApiResponse(201, taskResponse, "Task Created successfully"),
    );
});

const updateTask = asyncHandler(async (req, res) => {
    const params = req.params as UpdateTaskSchemaType["params"];
    const body = req.body as UpdateTaskSchemaType["body"];

    const task = await updateTaskService({
        taskId: params.taskId,
        title: body.title,
        description: body.description,
        assignedTo: body.assignedTo,
        status: body.status,
    });

    res.status(200).json(
        new ApiResponse(
            200,
            mapTaskWithFilteredAttachments(task),
            "Task updated successfully",
        ),
    );
});

const deleteTask = asyncHandler(async (req, res) => {
    const params = req.params as DeleteTaskSchemaType["params"];
    const task = await deleteTaskService(params.taskId);

    res.status(200).json(
        new ApiResponse(200, task, "Task deleted successfully"),
    );
});

const createSubtask = asyncHandler(async (req, res) => {
    const params = req.params as CreateSubtaskSchemaType["params"];
    const body = req.body as CreateSubtaskSchemaType["body"];

    const subtask = await createSubtaskService({
        taskId: params.taskId,
        title: body.title,
        userId: req.user._id,
    });

    res.status(201).json(
        new ApiResponse(201, subtask, "Subtask created successfully"),
    );
});

const updateSubtask = asyncHandler(async (req, res) => {
    const params = req.params as UpdateSubtaskSchemaType["params"];
    const body = req.body as UpdateSubtaskSchemaType["body"];

    const subtask = await updateSubtaskService({
        subtaskId: params.subtaskId,
        title: body.title,
        isCompleted: body.isCompleted,
    });

    res.status(200).json(
        new ApiResponse(200, subtask, "Subtask updated successfully"),
    );
});

const deleteSubtask = asyncHandler(async (req, res) => {
    const params = req.params as DeleteSubtaskSchemaType["params"];
    const deletedSubtask = await deleteSubtaskService(params.subtaskId);

    res.status(200).json(
        new ApiResponse(200, deletedSubtask, "Subtask deleted successfully"),
    );
});

const assignAttachment = asyncHandler(async (req, res) => {
    const params = req.params as AssignAttachmentSchemaType["params"];

    if (!req.file) {
        throw new ApiError(400, "Attachment file is required");
    }

    const attachment = await addSingleAttachmentToTaskService({
        projectId: params.projectId,
        taskId: params.taskId,
        file: req.file,
    });

    res.status(200).json(
        new ApiResponse(200, attachment, "Attachment uploaded successfully"),
    );
});

const updateSubtaskStatus = asyncHandler(async (req, res) => {
    const params = req.params as UpdateSubtaskStatusSchemaType["params"];
    const body = req.body as UpdateSubtaskStatusSchemaType["body"];

    const result = await updateSubtaskStatusService({
        subtaskId: params.subtaskId,
        isCompleted: body.isCompleted,
        userId: req.user._id,
        userRole: req.user.role,
    });

    res.status(200).json(
        new ApiResponse(200, result, "Subtask status updated successfully"),
    );
});

const deleteAttachment = asyncHandler(async (req, res) => {
    const params = req.params as DeleteAttachmentSchemaType["params"];
    const body = req.body as DeleteAttachmentSchemaType["body"];

    if (!body.fileId) {
        throw new ApiError(400, "File ID is required");
    }

    await deleteAttachmentFromTaskService({
        taskId: params.taskId,
        fileId: body.fileId,
    });

    res.status(200).json(
        new ApiResponse(
            200,
            { fileId: body.fileId },
            "Attachment deleted successfully",
        ),
    );
});

export {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    updateSubtaskStatus,
    assignAttachment,
    deleteAttachment,
};
