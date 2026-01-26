import multer from "multer";

// Memory storage - files stored in buffer for direct upload to ImageKit
const memoryStorage = multer.memoryStorage();

// File filter for avatars (images only)
const avatarFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/webp'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images allowed for avatar.'), false);
    }
};

// File filter for task attachments (images + PDFs)
const attachmentFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/webp',
        'application/pdf'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and PDFs allowed for attachments.'), false);
    }
};

// Avatar upload - single file, max 2MB
export const uploadAvatar = multer({
    storage: memoryStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: avatarFileFilter
});

// Attachment upload - single file per request, max 5MB
export const uploadAttachment = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: attachmentFileFilter
});
