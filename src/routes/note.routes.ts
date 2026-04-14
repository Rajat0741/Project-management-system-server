import { Router } from "express";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validator.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
} from "../controllers/note.controllers.js";

const router = Router();

router.use(verifyJWT);

// Note routes
router.route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), validate, getNotes)
    .post(validateProjectPermission([UserRolesEnum.ADMIN]), validate, createNote);

router.route("/:projectId/:noteId")
    .get(validateProjectPermission(AvailableUserRole), validate, getNoteById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), validate, updateNote)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), validate, deleteNote);

export default router;
