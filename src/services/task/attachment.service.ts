import { Tasks } from "../../models/task.models.js";
import ApiError from "../../utils/api-errors.js";
import {
    uploadAttachment as uploadToImageKit,
    deleteFile,
    deleteFiles,
} from "../../utils/imagekit.js";
import { toObjectId } from "../shared/index.js";
import { mapTaskAttachment } from "./task-mapper.service.js";

const uploadTaskAttachmentsService = async (input: {
    projectId: string;
    taskId: string;
    files: Express.Multer.File[];
}) => {
    const { projectId, taskId, files } = input;

    if (!files.length) {
        return [];
    }

    const attachmentPromises = files.map((file) =>
        uploadToImageKit(file, projectId, taskId),
    );

    return Promise.all(attachmentPromises);
};

const addSingleAttachmentToTaskService = async (input: {
    projectId: string;
    taskId: string;
    file: Express.Multer.File;
}) => {
    const { projectId, taskId, file } = input;

    const task = await Tasks.findById(toObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const attachmentData = await uploadToImageKit(file, projectId, taskId);

    if (!attachmentData.fileId || !attachmentData.url) {
        throw new ApiError(500, "Failed to upload attachment");
    }

    task.attachments.push({
        fileId: attachmentData.fileId,
        url: attachmentData.url,
        filePath: attachmentData.filePath || "",
        thumbnail: attachmentData.thumbnail || "",
     });

    await task.save();

    return {
        fileId: attachmentData.fileId,
        url: attachmentData.url,
        thumbnail: attachmentData.thumbnail,
    };
};

const deleteAttachmentFromTaskService = async (input: {
    taskId: string;
    fileId: string;
}) => {
    const { taskId, fileId } = input;

    const task = await Tasks.findById(toObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const attachmentIndex = task.attachments.findIndex(
        (attachment) => attachment.fileId === fileId,
    );

    if (attachmentIndex === -1) {
        throw new ApiError(404, "Attachment not found");
    }

    await deleteFile(fileId);

    task.attachments.splice(attachmentIndex, 1);
    await task.save();
};

const getTaskAttachmentFileIdsService = async (taskIds: string[]) => {
    if (!taskIds.length) {
        return [] as string[];
    }

    const tasks = await Tasks.find({
        _id: { $in: taskIds.map((taskId) => toObjectId(taskId)) },
    });

    return tasks.flatMap((task) =>
        task.attachments.map((attachment) => attachment.fileId),
    );
};

const deleteTaskAttachmentsByTaskIdsService = async (taskIds: string[]) => {
    const fileIds = await getTaskAttachmentFileIdsService(taskIds);

    if (!fileIds.length) {
        return;
    }

    await deleteFiles(fileIds);
};

const getTaskFilteredAttachmentsService = async (taskId: string) => {
    const task = await Tasks.findById(toObjectId(taskId));

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return task.attachments.map(mapTaskAttachment);
};

export {
    uploadTaskAttachmentsService,
    addSingleAttachmentToTaskService,
    deleteAttachmentFromTaskService,
    deleteTaskAttachmentsByTaskIdsService,
    getTaskFilteredAttachmentsService,
};
