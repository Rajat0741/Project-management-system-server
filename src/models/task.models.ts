import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatuses, TasksStatusEnum } from "../utils/constants.js"

const taskSchema = new Schema({
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

export const Tasks = mongoose.model("Task", taskSchema);