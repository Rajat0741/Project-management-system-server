import { Router } from "express";
import {
    verifyJWT,
    validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { validateNoteOwnership } from "../middlewares/resource-guard.middleware.js";
import validate from "../middlewares/validator.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import {
    getNotesSchema,
    getNoteByIdSchema,
    createNoteSchema,
    updateNoteSchema,
    deleteNoteSchema,
} from "../validators/note.validators.js";
import {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
} from "../controllers/note.controllers.js";

const router = Router();

router.use(verifyJWT);

// Note routes
router
    .route("/:projectId")
    .get(
        validate(getNotesSchema),
        validateProjectPermission(AvailableUserRole),
        getNotes,
    )
    .post(
        validate(createNoteSchema),
        validateProjectPermission([UserRolesEnum.ADMIN]),
        createNote,
    );

router
    .route("/:projectId/:noteId")
    .get(
        validate(getNoteByIdSchema),
        validateProjectPermission(AvailableUserRole),
        validateNoteOwnership,
        getNoteById,
    )
    .put(
        validate(updateNoteSchema),
        validateProjectPermission([UserRolesEnum.ADMIN]),
        validateNoteOwnership,
        updateNote,
    )
    .delete(
        validate(deleteNoteSchema),
        validateProjectPermission([UserRolesEnum.ADMIN]),
        validateNoteOwnership,
        deleteNote,
    );

export default router;
