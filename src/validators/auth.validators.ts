import { z } from "zod";
import { requiredEmailSchema } from "./shared.validators.js";

export const registerSchema = z.object({
    body: z.object({
        email: requiredEmailSchema,
        username: z
            .string()
            .trim()
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
export type RegisterSchemaType = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({
    params: z.object({
        verificationToken: z
            .string()
            .trim()
            .min(1, "Verification token is required"),
    }),
});
export type VerifyEmailSchemaType = z.infer<typeof verifyEmailSchema>;

export const resendVerificationTokenSchema = z.object({
    body: z.object({
        email: requiredEmailSchema,
    }),
});
export type ResendVerificationTokenSchemaType = z.infer<
    typeof resendVerificationTokenSchema
>;

export const userLoginSchema = z.object({
    body: z.object({
        email: requiredEmailSchema,
        password: z
            .string()
            .trim()
            .min(6, "Password must be at least 6 characters long"),
    }),
});
export type UserLoginSchemaType = z.infer<typeof userLoginSchema>;

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: requiredEmailSchema,
    }),
});
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export const userChangeCurrentPasswordSchema = z.object({
    body: z.object({
        currentPassword: z
            .string()
            .trim()
            .min(1, "Old Password is required")
            .min(6, "Password must be at least 6 characters long"),
        newPassword: z
            .string()
            .trim()
            .min(8, "Password must be at least 8 characters long"),
    }),
});
export type UserChangeCurrentPasswordSchemaType = z.infer<
    typeof userChangeCurrentPasswordSchema
>;

export const userChangeForgotPasswordSchema = z.object({
    params: z.object({
        resetToken: z.string().trim().min(1, "Reset token is required"),
    }),
    body: z.object({
        newPassword: z
            .string()
            .trim()
            .min(1, "New Password is required")
            .min(8, "Password must be at least 8 characters long"),
    }),
});
export type UserChangeForgotPasswordSchemaType = z.infer<
    typeof userChangeForgotPasswordSchema
>;
