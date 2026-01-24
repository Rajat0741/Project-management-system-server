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
    Status: {
        type: String,
        enum: AvailableTaskStatuses,
        default: TasksStatusEnum.TODO
    },
    attachmants: {
        type: [{
            url: { 
                type: String, required: true 
            },
            mimetype: { 
                type: String 
            },
            size: { 
                type: number 
            }
        }],
        default: []
    }
}, { timestamps: true })

export const Tasks = mongoose.model("Task", taskSchema);