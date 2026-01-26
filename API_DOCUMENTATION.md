# Project Camp API Documentation

## Base Configuration

### Backend URL
```
Production: https://your-app-name.onrender.com
Development: http://localhost:8000
```

### API Base Path
```
/api/v1
```

---

## Axios Setup (React)

### Install Axios
```bash
npm install axios
```

### Create API Instance (`src/api/axios.js`)
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true, // Required for cookies (JWT tokens)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retrying, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await API.post('/auth/refresh-token');
        return API(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;
```

### Environment Variables (`.env`)
```env
VITE_API_URL=https://your-app-name.onrender.com/api/v1
```

---

## API Response Format

### Success Response
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": []
}
```

---

## Authentication Endpoints

### Register User
```javascript
// POST /auth/register
const register = async (userData) => {
  const response = await API.post('/auth/register', {
    email: 'user@example.com',
    username: 'johndoe',
    password: 'password123',
    fullname: 'John Doe' // optional
  });
  return response.data;
};
```

### Verify Email
```javascript
// GET /auth/verify-email/:token
// Usually called from email link, redirects to verify-email.html
const verifyEmail = async (token) => {
  const response = await API.get(`/auth/verify-email/${token}`);
  return response.data;
};
```

### Resend Verification Email
```javascript
// POST /auth/resend-email-verification
const resendVerification = async (email) => {
  const response = await API.post('/auth/resend-email-verification', { email });
  return response.data;
};
```

### Login
```javascript
// POST /auth/login
const login = async (credentials) => {
  const response = await API.post('/auth/login', {
    email: 'user@example.com',
    password: 'password123'
  });
  return response.data;
  // Cookies (accessToken, refreshToken) are set automatically
};
```

### Logout
```javascript
// POST /auth/logout
const logout = async () => {
  const response = await API.post('/auth/logout');
  return response.data;
};
```

### Get Current User
```javascript
// GET /auth/current-user
const getCurrentUser = async () => {
  const response = await API.get('/auth/current-user');
  return response.data;
};
```

### Change Password
```javascript
// POST /auth/change-password
const changePassword = async (passwords) => {
  const response = await API.post('/auth/change-password', {
    currentPassword: 'oldPassword123',
    newPassword: 'newPassword123'
  });
  return response.data;
};
```

### Forgot Password
```javascript
// POST /auth/forgot-password
const forgotPassword = async (email) => {
  const response = await API.post('/auth/forgot-password', { email });
  return response.data;
};
```

### Reset Password
```javascript
// POST /auth/reset-password/:token
const resetPassword = async (token, newPassword) => {
  const response = await API.post(`/auth/reset-password/${token}`, {
    newPassword: 'newPassword123'
  });
  return response.data;
};
```

### Change Avatar
```javascript
// PATCH /auth/avatar
// Note: Use FormData for file uploads
const changeAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await API.patch('/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Usage with file input
const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const result = await changeAvatar(file);
    console.log('New avatar URL:', result.data.avatar.url);
  }
};
```

---

## Project Endpoints

### Get All Projects
```javascript
// GET /projects
const getProjects = async () => {
  const response = await API.get('/projects');
  return response.data;
};
```

### Create Project
```javascript
// POST /projects
const createProject = async (projectData) => {
  const response = await API.post('/projects', {
    name: 'My Project',
    description: 'Project description' // optional
  });
  return response.data;
};
```

### Get Project by ID
```javascript
// GET /projects/:projectId
const getProject = async (projectId) => {
  const response = await API.get(`/projects/${projectId}`);
  return response.data;
};
```

### Update Project
```javascript
// PUT /projects/:projectId
// Admin only
const updateProject = async (projectId, data) => {
  const response = await API.put(`/projects/${projectId}`, {
    name: 'Updated Name',
    description: 'Updated description'
  });
  return response.data;
};
```

### Delete Project
```javascript
// DELETE /projects/:projectId
// Admin only
const deleteProject = async (projectId) => {
  const response = await API.delete(`/projects/${projectId}`);
  return response.data;
};
```

### Get Project Members
```javascript
// GET /projects/:projectId/members
const getProjectMembers = async (projectId) => {
  const response = await API.get(`/projects/${projectId}/members`);
  return response.data;
};
```

### Add Member to Project
```javascript
// POST /projects/:projectId/members
// Admin only
const addMember = async (projectId, memberData) => {
  const response = await API.post(`/projects/${projectId}/members`, {
    email: 'member@example.com',
    role: 'member' // 'admin', 'project_admin', or 'member'
  });
  return response.data;
};
```

### Update Member Role
```javascript
// PUT /projects/:projectId/members/:userId
// Admin only
const updateMemberRole = async (projectId, userId, role) => {
  const response = await API.put(`/projects/${projectId}/members/${userId}`, {
    role: 'project_admin' // 'admin', 'project_admin', or 'member'
  });
  return response.data;
};
```

### Remove Member
```javascript
// DELETE /projects/:projectId/members/:userId
// Admin only
const removeMember = async (projectId, userId) => {
  const response = await API.delete(`/projects/${projectId}/members/${userId}`);
  return response.data;
};
```

---

## Task Endpoints

### Get All Tasks for Project
```javascript
// GET /tasks/:projectId
const getTasks = async (projectId) => {
  const response = await API.get(`/tasks/${projectId}`);
  return response.data;
};
```

### Get Task by ID
```javascript
// GET /tasks/:projectId/:taskId
const getTask = async (projectId, taskId) => {
  const response = await API.get(`/tasks/${projectId}/${taskId}`);
  return response.data;
};
```

### Create Task
```javascript
// POST /tasks/:projectId
// Admin or Project Admin only
const createTask = async (projectId, taskData) => {
  const response = await API.post(`/tasks/${projectId}`, {
    title: 'Task Title',
    description: 'Task description',
    assignedTo: 'userId', // User ID to assign task to
    status: 'todo' // 'todo', 'in_progress', or 'done'
  });
  return response.data;
};
```

### Update Task
```javascript
// PUT /tasks/:projectId/:taskId
// Admin or Project Admin only
const updateTask = async (projectId, taskId, data) => {
  const response = await API.put(`/tasks/${projectId}/${taskId}`, {
    title: 'Updated Title',
    description: 'Updated description',
    assignedTo: 'newUserId',
    status: 'in_progress'
  });
  return response.data;
};
```

### Delete Task
```javascript
// DELETE /tasks/:projectId/:taskId
// Admin or Project Admin only
const deleteTask = async (projectId, taskId) => {
  const response = await API.delete(`/tasks/${projectId}/${taskId}`);
  return response.data;
};
```

### Upload Task Attachment
```javascript
// POST /tasks/:projectId/:taskId/attachments
// Admin or Project Admin only
// Upload ONE file at a time (queue multiple files on frontend)
const uploadAttachment = async (projectId, taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await API.post(
    `/tasks/${projectId}/${taskId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Example: Queue multiple files for upload
const uploadMultipleAttachments = async (projectId, taskId, files) => {
  const results = [];
  for (const file of files) {
    const result = await uploadAttachment(projectId, taskId, file);
    results.push(result.data);
  }
  return results;
};
```

### Delete Task Attachment
```javascript
// DELETE /tasks/:projectId/:taskId/attachments
// Admin or Project Admin only
const deleteAttachment = async (projectId, taskId, fileId) => {
  const response = await API.delete(`/tasks/${projectId}/${taskId}/attachments`, {
    data: { fileId }
  });
  return response.data;
};
```

---

## Subtask Endpoints

### Create Subtask
```javascript
// POST /tasks/:projectId/:taskId/subtasks
const createSubtask = async (projectId, taskId, title) => {
  const response = await API.post(`/tasks/${projectId}/${taskId}/subtasks`, {
    title: 'Subtask title'
  });
  return response.data;
};
```

### Update Subtask
```javascript
// PUT /tasks/:projectId/:taskId/subtasks/:subtaskId
const updateSubtask = async (projectId, taskId, subtaskId, data) => {
  const response = await API.put(
    `/tasks/${projectId}/${taskId}/subtasks/${subtaskId}`,
    {
      title: 'Updated subtask title',
      isCompleted: true
    }
  );
  return response.data;
};
```

### Delete Subtask
```javascript
// DELETE /tasks/:projectId/:taskId/subtasks/:subtaskId
const deleteSubtask = async (projectId, taskId, subtaskId) => {
  const response = await API.delete(
    `/tasks/${projectId}/${taskId}/subtasks/${subtaskId}`
  );
  return response.data;
};
```

---

## Note Endpoints

### Get All Notes for Project
```javascript
// GET /notes/:projectId
const getNotes = async (projectId) => {
  const response = await API.get(`/notes/${projectId}`);
  return response.data;
};
```

### Get Note by ID
```javascript
// GET /notes/:projectId/:noteId
const getNote = async (projectId, noteId) => {
  const response = await API.get(`/notes/${projectId}/${noteId}`);
  return response.data;
};
```

### Create Note
```javascript
// POST /notes/:projectId
// Admin only
const createNote = async (projectId, content) => {
  const response = await API.post(`/notes/${projectId}`, { content });
  return response.data;
};
```

### Update Note
```javascript
// PUT /notes/:projectId/:noteId
// Admin only
const updateNote = async (projectId, noteId, content) => {
  const response = await API.put(`/notes/${projectId}/${noteId}`, { content });
  return response.data;
};
```

### Delete Note
```javascript
// DELETE /notes/:projectId/:noteId
// Admin only
const deleteNote = async (projectId, noteId) => {
  const response = await API.delete(`/notes/${projectId}/${noteId}`);
  return response.data;
};
```

---

## Health Check

```javascript
// GET /healthCheck
const checkHealth = async () => {
  const response = await API.get('/healthCheck');
  return response.data;
};
```

---

## Role-Based Access

| Role | Description |
|------|-------------|
| `admin` | Full access - can manage projects, members, tasks, notes |
| `project_admin` | Can manage tasks and subtasks within assigned projects |
| `member` | Can view projects/tasks, update subtask completion status |

---

## File Upload Notes

1. **Avatar**: Max 2MB, Images only (jpeg, png, jpg, gif, webp)
2. **Attachments**: Max 5MB, Images + PDFs allowed
3. Files are stored on ImageKit CDN - use the returned `url` directly
4. For multiple attachments, upload one at a time (queue on frontend)

---

## Error Handling Example

```javascript
import API from './api/axios';

const fetchProjects = async () => {
  try {
    const response = await API.get('/projects');
    return { success: true, data: response.data.data };
  } catch (error) {
    const message = error.response?.data?.message || 'Something went wrong';
    return { success: false, error: message };
  }
};
```

---

## React Hook Example

```javascript
// hooks/useApi.js
import { useState, useCallback } from 'react';
import API from '../api/axios';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await API({ method, url, data, ...config });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Request failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
};

// Usage
const { request, loading, error } = useApi();
const projects = await request('get', '/projects');
```

---

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- Additional origins can be set via `CORS_ORIGIN` environment variable

Make sure your frontend URL is added to the backend's CORS configuration on Render.
