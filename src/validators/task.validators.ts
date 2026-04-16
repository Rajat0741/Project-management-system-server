import { z } from "zod";
import { AvailableTaskStatuses } from "../utils/constants.js";
import {
    projectIdParamsSchema,
    projectAndTaskIdParamsSchema,
    projectTaskAndSubtaskIdParamsSchema,
    mongoIdRegex,
    statusSchema,
} from "./shared.validators.js";

export const getTasksSchema = z.object({
    params: projectIdParamsSchema,
});
export type GetTasksSchemaType = z.infer<typeof getTasksSchema>;

export const getTaskByIdSchema = z.object({
    params: projectAndTaskIdParamsSchema,
});
export type GetTaskByIdSchemaType = z.infer<typeof getTaskByIdSchema>;

export const createTaskSchema = z.object({
    params: projectIdParamsSchema,
    body: z.object({
        title: z.string().trim().min(1, "Task title is required"),
        description: z.string().trim().optional(),
        assignedTo: z
            .string()
            .trim()
            .min(1, "Assigned Member is required")
            .regex(mongoIdRegex, "Invalid Project Member ID"),
        status: statusSchema.optional(),
        subtasks: z
            .string()
            .transform((str, ctx) => {
                try {
                    return JSON.parse(str);
                } catch (e) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Invalid JSON string",
                    });
                    return z.NEVER;
                }
            })
            .pipe(
                z.array(
                    z.object({
                        title: z
                            .string()
                            .trim()
                            .min(1, "Subtask title is required"),
                    }),
                ),
            )
            .or(
                z.array(
                    z.object({
                        title: z
                            .string()
                            .trim()
                            .min(1, "Subtask title is required"),
                    }),
                ),
            )
            .optional(),
    }),
});
export type CreateTaskSchemaType = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
    params: projectAndTaskIdParamsSchema,
    body: z.object({
        title: z.string().trim().optional(),
        description: z.string().trim().optional(),
        assignedTo: z
            .string()
            .trim()
            .regex(mongoIdRegex, "Invalid Project Member ID")
            .optional(),
        status: statusSchema.optional(),
    }),
});
export type UpdateTaskSchemaType = z.infer<typeof updateTaskSchema>;

export const deleteTaskSchema = z.object({
    params: projectAndTaskIdParamsSchema,
});
export type DeleteTaskSchemaType = z.infer<typeof deleteTaskSchema>;

export const assignAttachmentSchema = z.object({
    params: projectAndTaskIdParamsSchema,
});
export type AssignAttachmentSchemaType = z.infer<typeof assignAttachmentSchema>;

export const deleteAttachmentSchema = z.object({
    params: projectAndTaskIdParamsSchema,
    body: z.object({
        fileId: z.string().trim().min(1, "File ID is required"),
    }),
});
export type DeleteAttachmentSchemaType = z.infer<typeof deleteAttachmentSchema>;

export const createSubtaskSchema = z.object({
    params: projectAndTaskIdParamsSchema,
    body: z.object({
        title: z.string().trim().min(1, "Subtask title is required"),
    }),
});
export type CreateSubtaskSchemaType = z.infer<typeof createSubtaskSchema>;

export const updateSubtaskSchema = z.object({
    params: projectTaskAndSubtaskIdParamsSchema,
    body: z.object({
        title: z.string().trim().optional(),
        isCompleted: z
            .boolean({
                message: "isCompleted must be a boolean value",
            })
            .optional(),
    }),
});
export type UpdateSubtaskSchemaType = z.infer<typeof updateSubtaskSchema>;

export const deleteSubtaskSchema = z.object({
    params: projectTaskAndSubtaskIdParamsSchema,
});
export type DeleteSubtaskSchemaType = z.infer<typeof deleteSubtaskSchema>;

export const updateTaskStatusSchema = z.object({
    params: projectAndTaskIdParamsSchema,
    body: z.object({
        status: z
            .string()
            .trim()
            .min(1, "Status is required")
            .refine((value) => AvailableTaskStatuses.includes(value), {
                message: "Invalid status",
            }),
    }),
});
export type UpdateTaskStatusSchemaType = z.infer<typeof updateTaskStatusSchema>;

export const updateSubtaskStatusSchema = z.object({
    params: projectTaskAndSubtaskIdParamsSchema,
    body: z.object({
        isCompleted: z.boolean({
            message: "isCompleted must be a boolean value",
        }),
    }),
});
export type UpdateSubtaskStatusSchemaType = z.infer<
    typeof updateSubtaskStatusSchema
>;
