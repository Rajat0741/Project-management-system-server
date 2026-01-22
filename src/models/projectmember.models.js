import mongoose, { Schema } from "mongoose";
import { AvailableUserRole, UserRoleEnum } from "../utils/constants"

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
        default: UserRoleEnum.MEMBER
    }
}, { timestamps: true })

export const ProjectMember = mongoose.model("ProjectMember", proejctMemberSchema);