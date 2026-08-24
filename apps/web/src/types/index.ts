import type { AxiosResponse } from "axios";

export type ServerState = "loading" | "error" | "success";

// ------ API Response Types ------

// Server's response structure
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: true;
}

// Full Axios response
export type SuccessResponse<T> = AxiosResponse<ApiResponse<T>>;

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors: unknown[];
}

// ------ Authentication ------

export interface AuthState {
  isAuthenticated: boolean;
}

export interface User {
  _id: string;
  avatar: {
    url: string;
    fileId: string;
  };
  username: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface changePasswordFormData {
  currentPassword: string;
  newPassword: string;
}

// ------ Project Management ------

export type ObjectId = string;

export type UserRole = "admin" | "member";

/**
 * Base Project Entity
 * Used in: Get Project By ID, Create, Update, Delete
 * Endpoints:
 * - GET /api/v1/projects/:projectId
 * - POST /api/v1/projects
 * - PATCH /api/v1/projects/:projectId
 * - DELETE /api/v1/projects/:projectId
 */
export interface Project {
  _id: ObjectId;
  name: string;
  description?: string;
  createdBy: ObjectId;
  createdAt: string;
  updatedAt: string;
}

/**
 * Base Project Member Entity
 * Used in: Add Member, Update Role, Remove Member
 * Endpoints:
 * - POST /api/v1/projects/:projectId/members
 * - PATCH /api/v1/projects/:projectId/members/:userId
 * - DELETE /api/v1/projects/:projectId/members/:userId
 */
export interface ProjectMember {
  _id: ObjectId;
  user: ObjectId;
  project: ObjectId;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response for 'Get All Projects'
 * Endpoint: GET /api/v1/projects
 */

export interface ProjectListItem {
  projects: {
    _id: ObjectId;
    name: string;
    description?: string;
    members: number;
    createdBy: ObjectId;
    createdAt: string;
  };
  role: UserRole;
}

/**
 * Response for 'Get Project Members'
 * Endpoint: GET /api/v1/projects/:projectId/members
 */

export interface ProjectMemberWithDetails {
  user: {
    _id: ObjectId;
    username: string;
    email: string;
    fullName: string;
    avatar: {
      url: string;
      fileId: string;
    };
  };
  project: ObjectId;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ------ Task Management ------

export type TaskStatus = "todo" | "in_progress" | "done";

export interface TaskAttachment {
  url: string;
  thumbnail?: string;
  fileId: string;
}

export interface TaskAssigner {
  _id: string;
  username: string;
  fullName: string;
  avatar: {
    url: string;
    fileId: string;
  };
}

export interface Task {
  _id: ObjectId;
  title: string;
  description?: string;
  assignedTo?: ObjectId;
  createdBy: TaskAssigner;
  status: TaskStatus;
  attachments: TaskAttachment[];
  subtasks?: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAndUpdateTaskFormData {
  title: string;
  description: string;
  assignedTo: ObjectId;
  status: TaskStatus;
  attachments?: TaskAttachment[];
  subTasks?: CreateSubTaskData[];
}

export interface SubTask {
  _id: ObjectId;
  title: string;
  task: ObjectId;
  isCompleted: boolean;
  createdBy: ObjectId;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubTaskData {
  title: string;
}
export interface toggleSubTaskResponse {
  subtask: SubTask;
  taskStatus: boolean;
}
