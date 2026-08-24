import type { ITask } from "../../models/task.models.js";

const mapTaskAttachment = (attachment: ITask["attachments"][number]) => {
    return {
        fileId: attachment.fileId,
        url: attachment.url,
        thumbnail: attachment.thumbnail,
    };
};

const mapTaskWithFilteredAttachments = (task: ITask) => {
    return {
        ...task.toObject(),
        attachments: task.attachments.map(mapTaskAttachment),
    };
};

const mapTasksWithFilteredAttachments = (tasks: ITask[]) => {
    return tasks.map(mapTaskWithFilteredAttachments);
};

export {
    mapTaskAttachment,
    mapTaskWithFilteredAttachments,
    mapTasksWithFilteredAttachments,
};
