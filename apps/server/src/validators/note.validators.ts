import { z } from "zod";
import {
    projectIdParamsSchema,
    projectAndNoteIdParamsSchema,
} from "./shared.validators.js";

export const getNotesSchema = z.object({
    params: projectIdParamsSchema,
});
export type GetNotesSchemaType = z.infer<typeof getNotesSchema>;

export const getNoteByIdSchema = z.object({
    params: projectAndNoteIdParamsSchema,
});
export type GetNoteByIdSchemaType = z.infer<typeof getNoteByIdSchema>;

export const createNoteSchema = z.object({
    params: projectIdParamsSchema,
    body: z.object({
        content: z.string().trim().min(1, "Note content is required"),
    }),
});
export type CreateNoteSchemaType = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
    params: projectAndNoteIdParamsSchema,
    body: z.object({
        content: z.string().trim().min(1, "Note content is required"),
    }),
});
export type UpdateNoteSchemaType = z.infer<typeof updateNoteSchema>;

export const deleteNoteSchema = z.object({
    params: projectAndNoteIdParamsSchema,
});
export type DeleteNoteSchemaType = z.infer<typeof deleteNoteSchema>;
