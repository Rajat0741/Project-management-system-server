import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProjectNote extends Document {
    project: Types.ObjectId;
    lastUpdatedBy: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const projectNoteSchema = new Schema<IProjectNote>({
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    lastUpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true })

export const ProjectNote = mongoose.model<IProjectNote>("ProjectNote", projectNoteSchema)