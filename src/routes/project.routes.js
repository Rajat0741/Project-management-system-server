import { Router } from "express";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validator.middleware.js";
import { createProjectValidator, addMemberToProjectValidator, updateMemberRoleValidator, updateProjectValidator } from "../validators/index.js";
import { getProjects, createProject, addMemberToProject, getProjectById, updateProject, deleteProject, getProjectMembers, deleteMember, updateMemberRole } from "../controllers/project.controllers.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .get(getProjects)
    .post(createProjectValidator(), validate, createProject);

router.route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), validate, getProjectById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateProjectValidator(), validate, updateProject)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), validate, deleteProject)

router.route("/:projectId/members")
    .get(validateProjectPermission(AvailableUserRole), validate, getProjectMembers)
    .post(validateProjectPermission([UserRolesEnum.ADMIN]), addMemberToProjectValidator(), validate, addMemberToProject);

router.route("/:projectId/members/:userId")
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), validate, deleteMember)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRoleValidator(), validate, updateMemberRole);

export default router;