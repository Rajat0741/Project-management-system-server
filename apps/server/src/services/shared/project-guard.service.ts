import { Project } from "../../models/project.models.js";
import ApiError from "../../utils/api-errors.js";

const ensureProjectExists = async (projectId: string) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return project;
};

export { ensureProjectExists };
