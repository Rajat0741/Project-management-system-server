import { ProjectNote } from "../../models/note.models.js";
import ApiError from "../../utils/api-errors.js";
import { toObjectId } from "../shared/index.js";
import type { Types } from "mongoose";

const getNotesService = async (projectId: string) => {
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

const createNoteService = async (
    projectId: string,
    content: string,
    userId: Types.ObjectId,
) => {
    return ProjectNote.create({
        project: toObjectId(projectId),
        content,
        lastUpdatedBy: toObjectId(userId),
    });
};

const updateNoteService = async (
    noteId: string,
    content: string,
    userId: Types.ObjectId,
) => {
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
    const note = await ProjectNote.findByIdAndDelete(toObjectId(noteId));

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return note;
};

export {
    getNotesService,
    getNoteByIdService,
    createNoteService,
    updateNoteService,
    deleteNoteService,
};
