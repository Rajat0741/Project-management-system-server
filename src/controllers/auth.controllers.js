import { User } from "../models/user.models.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import { uploadAvatar as uploadAvatarToImageKit, deleteFile } from "../utils/imagekit.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    const { email, username, password, fullName } = req.body

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const userNameCheck = await User.findOne({ username })

    if (userNameCheck) {
        throw new ApiError(409, "Username already taken, please choose another username")
    }

    const user = await User.create({
        email,
        password,
        username,
        fullName,
        isEmailVerified: false
    })

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify your Email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${process.env.EMAIL_VERIFICATION_URL}/${unHashedToken}`
            ),

        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -emailVerificationToken -emailVerificationExpiry -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong when registering the user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, { user: createdUser },
                "User registered successfully and verification email has been sent to you email"
            )
        )

});

const verifyEmail = asyncHandler(async (req, res) => {

    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Verification token is missing")
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or expired")
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true;

    await user.save({ validateBeforeSave: false })

    res.status(200).json(
        new ApiResponse(200, { isEmailVerified: true }, "Email verified successfully")
    )
})

const resendVerificationToken = asyncHandler(async (req, res) => {

    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email not provided")
    }

    const user = await User.findOne({ email: email })

    if (!user) {
        throw new ApiError(400, "User not registered")
    }

    if (user.isEmailVerified === true) {
        throw new ApiError(400, "User already verified")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify your Email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${process.env.EMAIL_VERIFICATION_URL}/${unHashedToken}`
            ),
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, { success: true },
                "Verification token have been sent successfully"
            )
        )

});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }
    const user = await User.findOne({ email: email });

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Credentials are invalid")
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email before logging in")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -emailVerificationToken -emailVerificationExpiry -refreshToken -forgotPasswordToken -forgotPasswordExpiry"
    )

    if (!loggedInUser) {
        throw new ApiError(500, "Something went wrong when logging in the user")
    }
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, loggedInUser, "User logged in successfully")
        )

})

const logout = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized Access")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(403, "Invalid refresh token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(403, "Refresh Token is expired or used")
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user?._id);

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed successfully")
            )
    } catch (error) {
        throw new ApiError(400, "Invalid refresh token")
    }
})

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required")
    }
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new ApiError(400, "User does not exist")
    }
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail(
        {
            email: user?.email,
            subject: "Password Reset Request",
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                `${process.env.FORGOT_PASSWORD_URL}/${unHashedToken}`
            )
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, { success: true },
                "Password reset link has been sent to your email"
            )
        )
})

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params
    const { newPassword } = req.body

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(400, "Token is invalid or expired")
    }
    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, { success: true },
                "Password reset successfully"
            )
        )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(400, "User does not exist")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect")
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, { success: true },
                "Password changed successfully"
            )
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

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
        url: avatarData.url,
        fileId: avatarData.fileId
    };

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, { avatar: user.avatar }, "Avatar updated successfully"));
})

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
    changeAvatar
}