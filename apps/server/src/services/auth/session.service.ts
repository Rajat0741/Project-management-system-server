import { User } from "../../models/user.models.js";
import ApiError from "../../utils/api-errors.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";
import { env } from "../../config/env.js";

const generateAccessAndRefreshTokenService = async (userId: Types.ObjectId) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    try {
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

const loginUserService = async (email: string, password: string) => {
    const user = await User.findOne({ email });

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

    const tokens = await generateAccessAndRefreshTokenService(user._id);
    const loggedInUser = await User.findById(user._id).select(
        "-password -emailVerificationToken -emailVerificationExpiry -refreshToken -forgotPasswordToken -forgotPasswordExpiry",
    );

    if (!loggedInUser) {
        throw new ApiError(
            500,
            "Something went wrong when logging in the user",
        );
    }

    return { ...tokens, loggedInUser };
};

const logoutUserService = async (userId: Types.ObjectId) => {
    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            new: true,
        },
    );
};

const refreshAccessTokenService = async (incomingRefreshToken: string) => {
    let decodedToken: JwtPayload;

    try {
        decodedToken = jwt.verify(
            incomingRefreshToken,
            env.REFRESH_TOKEN_SECRET,
        ) as JwtPayload;
    } catch {
        throw new ApiError(400, "Invalid refresh token");
    }

    const user = await User.findById(decodedToken?._id as string);

    if (!user) {
        throw new ApiError(403, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(403, "Refresh Token is expired or used");
    }

    return generateAccessAndRefreshTokenService(user._id);
};

export {
    generateAccessAndRefreshTokenService,
    loginUserService,
    logoutUserService,
    refreshAccessTokenService,
};
