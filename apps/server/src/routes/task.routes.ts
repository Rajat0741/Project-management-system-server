import { Router } from "express";
import {
    verifyJWT,
    validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import {
    validateTaskOwnership,
    validateSubtaskOwnership,
} from "../middlewares/resource-guard.middleware.js";
import validate from "../middlewares/validator.middleware.js";
import {
    getTasksSchema,
    getTaskByIdSchema,
    createTaskSchema,
    updateTaskSchema,
    deleteTaskSchema,
    assignAttachmentSchema,
    deleteAttachmentSchema,
    createSubtaskSchema,
    updateSubtaskSchema,
    deleteSubtaskSchema,
    updateSubtaskStatusSchema,
} from "../validators/task.validators.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { uploadAttachment } from "../middlewares/multer.middleware.js";
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    updateSubtaskStatus,
    assignAttachment,
    deleteAttachment,
} from "../controllers/task.controllers.js";
import ApiError from "../utils/api-errors.js";

const router = Router();

router.use(verifyJWT);

// Task routes
router
    .route("/:projectId")
    .get(
        validate(getTasksSchema),
        validateProjectPermission(AvailableUserRole),
        getTasks,
    )
    .post(
        uploadAttachment.array("attachments"),
        (req, _res, next) => {
            // Multer parses multipart fields as flat strings.
            // Pre-parse subtasks so the Zod schema always receives an array.
            if (typeof req.body.subtasks === "string") {
                try {
                    req.body.subtasks = JSON.parse(req.body.subtasks);
                } catch {
                    return next(
                        new ApiError(
                            400,
                            "Invalid JSON in subtasks field",
                        ),
                    );
                }
            }
            next();
        },
        validate(createTaskSchema),
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        createTask,
    );

router
    .route("/:projectId/:taskId")
    .get(
        validate(getTaskByIdSchema),
        validateProjectPermission(AvailableUserRole),
        validateTaskOwnership,
        getTaskById,
    )
    .put(
        validate(updateTaskSchema),
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        validateTaskOwnership,
        updateTask,
    )
    .delete(
        validate(deleteTaskSchema),
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        validateTaskOwnership,
        deleteTask,
    );

// Attachment routes
router
    .route("/:projectId/:taskId/attachments")
    .post(
        validate(assignAttachmentSchema),
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        validateTaskOwnership,
        uploadAttachment.single("file"),
        assignAttachment,
    )
    .delete(
        validate(deleteAttachmentSchema),
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        validateTaskOwnership,
        deleteAttachment,
    );

// Subtask status — more specific path must be registered before the generic subtask route
router
    .route("/:projectId/:taskId/subtasks/:subtaskId/status")
    .patch(
        validate(updateSubtaskStatusSchema),
        validateProjectPermission(AvailableUserRole),
        validateTaskOwnership,
        validateSubtaskOwnership,
        updateSubtaskStatus,
    );

// Subtask routes
router
    .route("/:projectId/:taskId/subtasks")
    .post(
        validate(createSubtaskSchema),
        validateProjectPermission(AvailableUserRole),
        validateTaskOwnership,
        createSubtask,
    );

router
    .route("/:projectId/:taskId/subtasks/:subtaskId")
    .put(
        validate(updateSubtaskSchema),
        validateProjectPermission(AvailableUserRole),
        validateTaskOwnership,
        validateSubtaskOwnership,
        updateSubtask,
    )
    .delete(
        validate(deleteSubtaskSchema),
        validateProjectPermission(AvailableUserRole),
        validateTaskOwnership,
        validateSubtaskOwnership,
        deleteSubtask,
    );

export default router;
