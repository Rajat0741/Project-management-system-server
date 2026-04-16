import { ProjectNote } from "../../models/note.models.js";
import ApiError from "../../utils/api-errors.js";
import { ensureProjectExists, toObjectId } from "../shared/index.js";
import type { Types } from "mongoose";

const getNotesService = async (projectId: string) => {
    await ensureProjectExists(projectId);

    return ProjectNote.find({
        project: toObjectId(projectId),
    }).populate("lastUpdatedBy", "username fullName avatar");
};

const getNoteByIdService = async (noteId: string) => {
    const note = await ProjectNote.findById(toObjectId(noteId)).populate(
        "lastUpdatedBy",
        "username fullName avatar",
    );

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return note;
};

const createNoteService = async (input: {
    projectId: string;
    content: string;
    userId: Types.ObjectId;
}) => {
    const { projectId, content, userId } = input;

    await ensureProjectExists(projectId);

    return ProjectNote.create({
        project: toObjectId(projectId),
        content,
        lastUpdatedBy: toObjectId(userId),
    });
};

const updateNoteService = async (input: {
    noteId: string;
    content: string;
    userId: Types.ObjectId;
}) => {
    const { noteId, content, userId } = input;

    const note = await ProjectNote.findById(toObjectId(noteId));

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    note.content = content;
    note.lastUpdatedBy = toObjectId(userId);
    await note.save();

    return note;
};

const deleteNoteService = async (noteId: string) => {
    const deletedNote = await ProjectNote.findByIdAndDelete(toObjectId(noteId));

    if (!deletedNote) {
        throw new ApiError(404, "Note not found");
    }

    return deletedNote;
};

export {
    getNotesService,
    getNoteByIdService,
    createNoteService,
    updateNoteService,
    deleteNoteService,
};
