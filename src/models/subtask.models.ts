import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubtask extends Document {
    title: string;
    task: Types.ObjectId;
    isCompleted: boolean;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const subTaskSchema = new Schema<ISubtask>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

export const Subtask = mongoose.model<ISubtask>("Subtask", subTaskSchema);