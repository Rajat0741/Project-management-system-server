import type { Types } from "mongoose";
import { User } from "../../models/user.models.js";
import ApiError from "../../utils/api-errors.js";
import {
    uploadAvatar as uploadAvatarToImageKit,
    deleteFile,
} from "../../utils/imagekit.js";

const getCurrentUserService = async (userId: Types.ObjectId) => {
    const user = await User.findById(userId).select(
        "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry",
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

const changeAvatarService = async (
    userId: Types.ObjectId,
    file: Express.Multer.File,
) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.avatar?.fileId) {
        await deleteFile(user.avatar.fileId);
    }

    const avatarData = await uploadAvatarToImageKit(file);

    user.avatar = {
        url: avatarData.url || "https://placehold.co/200",
        fileId: avatarData.fileId || "",
    };

    await user.save({ validateBeforeSave: false });

    return user.avatar;
};

export { getCurrentUserService, changeAvatarService };
