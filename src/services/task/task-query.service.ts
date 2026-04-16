import { Tasks } from "../../models/task.models.js";
import ApiError from "../../utils/api-errors.js";
import { ensureProjectExists, toObjectId } from "../shared/index.js";
import { mapTasksWithFilteredAttachments } from "./task-mapper.service.js";

const getTasksService = async (projectId: string) => {
    await ensureProjectExists(projectId);

    const tasks = await Tasks.find({
        project: toObjectId(projectId),
    }).populate("assignedTo", "avatar username fullName");

    return mapTasksWithFilteredAttachments(tasks);
};

const getTaskByIdService = async (taskId: string) => {
    const task = await Tasks.aggregate([
        {
            $match: {
                _id: toObjectId(taskId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedToDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "assignedBy",
                            foreignField: "_id",
                            as: "assignedByDetails",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$assignedByDetails", 0],
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                createdBy: { $arrayElemAt: ["$assignedByDetails", 0] },
                attachments: {
                    $map: {
                        input: "$attachments",
                        as: "attachment",
                        in: {
                            fileId: "$$attachment.fileId",
                            url: "$$attachment.url",
                            thumbnail: "$$attachment.thumbnail",
                        },
                    },
                },
            },
        },
    ]);

    if (!task.length) {
        throw new ApiError(404, "Task not found");
    }

    return task[0];
};

export { getTasksService, getTaskByIdService };
