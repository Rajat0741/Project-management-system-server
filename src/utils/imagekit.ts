import ImageKit, { toFile } from "@imagekit/nodejs";

// Initialize ImageKit instance (new SDK only requires privateKey)
const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

// Upload avatar to ImageKit
export const uploadAvatar = async (file) => {
    const response = await imagekit.files.upload({
        file: await toFile(file.buffer, file.originalname),
        fileName: file.originalname,
        folder: "/avatars",
        useUniqueFileName: true,
    });

    return {
        url: response.url,
        fileId: response.fileId
    };
};

// Upload attachment to ImageKit
export const uploadAttachment = async (file, projectId, taskId) => {
    const response = await imagekit.files.upload({
        file: await toFile(file.buffer, file.originalname),
        fileName: file.originalname,
        folder: `/projects/${projectId}/tasks/${taskId}`,
        useUniqueFileName: true,
    });

    return {
        fileId: response.fileId,
        url: response.url,
        filePath: response.filePath,
        thumbnail: response.thumbnailUrl || ""
    };
};

// Delete a single file from ImageKit
export const deleteFile = async (fileId) => {
    await imagekit.files.delete(fileId);
};

// Bulk delete files from ImageKit
export const deleteFiles = async (fileIds) => {
    if (!fileIds || fileIds.length === 0) return;
    await imagekit.files.bulkDelete({ fileIds });
};

// Get authentication parameters for client-side uploads
export const getAuthParams = () => {
    return imagekit.helper.getAuthenticationParameters();
};

export default imagekit;
