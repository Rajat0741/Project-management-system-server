import { Router } from "express";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validator.middleware.js";
import { createProjectSchema, addMemberToProjectSchema, updateMemberRoleSchema, updateProjectSchema } from "../validators/index.js";
import { getProjects, createProject, addMemberToProject, getProjectById, updateProject, deleteProject, getProjectMembers, deleteMember, updateMemberRole, leaveProject } from "../controllers/project.controllers.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .get(getProjects)
    .post(validate(createProjectSchema), createProject);

router.route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getProjectById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), validate(updateProjectSchema), updateProject)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject)

router.route("/:projectId/members")
    .get(validateProjectPermission(AvailableUserRole), getProjectMembers)
    .post(validateProjectPermission([UserRolesEnum.ADMIN]), validate(addMemberToProjectSchema), addMemberToProject)

router.route("/:projectId/leave")
    .delete(validateProjectPermission(AvailableUserRole), leaveProject)

router.route("/:projectId/members/:userId")
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMember)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), validate(updateMemberRoleSchema), updateMemberRole);

export default router;