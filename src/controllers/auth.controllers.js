import { User } from "../models/user.model.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import crypto from "crypto";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
    } catch (error) {

    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    const { email, username, password, role } = req.body

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }
    const user = await User.create({
        email,
        password,
        username,
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
                `${req.protocol}://${req.get("host")}/verify-email.html?token=${unHashedToken}`
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

    if(user.isEmailVerified===true){
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
                `${req.protocol}://${req.get("host")}/verify-email.html?token=${unHashedToken}`
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

export {
    registerUser,
    generateAccessAndRefreshToken,
    verifyEmail,
    resendVerificationToken
}