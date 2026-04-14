import mongoose, { Schema, Document, Types } from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js"

export interface IProjectMember extends Document {
    user: Types.ObjectId;
    project: Types.ObjectId;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

const proejctMemberSchema = new Schema<IProjectMember>({
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

export const ProjectMember = mongoose.model<IProjectMember>("ProjectMember", proejctMemberSchema);