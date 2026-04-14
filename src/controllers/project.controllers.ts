import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Tasks } from "../models/task.models.js";
import { deleteFiles } from "../utils/imagekit.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import {
    AvailableTaskStatuses,
    AvailableUserRole,
    UserRolesEnum,
} from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "projects",
                pipeline: [
                    {
                        $lookup: {
                            from: "projectmembers",
                            localField: "_id",
                            foreignField: "project",
                            as: "projectmembers",
                        },
                    },
                    {
                        $addFields: {
                            members: {
                                $size: "$projectmembers",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$projects",
        },
        {
            $project: {
                projects: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdBy: 1,
                    createdAt: 1,
                },
                role: 1,
                _id: 0,
            },
        },
    ]);

    res.status(200).json(
        new ApiResponse(200, projects, "Projects fetched successfully"),
    );
});

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    res.status(200).json(
        new ApiResponse(200, project, "Project fetched successfully"),
    );
});

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    });

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN,
    });

    res.status(201).json(
        new ApiResponse(201, project, "Project Created Successfully"),
    );
});

const updateProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        {
            new: true,
        },
    );

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    res.status(200).json(
        new ApiResponse(200, project, "Project updated successfully"),
    );
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    await ProjectMember.deleteMany({
        project: new mongoose.Types.ObjectId(projectId),
    });

    res.status(200).json(
        new ApiResponse(200, project, "Project deleted successfully"),
    );
});

const addMemberToProject = asyncHandler(async (req, res) => {
    const { email, role } = req.body;
    const { projectId } = req.params;

    const user = await User.findOne({
        email,
    });

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

    const projectMember = await ProjectMember.create({
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId),
        role,
    });

    res.status(201).json(
        new ApiResponse(
            201,
            projectMember,
            "Member added to project successfully",
        ),
    );
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const projectMembers = await ProjectMember.aggregate([
        // Match project members by projectId to get members of specific project
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        // Join ProjectMembers with User collection to get user details
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            email: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        // Unwind the user array to get a single user object in the ProjectMember document
        {
            $addFields: {
                user: { $arrayElemAt: ["$user", 0] },
            },
        },
        // Project only necessary fields
        {
            $project: {
                _id: 0,
                user: 1,
                project: 1,
                role: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    res.status(200).json(
        new ApiResponse(
            200,
            projectMembers,
            "Project members fetched successfully",
        ),
    );
});

const updateMemberRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const { projectId, userId } = req.params;

    const projectMember = await ProjectMember.findOneAndUpdate(
        {
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(userId),
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

    res.status(200).json(
        new ApiResponse(
            200,
            projectMember,
            "Project member role updated successfully",
        ),
    );
});

const deleteMember = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;

    const deletedMember = await ProjectMember.findOneAndDelete({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId),
    });

    if (!deletedMember) {
        throw new ApiError(404, "Project member not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            deletedMember,
            "Project member deleted successfully",
        ),
    );
});

const leaveProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const projectMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId),
    });

    if (!projectMember) {
        throw new ApiError(404, "You are not a member of this project");
    }

    if (projectMember.role === UserRolesEnum.ADMIN) {
        const adminCount = await ProjectMember.countDocuments({
            project: new mongoose.Types.ObjectId(projectId),
            role: UserRolesEnum.ADMIN,
        });

        if (adminCount === 1) {
            throw new ApiError(
                400,
                "You are the only admin of this project. You cannot leave the project unless you assign another admin or delete the project.",
            );
        }
    }

    // Find tasks assigned to the user in this project to clean up attachments
    const tasksToDelete = await Tasks.find({
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: new mongoose.Types.ObjectId(userId),
    });

    // Collect all file IDs from these tasks
    const fileIdsToDelete = tasksToDelete.reduce((acc, task) => {
        if (task.attachments && task.attachments.length > 0) {
            const ids = task.attachments.map((att) => att.fileId);
            return [...acc, ...ids];
        }
        return acc;
    }, []);

    // Delete files from ImageKit if any exist
    if (fileIdsToDelete.length > 0) {
        await deleteFiles(fileIdsToDelete);
    }

    // Delete the tasks
    await Tasks.deleteMany({
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: new mongoose.Types.ObjectId(userId),
    });

    // Delete the project member record
    await projectMember.deleteOne();

    res.status(200).json(
        new ApiResponse(200, {}, "You have left the project successfully"),
    );
});

export {
    addMemberToProject,
    createProject,
    getProjectById,
    getProjectMembers,
    getProjects,
    updateMemberRole,
    deleteMember,
    updateProject,
    deleteProject,
    leaveProject,
};
