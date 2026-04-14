import { ProjectNote } from "../models/note.models.js";
import { Project } from "../models/project.models.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Get all notes for a project
const getNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(new mongoose.Types.ObjectId(projectId));

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const notes = await ProjectNote.find({
        project: new mongoose.Types.ObjectId(projectId)
    }).populate("lastUpdatedBy", "username fullName avatar");

    res.status(200).json(
        new ApiResponse(200, notes, "Notes fetched successfully")
    );
});

// Get note by ID
const getNoteById = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await ProjectNote.findById(new mongoose.Types.ObjectId(noteId))
        .populate("lastUpdatedBy", "username fullName avatar");

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    res.status(200).json(
        new ApiResponse(200, note, "Note fetched successfully")
    );
});

// Create a note
const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Note content is required");
    }

    const project = await Project.findById(new mongoose.Types.ObjectId(projectId));

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const note = await ProjectNote.create({
        project: new mongoose.Types.ObjectId(projectId),
        content,
        lastUpdatedBy: new mongoose.Types.ObjectId(req.user.userId)
    });

    res.status(201).json(
        new ApiResponse(201, note, "Note created successfully")
    );
});

// Update a note
const updateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Note content is required");
    }

    const note = await ProjectNote.findById(new mongoose.Types.ObjectId(noteId));

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    note.content = content;
    note.lastUpdatedBy = new mongoose.Types.ObjectId(req.user.userId);

    await note.save();

    res.status(200).json(
        new ApiResponse(200, note, "Note updated successfully")
    );
});

// Delete a note
const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const deletedNote = await ProjectNote.findByIdAndDelete(new mongoose.Types.ObjectId(noteId));

    if (!deletedNote) {
        throw new ApiError(404, "Note not found");
    }

    res.status(200).json(
        new ApiResponse(200, deletedNote, "Note deleted successfully")
    );
});

export {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
};
