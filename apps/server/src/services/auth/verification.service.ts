import crypto from "crypto";
import { User } from "../../models/user.models.js";
import ApiError from "../../utils/api-errors.js";
import {
    emailVerificationMailgenContent,
    sendEmail,
} from "../../utils/mail.js";
import { env } from "../../config/env.js";

const buildVerificationEmailUrl = (token: string) => {
    return `${env.EMAIL_VERIFICATION_URL}/${token}`;
};

const registerUserService = async (input: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
}) => {
    const { email, username, password, fullName } = input;

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
            email: user.email,
            subject: "Please verify your Email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                buildVerificationEmailUrl(unHashedToken),
            ),
        });
    } catch (emailError: unknown) {
        await User.findByIdAndDelete(user._id);

        const message =
            emailError instanceof Error ? emailError.message : "Unknown error";

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

    return createdUser;
};

const verifyEmailService = async (verificationToken: string) => {
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

    return { isEmailVerified: true };
};

const resendVerificationTokenService = async (email: string) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "User not registered");
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "User already verified");
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = new Date(tokenExpiry);
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user.email,
            subject: "Please verify your Email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                buildVerificationEmailUrl(unHashedToken),
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
};

export {
    registerUserService,
    verifyEmailService,
    resendVerificationTokenService,
};
