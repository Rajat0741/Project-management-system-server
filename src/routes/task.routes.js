import { Router } from "express";
import {
    verifyJWT,
    validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validator.middleware.js";
import {
    updateTaskStatusValidator,
    updateSubtaskStatusValidator,
} from "../validators/index.js";
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
    .get(validateProjectPermission(AvailableUserRole), validate, getTasks)
    .post(
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        uploadAttachment.array("attachments"),
        validate,
        createTask,
    );

router
    .route("/:projectId/:taskId")
    .get(validateProjectPermission(AvailableUserRole), validate, getTaskById)
    .put(
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        validate,
        updateTask,
    )
    .delete(
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        validate,
        deleteTask,
    );

// Attachment routes
router
    .route("/:projectId/:taskId/attachments")
    .post(
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        uploadAttachment.single("file"),
        assignAttachment,
    )
    .delete(
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        validate,
        deleteAttachment,
    );

// Status update routes
router
    .route("/:projectId/:taskId/status")

router
    .route("/:projectId/:taskId/subtasks/:subtaskId/status")
    .patch(
        validateProjectPermission(AvailableUserRole),
        updateSubtaskStatusValidator(),
        validate,
        updateSubtaskStatus,
    );

// Subtask routes
router
    .route("/:projectId/:taskId/subtasks")
    .post(
        validateProjectPermission(AvailableUserRole),
        validate,
        createSubtask,
    );

router
    .route("/:projectId/:taskId/subtasks/:subtaskId")
    .put(validateProjectPermission(AvailableUserRole), validate, updateSubtask)
    .delete(
        validateProjectPermission(AvailableUserRole),
        validate,
        deleteSubtask,
    );

export default router;
