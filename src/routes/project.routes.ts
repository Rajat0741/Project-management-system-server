import { Router } from "express";
import {
    verifyJWT,
    validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validator.middleware.js";
import {
    createProjectSchema,
    getProjectByIdSchema,
    updateProjectSchema,
    deleteProjectSchema,
    addMemberToProjectSchema,
    getProjectMembersSchema,
    leaveProjectSchema,
    deleteMemberSchema,
    updateMemberRoleSchema,
} from "../validators/project.validators.js";
import {
    getProjects,
    createProject,
    addMemberToProject,
    getProjectById,
    updateProject,
    deleteProject,
    getProjectMembers,
    deleteMember,
    updateMemberRole,
    leaveProject,
} from "../controllers/project.controllers.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .get(getProjects)
    .post(validate(createProjectSchema), createProject);

router
    .route("/:projectId")
    .get(
        validate(getProjectByIdSchema),
        validateProjectPermission(AvailableUserRole),
        getProjectById,
    )
    .put(
        validate(updateProjectSchema),
        validateProjectPermission([UserRolesEnum.ADMIN]),
        updateProject,
    )
    .delete(
        validate(deleteProjectSchema),
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteProject,
    );

router
    .route("/:projectId/members")
    .get(
        validate(getProjectMembersSchema),
        validateProjectPermission(AvailableUserRole),
        getProjectMembers,
    )
    .post(
        validate(addMemberToProjectSchema),
        validateProjectPermission([UserRolesEnum.ADMIN]),
        addMemberToProject,
    );

router
    .route("/:projectId/leave")
    .delete(
        validate(leaveProjectSchema),
        validateProjectPermission(AvailableUserRole),
        leaveProject,
    );

router
    .route("/:projectId/members/:userId")
    .delete(
        validate(deleteMemberSchema),
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteMember,
    )
    .put(
        validate(updateMemberRoleSchema),
        validateProjectPermission([UserRolesEnum.ADMIN]),
        updateMemberRole,
    );

export default router;
