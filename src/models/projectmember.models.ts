import mongoose, { Schema } from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js"

const proejctMemberSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    project: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Project"
    },
    role: {
        type: String,
        enum: AvailableUserRole,
        default: UserRolesEnum.MEMBER
    }
}, { timestamps: true })

export const ProjectMember = mongoose.model("ProjectMember", proejctMemberSchema);