import mongoose, { Schema, Document, Types } from "mongoose";
import { AvailableTaskStatuses, TasksStatusEnum } from "../utils/constants.js"

export interface IAttachment {
    fileId: string;
    url: string;
    filePath: string;
    thumbnail?: string;
}

export interface ITask extends Document {
    title: string;
    description?: string;
    project: Types.ObjectId;
    assignedTo?: Types.ObjectId;
    assignedBy?: Types.ObjectId;
    status: string;
    attachments: IAttachment[];
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        enum: AvailableTaskStatuses,
        default: TasksStatusEnum.TODO
    },
    attachments: {
        type: [
            {
                fileId: {
                    type: String,
                    required: true
                },
                url: {
                    type: String,
                    required: true
                },
                filePath: {
                    type: String,
                    required: true
                },
                thumbnail: {
                    type: String
                }
            }
        ],
        default: []
    }
}, { timestamps: true })

export const Tasks = mongoose.model<ITask>("Task", taskSchema);