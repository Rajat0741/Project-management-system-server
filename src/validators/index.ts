import { z } from "zod";
import { AvailableTaskStatuses, AvailableUserRole } from "../utils/constants.js";

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const mongoIdSchema = (fieldName: string) =>
    z
        .string()
        .trim()
        .min(1, `${fieldName} is required`)
        .regex(mongoIdRegex, `Invalid ${fieldName}`)

const projectIdParamsSchema = z.object({
    projectId: mongoIdSchema("Project ID"),
});

const projectAndUserIdParamsSchema = projectIdParamsSchema.extend({
    userId: mongoIdSchema("User ID"),
});

const projectAndTaskIdParamsSchema = projectIdParamsSchema.extend({
    taskId: mongoIdSchema("Task ID"),
});

const projectTaskAndSubtaskIdParamsSchema = projectAndTaskIdParamsSchema.extend({
    subtaskId: mongoIdSchema("Subtask ID"),
});

const projectAndNoteIdParamsSchema = projectIdParamsSchema.extend({
    noteId: mongoIdSchema("Note ID"),
});

const requiredEmailSchema = z
    .email("Email is invalid")
    .trim()
    .min(1, "Email is required")

const roleSchema = z
    .string()
    .trim()
    .min(1, "Role is required")
    .refine((value) => AvailableUserRole.includes(value), {
        message: "Invalid role",
    });

const statusSchema = z
    .string()
    .trim()
    .refine((value) => AvailableTaskStatuses.includes(value), {
        message: "Invalid status",
    });

export const registerSchema = z.object({
    body: z.object({
        email: requiredEmailSchema,
        username: z
            .string()
            .trim()
            .min(1, "Username is required")
            .refine((value) => value === value.toLowerCase(), {
                message: "Username should be in lowercase",
            })
            .min(3, "Username must be at least 3 characters long"),
        password: z
            .string()
            .trim()
            .min(8, "Password must be at least 8 characters long"),
        fullName: z.string().trim().optional(),
    }),
});

export const verifyEmailSchema = z.object({
    params: z.object({
        verificationToken: z
            .string()
            .trim()
            .min(1, "Verification token is required"),
    }),
});

export const resendVerificationTokenSchema = z.object({
    body: z.object({
        email: requiredEmailSchema,
    }),
});

export const userLoginSchema = z.object({
    body: z.object({
        email: requiredEmailSchema,
        password: z
            .string()
            .trim()
            .min(6, "Password must be at least 6 characters long"),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: requiredEmailSchema,
    }),
});

export const userChangeCurrentPasswordSchema = z.object({
    body: z.object({
        currentPassword: z
            .string()
            .trim()
            .min(1, "Old Password is required")
            .min(6, "Password must be atleast 6 characters long"),
        newPassword: z
            .string()
            .trim()
            .min(1, "New Password is required")
            .min(6, "Password must be atleast 6 characters long"),
    }),
});

export const userChangeForgotPasswordSchema = z.object({
    params: z.object({
        resetToken: z
            .string()
            .trim()
            .min(1, "Reset token is required"),
    }),
    body: z.object({
        newPassword: z
            .string()
            .trim()
            .min(1, "New Password is required")
            .min(6, "Password must be atleast 6 characters long"),
    }),
});

export const getProjectByIdSchema = z.object({
    params: projectIdParamsSchema,
});

export const createProjectSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "Project name is required"),
        description: z.string().trim().optional(),
    }),
});

export const addMemberToProjectSchema = z.object({
    params: projectIdParamsSchema,
    body: z.object({
        email: requiredEmailSchema,
        role: roleSchema,
    }),
});

export const getProjectMembersSchema = z.object({
    params: projectIdParamsSchema,
});

export const leaveProjectSchema = z.object({
    params: projectIdParamsSchema,
});

export const updateMemberRoleSchema = z.object({
    params: projectAndUserIdParamsSchema,
    body: z.object({
        role: roleSchema,
    }),
});

export const deleteMemberSchema = z.object({
    params: projectAndUserIdParamsSchema,
});

export const updateProjectSchema = z.object({
    params: projectIdParamsSchema,
    body: z.object({
        name: z.string().trim().min(1, "Project name is required"),
        description: z.string().trim().optional(),
    }),
});

export const deleteProjectSchema = z.object({
    params: projectIdParamsSchema,
});

export const getTasksSchema = z.object({
    params: projectIdParamsSchema,
});

export const getTaskByIdSchema = z.object({
    params: projectAndTaskIdParamsSchema,
});

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
    }),
});

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

export const deleteTaskSchema = z.object({
    params: projectAndTaskIdParamsSchema,
});

export const assignAttachmentSchema = z.object({
    params: projectAndTaskIdParamsSchema,
});

export const deleteAttachmentSchema = z.object({
    params: projectAndTaskIdParamsSchema,
    body: z.object({
        fileId: z
            .string()
            .trim()
            .min(1, "File ID is required"),
    }),
});

export const createSubtaskSchema = z.object({
    params: projectAndTaskIdParamsSchema,
    body: z.object({
        title: z.string().trim().min(1, "Subtask title is required"),
    }),
});

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

export const deleteSubtaskSchema = z.object({
    params: projectTaskAndSubtaskIdParamsSchema,
});

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

export const updateSubtaskStatusSchema = z.object({
    params: projectTaskAndSubtaskIdParamsSchema,
    body: z.object({
        isCompleted: z.boolean({
            message: "isCompleted must be a boolean value",
        }),
    }),
});

export const getNotesSchema = z.object({
    params: projectIdParamsSchema,
});

export const getNoteByIdSchema = z.object({
    params: projectAndNoteIdParamsSchema,
});

export const createNoteSchema = z.object({
    params: projectIdParamsSchema,
    body: z.object({
        content: z
            .string()
            .trim()
            .min(1, "Note content is required"),
    }),
});

export const updateNoteSchema = z.object({
    params: projectAndNoteIdParamsSchema,
    body: z.object({
        content: z
            .string()
            .trim()
            .min(1, "Note content is required"),
    }),
});

export const deleteNoteSchema = z.object({
    params: projectAndNoteIdParamsSchema,
});