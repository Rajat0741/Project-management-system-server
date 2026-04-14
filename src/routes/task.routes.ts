import { Router } from "express";
import {
    verifyJWT,
    validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validator.middleware.js";
import {
    updateSubtaskStatusSchema,
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
    .get(validateProjectPermission(AvailableUserRole), getTasks)
    .post(
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        uploadAttachment.array("attachments"),
        createTask,
    );

router
    .route("/:projectId/:taskId")
    .get(validateProjectPermission(AvailableUserRole), getTaskById)
    .put(
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        updateTask,
    )
    .delete(
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
        deleteAttachment,
    );

// Status update routes
router
    .route("/:projectId/:taskId/status")

router
    .route("/:projectId/:taskId/subtasks/:subtaskId/status")
    .patch(
        validateProjectPermission(AvailableUserRole),
        validate(updateSubtaskStatusSchema),
        updateSubtaskStatus,
    );

// Subtask routes
router
    .route("/:projectId/:taskId/subtasks")
    .post(
        validateProjectPermission(AvailableUserRole),
        createSubtask,
    );

router
    .route("/:projectId/:taskId/subtasks/:subtaskId")
    .put(validateProjectPermission(AvailableUserRole), updateSubtask)
    .delete(
        validateProjectPermission(AvailableUserRole),
        deleteSubtask,
    );

export default router;
