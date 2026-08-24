import { Tasks } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";
import { ProjectNote } from "../models/note.models.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import { toObjectId } from "../services/shared/index.js";

/**
 * Validates that `:taskId` belongs to `:projectId`.
 * Throws 404 if the task does not exist within the given project (IDOR guard).
 *
 * Requires: `:projectId` and `:taskId` route params.
 */
const validateTaskOwnership = asyncHandler(async (req, _res, next) => {
    const projectId = req.params.projectId as string;
    const taskId = req.params.taskId as string;

    const exists = await Tasks.exists({
        _id: toObjectId(taskId),
        project: toObjectId(projectId),
    });

    if (!exists) {
        throw new ApiError(404, "Task not found");
    }

    next();
});

/**
 * Validates that `:subtaskId` belongs to `:taskId`.
 * Throws 404 if the subtask does not exist within the given task (IDOR guard).
 *
 * Requires: `:taskId` and `:subtaskId` route params.
 * Must run after `validateTaskOwnership`.
 */
const validateSubtaskOwnership = asyncHandler(async (req, _res, next) => {
    const taskId = req.params.taskId as string;
    const subtaskId = req.params.subtaskId as string;

    const exists = await Subtask.exists({
        _id: toObjectId(subtaskId),
        task: toObjectId(taskId),
    });

    if (!exists) {
        throw new ApiError(404, "Subtask not found");
    }

    next();
});

/**
 * Validates that `:noteId` belongs to `:projectId`.
 * Throws 404 if the note does not exist within the given project (IDOR guard).
 *
 * Requires: `:projectId` and `:noteId` route params.
 */
const validateNoteOwnership = asyncHandler(async (req, _res, next) => {
    const projectId = req.params.projectId as string;
    const noteId = req.params.noteId as string;

    const exists = await ProjectNote.exists({
        _id: toObjectId(noteId),
        project: toObjectId(projectId),
    });

    if (!exists) {
        throw new ApiError(404, "Note not found");
    }

    next();
});

export { validateTaskOwnership, validateSubtaskOwnership, validateNoteOwnership };
