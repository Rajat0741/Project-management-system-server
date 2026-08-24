import type { Task, SubTask, TaskAttachment, SuccessResponse, toggleSubTaskResponse } from "@/types";
import type { CreateTaskData, UpdateTaskData } from "@/schemas/task.schema";
import apiClient from "@/lib/axiosApi";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { queryClient, router } from "@/router";
import { toast } from "sonner";

// -------- Mutations --------

// Create a new task
export const useCreateTask = (projectId: string) => {
  return useMutation({
    mutationFn: async (data: CreateTaskData & { attachments?: File[] }) => {
      const { attachments, ...taskData } = data;

      // If there are attachments, use FormData
      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        formData.append("title", taskData.title);
        if (taskData.description) formData.append("description", taskData.description);
        formData.append("assignedTo", taskData.assignedTo);
        formData.append("status", taskData.status);

        // Append subtasks as JSON string if present
        if (taskData.subtasks && taskData.subtasks.length > 0) {
          formData.append("subtasks", JSON.stringify(taskData.subtasks));
        }

        // Append each file
        attachments.forEach((file) => {
          formData.append("attachments", file);
        });

        const response: SuccessResponse<Task> = await apiClient.post(`/tasks/${projectId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
      }

      // No attachments, send JSON
      const response: SuccessResponse<Task> = await apiClient.post(`/tasks/${projectId}`, taskData);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Task created successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      router.invalidate();
    },
  });
};

// Update an existing task
export const useUpdateTask = (projectId: string, taskId: string) => {
  return useMutation({
    mutationFn: async (data: UpdateTaskData) => {
      const response: SuccessResponse<Task> = await apiClient.put(`/tasks/${projectId}/${taskId}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Task updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      router.invalidate();
    },
  });
};

// Delete a task
export const useDeleteTask = (projectId: string) => {
  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`/tasks/${projectId}/${taskId}`);
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      router.invalidate();
    },
  });
};

// -------- Subtask Mutations --------

// Create a subtask
export const useCreateSubtask = (projectId: string, taskId: string) => {
  return useMutation({
    mutationFn: async (data: { title: string }) => {
      const response: SuccessResponse<SubTask> = await apiClient.post(`/tasks/${projectId}/${taskId}/subtasks`, data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Subtask created successfully");
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
};

// Update a subtask
export const useUpdateSubtask = (projectId: string, taskId: string) => {
  return useMutation({
    mutationFn: async ({ subtaskId, data }: { subtaskId: string; data: { title?: string; isCompleted?: boolean } }) => {
      const response: SuccessResponse<SubTask> = await apiClient.put(
        `/tasks/${projectId}/${taskId}/subtasks/${subtaskId}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
};

// Delete a subtask
export const useDeleteSubtask = (projectId: string, taskId: string) => {
  return useMutation({
    mutationFn: async (subtaskId: string) => {
      await apiClient.delete(`/tasks/${projectId}/${taskId}/subtasks/${subtaskId}`);
    },
    onSuccess: () => {
      toast.success("Subtask deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
};

// Toggle subtask status (Auto-updates parent task status)
export const useToggleSubtaskStatus = (projectId: string, taskId: string) => {
  return useMutation({
    mutationFn: async ({ subtaskId, isCompleted }: { subtaskId: string; isCompleted: boolean }) => {
      const response: SuccessResponse<toggleSubTaskResponse> = await apiClient.patch(
        `/tasks/${projectId}/${taskId}/subtasks/${subtaskId}/status`,
        { isCompleted },
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate both tasks list and individual task to get updated status
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
    },
  });
};

// -------- Attachment Mutations --------

// Add attachment to a task
export const useAddAttachment = (projectId: string, taskId: string) => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response: SuccessResponse<TaskAttachment> = await apiClient.post(
        `/tasks/${projectId}/${taskId}/attachments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Attachment uploaded");
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
};

// Delete attachment from a task
export const useDeleteAttachment = (projectId: string, taskId: string) => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      await apiClient.delete(`/tasks/${projectId}/${taskId}/attachments`, { data: { fileId } });
    },
    onSuccess: () => {
      toast.success("Attachment deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
};

// -------- Query Functions --------

// Fetch all tasks for a project
export const fetchTasks = async (projectId: string): Promise<Task[]> => {
  const response: SuccessResponse<Task[]> = await apiClient.get(`/tasks/${projectId}`);
  return response.data.data;
};

// Fetch a single task by ID (includes subtasks)
export const fetchTaskById = async (projectId: string, taskId: string): Promise<Task> => {
  const response: SuccessResponse<Task> = await apiClient.get(`/tasks/${projectId}/${taskId}`);
  return response.data.data;
};

// -------- Query Options --------

// Query options for fetching tasks
export const tasksQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: ["tasks", projectId],
    queryFn: () => fetchTasks(projectId),
  });

// Query options for fetching a single task with subtasks
export const taskByIdQueryOptions = (projectId: string, taskId: string) =>
  queryOptions({
    queryKey: ["task", taskId],
    queryFn: () => fetchTaskById(projectId, taskId),
    enabled: !!taskId, // Only fetch when taskId is provided
  });
