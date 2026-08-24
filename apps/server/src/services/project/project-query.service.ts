import { Project } from "../../models/project.models.js";
import { ProjectMember } from "../../models/projectmember.models.js";
import ApiError from "../../utils/api-errors.js";
import { toObjectId } from "../shared/index.js";
import type { Types } from "mongoose";

const getProjectsService = async (userId: Types.ObjectId) => {
    return ProjectMember.aggregate([
        {
            $match: {
                user: toObjectId(userId),
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
};

const getProjectByIdService = async (projectId: string) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return project;
};

const getProjectMembersService = async (projectId: string) => {
    return ProjectMember.aggregate([
        {
            $match: {
                project: toObjectId(projectId),
            },
        },
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
        {
            $addFields: {
                user: { $arrayElemAt: ["$user", 0] },
            },
        },
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
};

export { getProjectsService, getProjectByIdService, getProjectMembersService };
