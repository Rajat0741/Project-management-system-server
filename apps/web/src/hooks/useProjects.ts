import type { Project, ProjectListItem, ProjectMemberWithDetails, SuccessResponse } from "@/types";
import type { CreateProjectData, AddMemberData } from "@/schemas/project.schema";
import apiClient from "@/lib/axiosApi";
import { queryOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { queryClient, router } from "@/router";
import { toast } from "sonner";

// Creating New Project
export const useCreateProject = () => {
  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      await apiClient.post("/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.invalidate();
    },
  });
};

// Updating Existing Project
export const useUpdateProject = (projectId: string) => {
  return useMutation({
    mutationFn: async (data: Partial<CreateProjectData>) => {
      await apiClient.put(`/projects/${projectId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      router.invalidate();
    },
  });
};

// Delete Project
export const useDeleteProject = () => {
  return useMutation({
    mutationFn: async (projectId: string) => {
      await apiClient.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      router.navigate({ to: "/dashboard" });
      queryClient.invalidateQueries({ queryKey: ["projects"], exact: true });
      router.invalidate();
    },
  });
};

// Add Member to Project
export const useAddProjectMember = (projectId: string) => {
  return useMutation({
    mutationFn: async (data: AddMemberData) => {
      await apiClient.post(`/projects/${projectId}/members`, data);
    },
    onSuccess: () => {
      toast.success("Member added successfully!");
      queryClient.invalidateQueries({ queryKey: ["projectMembers", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      router.invalidate();
    },
  });
};

// Make Admin in Project
export const useMakeProjectMemberAdmin = (projectId: string) => {
  return useMutation({
    mutationFn: async (memberId: string) => {
      await apiClient.put(`/projects/${projectId}/members/${memberId}`, { role: "admin" });
    },
    onSuccess: () => {
      toast.success("Role has been changed to admin successfully!");
      queryClient.invalidateQueries({ queryKey: ["projectMembers", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      router.invalidate();
    },
  });
};

// Remove Member from Project
export const useRemoveProjectMember = (projectId: string) => {
  return useMutation({
    mutationFn: async (memberId: string) => {
      await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
    },
    onSuccess: () => {
      toast.success("Member removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["projectMembers", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      router.invalidate();
    },
  });
};

// Leave from a project
export const useLeaveProject = (projectId: string) => {
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/projects/${projectId}/leave`);
    },
    onSuccess: () => {
      router.navigate({ to: "/dashboard" });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId], exact: true });
      router.invalidate();
    },
  });
};

// ------- Query options for Loader functions -------

// Fetch all projects - used in route loader
export const fetchProjects = async (): Promise<ProjectListItem[]> => {
  const response: SuccessResponse<ProjectListItem[]> = await apiClient.get("/projects");
  return response.data.data;
};

// QUERY OPTIONS for fetching projects
export const projectLoadingQueryOptions = () =>
  queryOptions({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(),
  });

// Fetch project by ID
export const fetchProjectById = async (projectId: string): Promise<Project> => {
  const response: SuccessResponse<Project> = await apiClient.get(`projects/${projectId}`);
  return response.data.data;
};

// QUERY OPTIONS for fetching project by ID
export const projectFetchingQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: ["projects", projectId],
    queryFn: () => fetchProjectById(projectId),
  });

// Fetch project Members by Project ID
export const fetchProjectMembersById = async (projectId: string): Promise<ProjectMemberWithDetails[]> => {
  const response: SuccessResponse<ProjectMemberWithDetails[]> = await apiClient.get(`projects/${projectId}/members`);

  return response.data.data;
};

// QUERY OPTIONS for fetching Project Members by project ID
export const projectMembersFetchingQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: ["projectMembers", projectId],
    queryFn: () => fetchProjectMembersById(projectId),
  });
