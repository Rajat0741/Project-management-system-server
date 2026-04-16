import { z } from "zod";
import {
    projectIdParamsSchema,
    projectAndUserIdParamsSchema,
    requiredEmailSchema,
    roleSchema,
} from "./shared.validators.js";

export const getProjectByIdSchema = z.object({
    params: projectIdParamsSchema,
});
export type GetProjectByIdSchemaType = z.infer<typeof getProjectByIdSchema>;

export const createProjectSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "Project name is required"),
        description: z.string().trim().optional(),
    }),
});
export type CreateProjectSchemaType = z.infer<typeof createProjectSchema>;

export const addMemberToProjectSchema = z.object({
    params: projectIdParamsSchema,
    body: z.object({
        email: requiredEmailSchema,
        role: roleSchema,
    }),
});
export type AddMemberToProjectSchemaType = z.infer<
    typeof addMemberToProjectSchema
>;

export const getProjectMembersSchema = z.object({
    params: projectIdParamsSchema,
});
export type GetProjectMembersSchemaType = z.infer<
    typeof getProjectMembersSchema
>;

export const leaveProjectSchema = z.object({
    params: projectIdParamsSchema,
});
export type LeaveProjectSchemaType = z.infer<typeof leaveProjectSchema>;

export const updateMemberRoleSchema = z.object({
    params: projectAndUserIdParamsSchema,
    body: z.object({
        role: roleSchema,
    }),
});
export type UpdateMemberRoleSchemaType = z.infer<typeof updateMemberRoleSchema>;

export const deleteMemberSchema = z.object({
    params: projectAndUserIdParamsSchema,
});
export type DeleteMemberSchemaType = z.infer<typeof deleteMemberSchema>;

export const updateProjectSchema = z.object({
    params: projectIdParamsSchema,
    body: z.object({
        name: z.string().trim().min(1, "Project name is required"),
        description: z.string().trim().optional(),
    }),
});
export type UpdateProjectSchemaType = z.infer<typeof updateProjectSchema>;

export const deleteProjectSchema = z.object({
    params: projectIdParamsSchema,
});
export type DeleteProjectSchemaType = z.infer<typeof deleteProjectSchema>;
