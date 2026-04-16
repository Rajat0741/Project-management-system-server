import { ProjectMember } from "../models/projectmember.models.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { NextFunction, Request, Response } from "express";

const verifyJWT = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
    const token = req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer", "").trim();

    if (!token) {
        throw new ApiError(401, "Unauthorized access");
    }

    let decodedToken: JwtPayload;
    try {
        decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === "TokenExpiredError") {
            throw new ApiError(401, "Access Token Expired");
        }
        throw new ApiError(403, "Invalid access Token");
    }

    if (!decodedToken._id || typeof decodedToken._id !== "string") {
        throw new ApiError(403, "Invalid access token payload");
    }

    const user = await User.findById(decodedToken._id as string)
        .select("-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry");
    if (!user) {
        throw new ApiError(403, "User not found");
    }

    req.user = user;
    next();
});

const validateProjectPermission = (roles: string[] = []) => {
    return asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
        const projectId = req.params.projectId as string;

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