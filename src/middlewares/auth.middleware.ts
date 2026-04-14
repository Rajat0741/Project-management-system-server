import { ProjectMember } from "../models/projectmember.models.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim()

    if (!token) {
        throw new ApiError(401, "Unauthorized access")
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -emailVerificationToken -emailVerificationExpiry -refreshToken -forgotPasswordToken -forgotPasswordExpiry");
        if (!user) {
            throw new ApiError(403, "User not found")
        }
        req.user = user;
        next()
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Access Token Expired")
        }
        throw new ApiError(403, "Invalid access Token")
    }
})

const validateProjectPermission = (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        const { projectId } = req.params;

        if (!projectId) {
            throw new ApiError(400, "Project ID is required")
        }

        const project = await Project.findById(projectId);

        if (!project) {
            throw new ApiError(404, "Project not found")
        }

        const projectMember = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id)
        });

        if (!projectMember) {
            throw new ApiError(403, "You are not a member of the project")
        }

        const givenRole = projectMember.role;

        req.user.role = givenRole;

        if (!roles.includes(givenRole)) {
            throw new ApiError(
                403,
                "Forbidden: You don't have enough permission to perform this action");
        }

        next();

    })
}

export { verifyJWT, validateProjectPermission };