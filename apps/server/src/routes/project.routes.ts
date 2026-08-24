import { Router } from "express";
import {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  leaveProject,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controllers.js";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validator.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import {
  addMemberToProjectSchema,
  createProjectSchema,
  deleteMemberSchema,
  deleteProjectSchema,
  getProjectByIdSchema,
  getProjectMembersSchema,
  leaveProjectSchema,
  updateMemberRoleSchema,
  updateProjectSchema,
} from "../validators/project.validators.js";

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
