import ApiResponse from "../utils/api-response.js";
import asyncHandler from "../utils/asyncHandler.js";
import type {
    GetNotesSchemaType,
    GetNoteByIdSchemaType,
    CreateNoteSchemaType,
    UpdateNoteSchemaType,
    DeleteNoteSchemaType,
} from "../validators/note.validators.js";
import {
    getNotesService,
    getNoteByIdService,
    createNoteService,
    updateNoteService,
    deleteNoteService,
} from "../services/note/index.js";

const getNotes = asyncHandler(async (req, res) => {
    const params = req.params as GetNotesSchemaType["params"];
    const notes = await getNotesService(params.projectId);

    res.status(200).json(
        new ApiResponse(200, notes, "Notes fetched successfully"),
    );
});

const getNoteById = asyncHandler(async (req, res) => {
    const params = req.params as GetNoteByIdSchemaType["params"];
    const note = await getNoteByIdService(params.noteId);

    res.status(200).json(
        new ApiResponse(200, note, "Note fetched successfully"),
    );
});

const createNote = asyncHandler(async (req, res) => {
    const params = req.params as CreateNoteSchemaType["params"];
    const body = req.body as CreateNoteSchemaType["body"];

    const note = await createNoteService(
        params.projectId,
        body.content,
        req.user._id,
    );

    res.status(201).json(
        new ApiResponse(201, note, "Note created successfully"),
    );
});

const updateNote = asyncHandler(async (req, res) => {
    const params = req.params as UpdateNoteSchemaType["params"];
    const body = req.body as UpdateNoteSchemaType["body"];

    const note = await updateNoteService(
        params.noteId,
        body.content,
        req.user._id,
    );

    res.status(200).json(
        new ApiResponse(200, note, "Note updated successfully"),
    );
});

const deleteNote = asyncHandler(async (req, res) => {
    const params = req.params as DeleteNoteSchemaType["params"];
    const deletedNote = await deleteNoteService(params.noteId);

    res.status(200).json(
        new ApiResponse(200, deletedNote, "Note deleted successfully"),
    );
});

export { getNotes, getNoteById, createNote, updateNote, deleteNote };
