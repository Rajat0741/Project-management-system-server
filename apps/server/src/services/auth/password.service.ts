import crypto from "crypto";
import { User } from "../../models/user.models.js";
import ApiError from "../../utils/api-errors.js";
import { forgotPasswordMailgenContent, sendEmail } from "../../utils/mail.js";
import { env } from "../../config/env.js";
import type { Types } from "mongoose";

const buildForgotPasswordUrl = (token: string) => {
    return `${env.FORGOT_PASSWORD_URL}/${token}`;
};

const forgotPasswordRequestService = async (email: string) => {
    const user = await User.findOne({ email });

    if (!user) {
        return;
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = new Date(tokenExpiry);
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                buildForgotPasswordUrl(unHashedToken),
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
};

const resetForgotPasswordService = async (
    resetToken: string,
    newPassword: string,
) => {
    const hashedToken = crypto
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
};

const changeCurrentPasswordService = async (
    userId: Types.ObjectId,
    currentPassword: string,
    newPassword: string,
) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
};

export {
    forgotPasswordRequestService,
    resetForgotPasswordService,
    changeCurrentPasswordService,
};
