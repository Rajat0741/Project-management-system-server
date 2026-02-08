import { Tasks } from "../models/task.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Subtask } from "../models/subtask.models.js";
import { Project } from "../models/project.models.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import { TasksStatusEnum, UserRolesEnum } from "../utils/constants.js";
import {
    uploadAttachment as uploadToImageKit,
    deleteFile,
    deleteFiles,
} from "../utils/imagekit.js";
import mongoose from "mongoose";

// Get all tasks for a project
const getTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(
        new mongoose.Types.ObjectId(projectId),
    );
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    const tasks = await Tasks.find({
        project: new mongoose.Types.ObjectId(projectId),
    }).populate("assignedTo", "avatar username fullName");

    // Filter attachments to send only necessary fields
    const filteredTasks = tasks.map(task => ({
        ...task.toObject(),
        attachments: task.attachments.map(att => ({
            fileId: att.fileId,
            url: att.url,
            thumbnail: att.thumbnail
        }))
    }));

    res.status(200).json(
        new ApiResponse(200, filteredTasks, "Tasks fetched successfully"),
    );
});

// Get task by ID
const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await Tasks.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedToDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "assignedBy",
                            foreignField: "_id",
                            as: "assignedByDetails",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$assignedByDetails", 0],
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                createdBy: { $arrayElemAt: ["$assignedByDetails", 0] },
                attachments: {
                    $map: {
                        input: "$attachments",
                        as: "attachment",
                        in: {
                            fileId: "$$attachment.fileId",
                            url: "$$attachment.url",
                            thumbnail: "$$attachment.thumbnail",
                        },
                    },
                },
            },
        },
    ]);

    if (!task || task.length === 0) {
        throw new ApiError(404, "Task not found");
    }

    res.status(200).json(
        new ApiResponse(200, task[0], "Task and Subtasks fetched successfully"),
    );
});

// Create a new task
const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status, subtasks } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const assignedMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(assignedTo),
    });

    if (!assignedMember) {
        throw new ApiError(400, "Assigned user is not a member of the project");
    }

    const task = await Tasks.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: new mongoose.Types.ObjectId(assignedTo),
        assignedBy: new mongoose.Types.ObjectId(req.user.projectMemberId),
        status,
        attachments: [],
    });

    // Create subtasks if provided
    let createdSubtasks = [];
    if (subtasks && Array.isArray(subtasks) && subtasks.length > 0) {
        const subtaskDocuments = subtasks.map((subtask) => ({
            title: subtask.title,
            task: task._id,
            isCompleted: false,
            createdBy: new mongoose.Types.ObjectId(req.user.userId),
        }));

        createdSubtasks = await Subtask.insertMany(subtaskDocuments);
    }

    // Handle attachments if any
    if (req.files && req.files.length > 0) {
        const attachmentPromises = req.files.map((file) =>
            uploadToImageKit(file, projectId, task._id),
        );
        const attachments = await Promise.all(attachmentPromises);

        task.attachments = attachments;
        await task.save();
    }

    // Filter attachments before sending response
    const taskResponse = {
        ...task.toObject(),
        subtasks: createdSubtasks,
        attachments: task.attachments.map(att => ({
            fileId: att.fileId,
            url: att.url,
            thumbnail: att.thumbnail
        }))
    };

    res.status(201).json(
        new ApiResponse(
            201,
            taskResponse,
            "Task Created successfully",
        ),
    );
});

// Update a task
const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { title, description, assignedTo, status } = req.body;
    const task = await Tasks.findById(new mongoose.Types.ObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    if (assignedTo) {
        const assignedMember = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(task.project),
            user: new mongoose.Types.ObjectId(assignedTo),
        });
        if (!assignedMember) {
            throw new ApiError(
                400,
                "Assigned user is not a member of the project",
            );
        }
    }
    task.title = title || task.title;
    task.description = description || task.description;
    task.assignedTo = assignedTo
        ? new mongoose.Types.ObjectId(assignedTo)
        : task.assignedTo;
    task.status = status || task.status;

    await task.save();

    // Filter attachments before sending response
    const taskResponse = {
        ...task.toObject(),
        attachments: task.attachments.map(att => ({
            fileId: att.fileId,
            url: att.url,
            thumbnail: att.thumbnail
        }))
    };

    res.status(200).json(
        new ApiResponse(200, taskResponse, "Task updated successfully"),
    );
});

// Delete a task
const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Tasks.findById(new mongoose.Types.ObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Delete attachments from ImageKit
    if (task.attachments && task.attachments.length > 0) {
        const fileIds = task.attachments.map((att) => att.fileId);
        await deleteFiles(fileIds);
    }

    await Tasks.findByIdAndDelete(new mongoose.Types.ObjectId(taskId));

    await Subtask.deleteMany({
        task: new mongoose.Types.ObjectId(taskId),
    });

    res.status(200).json(
        new ApiResponse(200, task, "Task deleted successfully"),
    );
});

// Create a subtask
const createSubtask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Tasks.findById(new mongoose.Types.ObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const subtask = await Subtask.create({
        title,
        task: new mongoose.Types.ObjectId(taskId),
        isCompleted: false,
        createdBy: new mongoose.Types.ObjectId(req.user.userId),
    });

    res.status(201).json(
        new ApiResponse(201, subtask, "Subtask created successfully"),
    );
});

// Update a subtask
const updateSubtask = asyncHandler(async (req, res) => {
    const { subtaskId } = req.params;
    const { title, isCompleted } = req.body;

    const subtask = await Subtask.findById(
        new mongoose.Types.ObjectId(subtaskId),
    );

    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    subtask.title = title || subtask.title;
    if (isCompleted !== undefined) {
        subtask.isCompleted = isCompleted;
    }

    await subtask.save();

    res.status(200).json(
        new ApiResponse(200, subtask, "Subtask updated successfully"),
    );
});

// Delete a subtask
const deleteSubtask = asyncHandler(async (req, res) => {
    const { subtaskId } = req.params;

    const deletedSubtask = await Subtask.findByIdAndDelete(
        new mongoose.Types.ObjectId(subtaskId),
    );

    if (!deletedSubtask) {
        throw new ApiError(404, "Subtask not found");
    }

    res.status(200).json(
        new ApiResponse(200, deletedSubtask, "Subtask deleted successfully"),
    );
});

// Assign attachment to a task (single file per request)
const assignAttachment = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    if (!req.file) {
        throw new ApiError(400, "Attachment file is required");
    }

    const task = await Tasks.findById(new mongoose.Types.ObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Upload to ImageKit
    const attachmentData = await uploadToImageKit(req.file, projectId, taskId);

    // Add attachment to task
    task.attachments.push(attachmentData);
    await task.save();

    // Filter attachment data before sending response
    const filteredAttachment = {
        fileId: attachmentData.fileId,
        url: attachmentData.url,
        thumbnail: attachmentData.thumbnail
    };

    res.status(200).json(
        new ApiResponse(
            200,
            filteredAttachment,
            "Attachment uploaded successfully",
        ),
    );
});

// Update subtask status and auto-update parent task status
const updateSubtaskStatus = asyncHandler(async (req, res) => {
    const { subtaskId } = req.params;
    const { isCompleted } = req.body;

    const subtask = await Subtask.findById(new mongoose.Types.ObjectId(subtaskId));

    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    // Get the parent task to check permissions
    const task = await Tasks.findById(subtask.task);

    if (!task) {
        throw new ApiError(404, "Parent task not found");
    }

    // Only the assigned member or admin/project_admin can update subtask status
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
    const isAdmin = [UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN].includes(req.user.role);

    if (!isAssigned && !isAdmin) {
        throw new ApiError(403, "Only the assigned member or an admin can update subtask status");
    }

    subtask.isCompleted = isCompleted;
    await subtask.save();

    // Auto-update parent task status based on subtask completion
    const allSubtasks = await Subtask.find({ task: subtask.task });
    const completedCount = allSubtasks.filter((s) => s.isCompleted).length;

    let newTaskStatus;
    if (completedCount === 0) {
        newTaskStatus = TasksStatusEnum.TODO;
    } else if (completedCount === allSubtasks.length) {
        newTaskStatus = TasksStatusEnum.DONE;
    } else {
        newTaskStatus = TasksStatusEnum.IN_PROGRESS;
    }

    await Tasks.findByIdAndUpdate(subtask.task, { status: newTaskStatus });

    res.status(200).json(
        new ApiResponse(
            200,
            { subtask, taskStatus: newTaskStatus },
            "Subtask status updated successfully",
        ),
    );
});

// Delete attachment from a task
const deleteAttachment = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { fileId } = req.body;

    if (!fileId) {
        throw new ApiError(400, "File ID is required");
    }

    const task = await Tasks.findById(new mongoose.Types.ObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const attachmentIndex = task.attachments.findIndex(
        (att) => att.fileId === fileId,
    );

    if (attachmentIndex === -1) {
        throw new ApiError(404, "Attachment not found");
    }

    // Delete from ImageKit
    await deleteFile(fileId);

    // Remove from task
    task.attachments.splice(attachmentIndex, 1);
    await task.save();

    res.status(200).json(
        new ApiResponse(200, { fileId }, "Attachment deleted successfully"),
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
