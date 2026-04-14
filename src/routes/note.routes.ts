import { Router } from "express";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
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
    .get(validateProjectPermission(AvailableUserRole), getNotes)
    .post(validateProjectPermission([UserRolesEnum.ADMIN]), createNote);

router.route("/:projectId/:noteId")
    .get(validateProjectPermission(AvailableUserRole), getNoteById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateNote)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteNote);

export default router;
