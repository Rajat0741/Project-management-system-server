import { User } from "../models/user.models.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail,
} from "../utils/mail.js";
import {
    uploadAvatar as uploadAvatarToImageKit,
    deleteFile,
} from "../utils/imagekit.js";
import { env } from "../config/env.js";
import crypto from "crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import type {
    RegisterSchemaType,
    VerifyEmailSchemaType,
    ResendVerificationTokenSchemaType,
    UserLoginSchemaType,
    ForgotPasswordSchemaType,
    UserChangeCurrentPasswordSchemaType,
    UserChangeForgotPasswordSchemaType,
} from "../validators/auth.validators.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
};

const generateAccessAndRefreshToken = async (userId: Types.ObjectId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token",
        );
    }
};

const registerUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body as RegisterSchemaType["body"];
        const { email, username, password, fullName } = body;

        const existedUser = await User.findOne({ email });

        if (existedUser) {
            throw new ApiError(409, "User already exists");
        }

        const userNameCheck = await User.findOne({ username });

        if (userNameCheck) {
            throw new ApiError(
                409,
                "Username already taken, please choose another username",
            );
        }

        const user = await User.create({
            email,
            password,
            username,
            fullName,
            isEmailVerified: false,
        });

        const { unHashedToken, hashedToken, tokenExpiry } =
            user.generateTemporaryToken();

        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpiry = new Date(tokenExpiry);

        await user.save({ validateBeforeSave: false });

        try {
            await sendEmail({
                email: user?.email,
                subject: "Please verify your Email",
                mailgenContent: emailVerificationMailgenContent(
                    user.username,
                    `${env.EMAIL_VERIFICATION_URL}/${unHashedToken}`,
                ),
            });
        } catch (emailError: unknown) {
            // Rollback: Remove the user if email fails
            await User.findByIdAndDelete(user._id);
            const message =
                emailError instanceof Error
                    ? emailError.message
                    : "Unknown error";
            throw new ApiError(
                500,
                `User registered but failed to send verification email: ${message}`,
            );
        }

        const createdUser = await User.findById(user._id).select(
            "-password -emailVerificationToken -emailVerificationExpiry -refreshToken",
        );

        if (!createdUser) {
            throw new ApiError(
                500,
                "Something went wrong when registering the user",
            );
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { user: createdUser },
                    "User registered successfully and verification email has been sent to you email",
                ),
            );
    },
);

const verifyEmail = asyncHandler(async (req, res) => {
    const params = req.params as VerifyEmailSchemaType["params"];
    const verificationToken = params.verificationToken;

    if (!verificationToken) {
        throw new ApiError(400, "Verification token is missing");
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or expired");
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true;

    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(
            200,
            { isEmailVerified: true },
            "Email verified successfully",
        ),
    );
});

const resendVerificationToken = asyncHandler(async (req, res) => {
    const body = req.body as ResendVerificationTokenSchemaType["body"];
    const { email } = body;

    if (!email) {
        throw new ApiError(400, "Email not provided");
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        throw new ApiError(400, "User not registered");
    }

    if (user.isEmailVerified === true) {
        throw new ApiError(400, "User already verified");
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = new Date(tokenExpiry);

    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user?.email,
            subject: "Please verify your Email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${env.EMAIL_VERIFICATION_URL}/${unHashedToken}`,
            ),
        });
    } catch (emailError: unknown) {
        const message =
            emailError instanceof Error ? emailError.message : "Unknown error";
        throw new ApiError(
            500,
            `Failed to send verification email: ${message}`,
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { success: true },
                "Verification token have been sent successfully",
            ),
        );
});

const login = asyncHandler(async (req, res) => {
    const body = req.body as UserLoginSchemaType["body"];
    const { email, password } = body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }
    const user = await User.findOne({ email: email });

    if (!user) {
        throw new ApiError(400, "Invalid email or password");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid email or password");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email before logging in");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -emailVerificationToken -emailVerificationExpiry -refreshToken -forgotPasswordToken -forgotPasswordExpiry",
    );

    if (!loggedInUser) {
        throw new ApiError(
            500,
            "Something went wrong when logging in the user",
        );
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, loggedInUser, "User logged in successfully"),
        );
});

const logout = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            new: true,
        },
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized Access");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            env.REFRESH_TOKEN_SECRET,
        ) as JwtPayload;
        const user = await User.findById(decodedToken?._id as string);
        if (!user) {
            throw new ApiError(403, "Invalid refresh token");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(403, "Refresh Token is expired or used");
        }
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user?._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully",
                ),
            );
    } catch (error) {
        throw new ApiError(400, "Invalid refresh token");
    }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const body = req.body as ForgotPasswordSchemaType["body"];
    const { email } = body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
        // Don't reveal whether user exists - return success either way
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true },
                    "If an account with that email exists, a password reset link has been sent",
                ),
            );
    }
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = new Date(tokenExpiry);

    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user?.email,
            subject: "Password Reset Request",
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                `${env.FORGOT_PASSWORD_URL}/${unHashedToken}`,
            ),
        });
    } catch (emailError: unknown) {
        const message =
            emailError instanceof Error ? emailError.message : "Unknown error";
        throw new ApiError(
            500,
            `Failed to send password reset email: ${message}`,
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { success: true },
                "Password reset link has been sent to your email",
            ),
        );
});

const resetForgotPassword = asyncHandler(async (req, res) => {
    const params = req.params as UserChangeForgotPasswordSchemaType["params"];
    const body = req.body as UserChangeForgotPasswordSchemaType["body"];
    const resetToken = params.resetToken;
    const { newPassword } = body;

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or expired");
    }
    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { success: true },
                "Password reset successfully",
            ),
        );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const body = req.body as UserChangeCurrentPasswordSchemaType["body"];
    const { currentPassword, newPassword } = body;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(400, "User does not exist");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { success: true },
                "Password changed successfully",
            ),
        );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully"),
        );
});

const changeAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Delete old avatar from ImageKit if it exists
    if (user.avatar?.fileId) {
        await deleteFile(user.avatar.fileId);
    }

    // Upload new avatar to ImageKit
    const avatarData = await uploadAvatarToImageKit(req.file);

    // Update user avatar
    user.avatar = {
        url: avatarData.url || "https://placehold.co/200",
        fileId: avatarData.fileId || "",
    };

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { avatar: user.avatar },
                "Avatar updated successfully",
            ),
        );
});

export {
    registerUser,
    generateAccessAndRefreshToken,
    verifyEmail,
    resendVerificationToken,
    login,
    logout,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword,
    getCurrentUser,
    changeAvatar,
};
