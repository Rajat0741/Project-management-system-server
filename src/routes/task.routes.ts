import { Router } from "express";
import {
    verifyJWT,
    validateProjectPermission,
} from "../middlewares/auth.middleware.js";
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
        getTaskById,
    )
    .put(
        validate(updateTaskSchema),
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        updateTask,
    )
    .delete(
        validate(deleteTaskSchema),
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
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
        uploadAttachment.single("file"),
        assignAttachment,
    )
    .delete(
        validate(deleteAttachmentSchema),
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        deleteAttachment,
    );

router
    .route("/:projectId/:taskId/subtasks/:subtaskId/status")
    .patch(
        validate(updateSubtaskStatusSchema),
        validateProjectPermission(AvailableUserRole),
        updateSubtaskStatus,
    );

// Subtask routes
router
    .route("/:projectId/:taskId/subtasks")
    .post(
        validate(createSubtaskSchema),
        validateProjectPermission(AvailableUserRole),
        createSubtask,
    );

router
    .route("/:projectId/:taskId/subtasks/:subtaskId")
    .put(
        validate(updateSubtaskSchema),
        validateProjectPermission(AvailableUserRole),
        updateSubtask,
    )
    .delete(
        validate(deleteSubtaskSchema),
        validateProjectPermission(AvailableUserRole),
        deleteSubtask,
    );

export default router;
