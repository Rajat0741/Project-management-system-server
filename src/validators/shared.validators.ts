import { z } from "zod";
import {
    AvailableTaskStatuses,
    AvailableUserRole,
} from "../utils/constants.js";

export const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const mongoIdSchema = (fieldName: string) =>
    z
        .string()
        .trim()
        .min(1, `${fieldName} is required`)
        .regex(mongoIdRegex, `Invalid ${fieldName}`);

export const projectIdParamsSchema = z.object({
    projectId: mongoIdSchema("Project ID"),
});

export const projectAndUserIdParamsSchema = projectIdParamsSchema.extend({
    userId: mongoIdSchema("User ID"),
});

export const projectAndTaskIdParamsSchema = projectIdParamsSchema.extend({
    taskId: mongoIdSchema("Task ID"),
});

export const projectTaskAndSubtaskIdParamsSchema =
    projectAndTaskIdParamsSchema.extend({
        subtaskId: mongoIdSchema("Subtask ID"),
    });

export const projectAndNoteIdParamsSchema = projectIdParamsSchema.extend({
    noteId: mongoIdSchema("Note ID"),
});

export const requiredEmailSchema = z
    .email("Email is invalid")
    .trim()
    .min(1, "Email is required");

export const roleSchema = z
    .string()
    .trim()
    .min(1, "Role is required")
    .refine((value) => AvailableUserRole.includes(value), {
        message: "Invalid role",
    });

export const statusSchema = z
    .string()
    .trim()
    .refine((value) => AvailableTaskStatuses.includes(value), {
        message: "Invalid status",
    });
