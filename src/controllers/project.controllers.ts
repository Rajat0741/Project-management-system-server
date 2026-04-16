import ApiResponse from "../utils/api-response.js";
import asyncHandler from "../utils/asyncHandler.js";
import type {
    GetProjectByIdSchemaType,
    CreateProjectSchemaType,
    UpdateProjectSchemaType,
    DeleteProjectSchemaType,
    AddMemberToProjectSchemaType,
    GetProjectMembersSchemaType,
    UpdateMemberRoleSchemaType,
    DeleteMemberSchemaType,
    LeaveProjectSchemaType,
} from "../validators/project.validators.js";
import {
    getProjectsService,
    getProjectByIdService,
    createProjectService,
    updateProjectService,
    deleteProjectService,
    addMemberToProjectService,
    getProjectMembersService,
    updateMemberRoleService,
    deleteMemberService,
    leaveProjectService,
} from "../services/project/index.js";

const getProjects = asyncHandler(async (req, res) => {
    const projects = await getProjectsService(req.user._id);

    res.status(200).json(
        new ApiResponse(200, projects, "Projects fetched successfully"),
    );
});

const getProjectById = asyncHandler(async (req, res) => {
    const params = req.params as GetProjectByIdSchemaType["params"];
    const project = await getProjectByIdService(params.projectId);

    res.status(200).json(
        new ApiResponse(200, project, "Project fetched successfully"),
    );
});

const createProject = asyncHandler(async (req, res) => {
    const body = req.body as CreateProjectSchemaType["body"];

    const project = await createProjectService({
        name: body.name,
        description: body.description,
        userId: req.user._id,
    });

    res.status(201).json(
        new ApiResponse(201, project, "Project Created Successfully"),
    );
});

const updateProject = asyncHandler(async (req, res) => {
    const params = req.params as UpdateProjectSchemaType["params"];
    const body = req.body as UpdateProjectSchemaType["body"];

    const project = await updateProjectService({
        projectId: params.projectId,
        name: body.name,
        description: body.description,
    });

    res.status(200).json(
        new ApiResponse(200, project, "Project updated successfully"),
    );
});

const deleteProject = asyncHandler(async (req, res) => {
    const params = req.params as DeleteProjectSchemaType["params"];
    const project = await deleteProjectService(params.projectId);

    res.status(200).json(
        new ApiResponse(200, project, "Project deleted successfully"),
    );
});

const addMemberToProject = asyncHandler(async (req, res) => {
    const params = req.params as AddMemberToProjectSchemaType["params"];
    const body = req.body as AddMemberToProjectSchemaType["body"];

    const projectMember = await addMemberToProjectService({
        projectId: params.projectId,
        email: body.email,
        role: body.role,
    });

    res.status(201).json(
        new ApiResponse(
            201,
            projectMember,
            "Member added to project successfully",
        ),
    );
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const params = req.params as GetProjectMembersSchemaType["params"];
    const projectMembers = await getProjectMembersService(params.projectId);

    res.status(200).json(
        new ApiResponse(
            200,
            projectMembers,
            "Project members fetched successfully",
        ),
    );
});

const updateMemberRole = asyncHandler(async (req, res) => {
    const params = req.params as UpdateMemberRoleSchemaType["params"];
    const body = req.body as UpdateMemberRoleSchemaType["body"];

    const projectMember = await updateMemberRoleService({
        projectId: params.projectId,
        userId: params.userId,
        role: body.role,
    });

    res.status(200).json(
        new ApiResponse(
            200,
            projectMember,
            "Project member role updated successfully",
        ),
    );
});

const deleteMember = asyncHandler(async (req, res) => {
    const params = req.params as DeleteMemberSchemaType["params"];

    const deletedMember = await deleteMemberService({
        projectId: params.projectId,
        userId: params.userId,
    });

    res.status(200).json(
        new ApiResponse(
            200,
            deletedMember,
            "Project member deleted successfully",
        ),
    );
});

const leaveProject = asyncHandler(async (req, res) => {
    const params = req.params as LeaveProjectSchemaType["params"];

    await leaveProjectService({
        projectId: params.projectId,
        userId: req.user._id,
    });

    res.status(200).json(
        new ApiResponse(200, {}, "You have left the project successfully"),
    );
});

export {
    addMemberToProject,
    createProject,
    getProjectById,
    getProjectMembers,
    getProjects,
    updateMemberRole,
    deleteMember,
    updateProject,
    deleteProject,
    leaveProject,
};
