import type { Types } from "mongoose";
import { User } from "../../models/user.models.js";
import { ProjectMember } from "../../models/projectmember.models.js";
import { Tasks } from "../../models/task.models.js";
import ApiError from "../../utils/api-errors.js";
import { UserRolesEnum } from "../../utils/constants.js";
import { toObjectId } from "../shared/index.js";
import { deleteTaskAttachmentsByTaskIdsService } from "../task/attachment.service.js";
import { deleteSubtasksByTaskIdsService } from "../task/subtask.service.js";

const addMemberToProjectService = async (input: {
    projectId: string;
    email: string;
    role: string;
}) => {
    const { projectId, email, role } = input;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const projectMemberExists = await ProjectMember.findOne({
        user: user._id,
        project: projectId,
    });

    if (projectMemberExists) {
        throw new ApiError(400, "User is already a member of this project");
    }

    return ProjectMember.create({
        user: toObjectId(user._id),
        project: toObjectId(projectId),
        role,
    });
};

const updateMemberRoleService = async (input: {
    projectId: string;
    userId: string;
    role: string;
}) => {
    const { projectId, userId, role } = input;

    const projectMember = await ProjectMember.findOneAndUpdate(
        {
            project: toObjectId(projectId),
            user: toObjectId(userId),
        },
        {
            role,
        },
        {
            new: true,
        },
    );

    if (!projectMember) {
        throw new ApiError(404, "Project member not found");
    }

    return projectMember;
};

const deleteMemberService = async (input: {
    projectId: string;
    userId: string;
}) => {
    const { projectId, userId } = input;

    const deletedMember = await ProjectMember.findOneAndDelete({
        project: toObjectId(projectId),
        user: toObjectId(userId),
    });

    if (!deletedMember) {
        throw new ApiError(404, "Project member not found");
    }

    return deletedMember;
};

const leaveProjectService = async (input: {
    projectId: string;
    userId: Types.ObjectId;
}) => {
    const { projectId, userId } = input;

    const projectMember = await ProjectMember.findOne({
        project: toObjectId(projectId),
        user: toObjectId(userId),
    });

    if (!projectMember) {
        throw new ApiError(404, "You are not a member of this project");
    }

    if (projectMember.role === UserRolesEnum.ADMIN) {
        const adminCount = await ProjectMember.countDocuments({
            project: toObjectId(projectId),
            role: UserRolesEnum.ADMIN,
        });

        if (adminCount === 1) {
            throw new ApiError(
                400,
                "You are the only admin of this project. You cannot leave the project unless you assign another admin or delete the project.",
            );
        }
    }

    const tasksToDelete = await Tasks.find({
        project: toObjectId(projectId),
        assignedTo: toObjectId(userId),
    }).select("_id");

    const taskIds = tasksToDelete.map((task) => task._id.toString());

    await deleteTaskAttachmentsByTaskIdsService(taskIds);
    await deleteSubtasksByTaskIdsService(tasksToDelete.map((task) => task._id));

    await Tasks.deleteMany({
        project: toObjectId(projectId),
        assignedTo: toObjectId(userId),
    });

    await projectMember.deleteOne();
};

export {
    addMemberToProjectService,
    updateMemberRoleService,
    deleteMemberService,
    leaveProjectService,
};
