import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import type {
    RegisterSchemaType,
    VerifyEmailSchemaType,
    ResendVerificationTokenSchemaType,
    UserLoginSchemaType,
    ForgotPasswordSchemaType,
    UserChangeCurrentPasswordSchemaType,
    UserChangeForgotPasswordSchemaType,
} from "../validators/auth.validators.js";
import {
    registerUserService,
    verifyEmailService,
    resendVerificationTokenService,
    generateAccessAndRefreshTokenService,
    loginUserService,
    logoutUserService,
    refreshAccessTokenService,
    forgotPasswordRequestService,
    resetForgotPasswordService,
    changeCurrentPasswordService,
    getCurrentUserService,
    changeAvatarService,
} from "../services/auth/index.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
};

const generateAccessAndRefreshToken = generateAccessAndRefreshTokenService;

const registerUser = asyncHandler(async (req, res) => {
    const body = req.body as RegisterSchemaType["body"];
    const { email, username, password, fullName } = body;

    const createdUser = await registerUserService({
        email,
        username,
        password,
        fullName,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { user: createdUser },
                "User registered successfully and verification email has been sent to your email",
            ),
        );
});

const verifyEmail = asyncHandler(async (req, res) => {
    const params = req.params as VerifyEmailSchemaType["params"];
    const verificationToken = params.verificationToken;

    if (!verificationToken) {
        throw new ApiError(400, "Verification token is missing");
    }

    const result = await verifyEmailService(verificationToken);

    res.status(200).json(
        new ApiResponse(200, result, "Email verified successfully"),
    );
});

const resendVerificationToken = asyncHandler(async (req, res) => {
    const body = req.body as ResendVerificationTokenSchemaType["body"];
    const { email } = body;

    if (!email) {
        throw new ApiError(400, "Email not provided");
    }

    await resendVerificationTokenService(email);

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

    const { accessToken, refreshToken, loggedInUser } = await loginUserService(
        email,
        password,
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, loggedInUser, "User logged in successfully"),
        );
});

const logout = asyncHandler(async (req, res) => {
    await logoutUserService(req.user._id);

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

    const { accessToken, refreshToken } =
        await refreshAccessTokenService(incomingRefreshToken);

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
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const body = req.body as ForgotPasswordSchemaType["body"];
    const { email } = body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    await forgotPasswordRequestService(email);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { success: true },
                "If an account with that email exists, a password reset link has been sent",
            ),
        );
});

const resetForgotPassword = asyncHandler(async (req, res) => {
    const params = req.params as UserChangeForgotPasswordSchemaType["params"];
    const body = req.body as UserChangeForgotPasswordSchemaType["body"];

    await resetForgotPasswordService(params.resetToken, body.newPassword);

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

    await changeCurrentPasswordService(
        req.user._id,
        body.currentPassword,
        body.newPassword,
    );

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
    const user = await getCurrentUserService(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const changeAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await changeAvatarService(req.user._id, req.file);

    return res
        .status(200)
        .json(new ApiResponse(200, { avatar }, "Avatar updated successfully"));
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
