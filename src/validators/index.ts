import { z } from "zod";
import { AvailableTaskStatuses, AvailableUserRole } from "../utils/constants.js";

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

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
            .min(3, "Username must be atleast 3 characters long"),
        password: z
            .string()
            .trim()
            .min(8, "Password must be atleast 8 characters long"),
        fullName: z.string().trim().optional(),
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
            .min(6, "Password must be atleast 6 characters long"),
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
    body: z.object({
        newPassword: z
            .string()
            .trim()
            .min(1, "New Password is required")
            .min(6, "Password must be atleast 6 characters long"),
    }),
});

export const createProjectSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "Project name is required"),
        description: z.string().trim().optional(),
    }),
});

export const addMemberToProjectSchema = z.object({
    body: z.object({
        email: requiredEmailSchema,
        role: roleSchema,
    }),
});

export const updateMemberRoleSchema = z.object({
    body: z.object({
        role: roleSchema,
    }),
});

export const updateProjectSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "Project name is required"),
        description: z.string().trim().optional(),
    }),
});

export const createTaskSchema = z.object({
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

export const createSubtaskSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1, "Subtask title is required"),
    }),
});

export const updateSubtaskSchema = z.object({
    body: z.object({
        title: z.string().trim().optional(),
        isCompleted: z
            .boolean({
                message: "isCompleted must be a boolean value",
            })
            .optional(),
    }),
});

export const updateTaskStatusSchema = z.object({
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
    body: z.object({
        isCompleted: z.boolean({
            message: "isCompleted must be a boolean value",
        }),
    }),
});