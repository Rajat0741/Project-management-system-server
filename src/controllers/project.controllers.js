import { User } from "../models/user.models.js"
import { Project } from "../models/project.models.js"
import { ProjectMember } from "../models/projectmember.models.js"
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {

    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "Project",
                localField: "project",
                foreignField: "_id",
                as: "projects",
                pipeline: [
                    {
                        $lookup: {
                            from: "ProjectMember",
                            localField: "_id",
                            foreignField: "project",
                            as: "projectmembers",
                        }
                    },
                    {
                        $addFields: {
                            members: {
                                $size: "$projectmembers"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$project"
        },
        {
            $project: {
                project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdBy: 1,
                    createdAt: 1,
                },
                role: 1,
                _id: 0
            }
        }
    ])

    res.status(200).json(
        new ApiResponse(200, projects, "Projects fetched successfully")
    )

})

const getProjectById = asyncHandler(async (req, res) => {

});

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id)
    });

    await ProjectMember.create(
        {
            user: new mongoose.Types.ObjectId(req.user._id),
            project: new mongoose.Types.ObjectId(project._id),
            role: UserRolesEnum.ADMIN
        }
    )

    res.status(201).json(
        new ApiResponse(201, project, "Project Created Successfully")
    )
})

const updateProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const { projectId } = req.params

    const project = await Project.findByIdAndUpdate(
        projectId, {
        name,
        description
    })

    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    res.status(200).json(
        new ApiResponse(200, project, "Project updated successfully")
    )

})
    ;
const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    // Will write method to delete project members later on  

    res.status(200).json(
        new ApiResponse(200, project, "Project deleted successfully")
    )

})

const addMembersToProject = asyncHandler(async (req, res) => {

})

const getProjectMembers = asyncHandler(async (req, res) => {

})

const updateMemberRole = asyncHandler(async (req, res) => {

})

const deleteMember = asyncHandler(async (req, res) => {

})

export {
    addMembersToProject,
    createProject,
    getProjectById,
    getProjectMembers,
    getProjects,
    updateMemberRole,
    deleteMember,
    updateProject,
    deleteProject
}