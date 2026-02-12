# Project Management System - Backend API

A full-featured backend API for managing projects, tasks, team members, and notes with role-based access control, email notifications, and cloud file storage.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Authentication & Authorization](#authentication--authorization)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [License](#license)

## ✨ Features

- **User Authentication** - JWT-based authentication with access and refresh tokens
- **Email Verification** - Automated email verification system
- **Password Reset** - Secure password reset flow with time-limited tokens
- **Project Management** - Create, update, and delete projects
- **Team Collaboration** - Add members to projects with role-based permissions
- **Task Management** - Comprehensive task system with assignments and status tracking
- **Subtasks** - Break down tasks into smaller subtasks
- **File Uploads** - Avatar and task attachment uploads with ImageKit integration
- **Project Notes** - Collaborative note-taking for projects
- **Role-Based Access Control (RBAC)** - Project-level permission management
- **Email Notifications** - Beautiful HTML emails for verification and password reset

## 🛠️ Tech Stack

### Core
- **Node.js** - Runtime environment
- **Express v5.2.1** - Web framework
- **MongoDB** - Database
- **Mongoose v9.0.2** - ODM for MongoDB

### Authentication & Security
- **JWT** (jsonwebtoken) - Token-based authentication
- **bcrypt v6.0.0** - Password hashing
- **cookie-parser** - Cookie handling
- **CORS** - Cross-origin resource sharing

### File Handling & Storage
- **Multer v2.0.2** - File upload middleware
- **ImageKit** - Cloud image and file storage

### Email Services
- **Mailgen** - Email template generation
- **Google APIs** - Gmail OAuth2 integration
- **Axios** - HTTP client for API requests

### Validation
- **express-validator v7.3.1** - Request data validation

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

You'll also need accounts for:
- [ImageKit](https://imagekit.io/) - For file storage
- [Google Cloud Console](https://console.cloud.google.com/) - For Gmail OAuth2 credentials

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables) section)

4. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   mongod
   ```

5. **Run the application**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000` (or your specified PORT).

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Database
MONGO_URI

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

# ImageKit Configuration (File Storage)
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Gmail OAuth2 Configuration
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_USER_EMAIL=your_gmail_address@gmail.com

# Frontend URLs (for email links)
EMAIL_VERIFICATION_URL=http://localhost:5173/verify-email
FORGOT_PASSWORD_URL=http://localhost:5173/reset-password
```

### Setting up Gmail OAuth2:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Configure OAuth consent screen
6. Generate refresh token using OAuth 2.0 Playground

### Setting up ImageKit:
1. Sign up at [ImageKit.io](https://imagekit.io/)
2. Get your Private Key and URL Endpoint from the dashboard
3. Add them to your `.env` file

## 📚 API Documentation

Base URL: `/api/v1`

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthCheck` | Check server health status |

### Authentication (`/auth`)

#### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/resend-email-verification` | Resend verification email |
| GET | `/auth/verify-email/:verificationToken` | Verify email address |
| POST | `/auth/login` | User login |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password/:resetToken` | Reset password |

#### Protected Routes (Require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/logout` | User logout |
| GET | `/auth/current-user` | Get current user details |
| POST | `/auth/change-password` | Change password |
| PATCH | `/auth/avatar` | Update user avatar |

### Projects (`/projects`)

All routes require authentication.

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/projects` | Get all projects for current user | Any member |
| POST | `/projects` | Create new project | Authenticated user |
| GET | `/projects/:projectId` | Get project details | Any member |
| PUT | `/projects/:projectId` | Update project | Admin only |
| DELETE | `/projects/:projectId` | Delete project | Admin only |

#### Project Members

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/projects/:projectId/members` | Get project members | Any member |
| POST | `/projects/:projectId/members` | Add member to project | Admin only |
| DELETE | `/projects/:projectId/members/:userId` | Remove member | Admin only |
| PUT | `/projects/:projectId/members/:userId` | Update member role | Admin only |
| DELETE | `/projects/:projectId/leave` | Leave project | Any member |

### Tasks (`/tasks`)

All routes require authentication.

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/tasks/:projectId` | Get all tasks in project | Any member |
| POST | `/tasks/:projectId` | Create task | Admin/Project Admin |
| GET | `/tasks/:projectId/:taskId` | Get task details | Any member |
| PUT | `/tasks/:projectId/:taskId` | Update task | Admin/Project Admin |
| DELETE | `/tasks/:projectId/:taskId` | Delete task | Admin/Project Admin |

#### Task Attachments

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| POST | `/tasks/:projectId/:taskId/attachments` | Upload attachment | Admin/Project Admin |
| DELETE | `/tasks/:projectId/:taskId/attachments` | Delete attachment | Admin/Project Admin |

#### Subtasks

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| POST | `/tasks/:projectId/:taskId/subtasks` | Create subtask | Any member |
| PUT | `/tasks/:projectId/:taskId/subtasks/:subtaskId` | Update subtask | Any member |
| DELETE | `/tasks/:projectId/:taskId/subtasks/:subtaskId` | Delete subtask | Any member |
| PATCH | `/tasks/:projectId/:taskId/subtasks/:subtaskId/status` | Update subtask status | Any member |

### Notes (`/notes`)

All routes require authentication.

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/notes/:projectId` | Get all notes in project | Any member |
| POST | `/notes/:projectId` | Create note | Admin only |
| GET | `/notes/:projectId/:noteId` | Get note details | Any member |
| PUT | `/notes/:projectId/:noteId` | Update note | Admin only |
| DELETE | `/notes/:projectId/:noteId` | Delete note | Admin only |

## 🗄️ Database Models

### User
```javascript
{
  avatar: { url: String, fileId: String },
  username: String,        // Unique, lowercase, indexed
  email: String,           // Unique, lowercase
  fullName: String,
  password: String,        // Bcrypt hashed
  isEmailVerified: Boolean,
  refreshToken: String,
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  timestamps: true
}
```

**Methods:**
- `isPasswordCorrect(password)` - Compare passwords
- `generateAccessToken()` - Create JWT access token
- `generateRefreshToken()` - Create JWT refresh token
- `generateTemporaryToken()` - Create email verification/reset tokens

### Project
```javascript
{
  name: String,            // Unique
  description: String,
  createdBy: ObjectId,     // Reference to User
  timestamps: true
}
```

### ProjectMember
```javascript
{
  user: ObjectId,          // Reference to User
  project: ObjectId,       // Reference to Project
  role: String,            // admin, project_admin, member
  timestamps: true
}
```

### Task
```javascript
{
  title: String,
  description: String,
  project: ObjectId,       // Reference to Project
  assignedTo: ObjectId,    // Reference to User
  assignedBy: ObjectId,    // Reference to User
  status: String,          // todo, in_progress, done
  attachments: [{
    fileId: String,
    url: String,
    filePath: String,
    thumbnail: String
  }],
  timestamps: true
}
```

### Subtask
```javascript
{
  title: String,
  task: ObjectId,          // Reference to Task
  isCompleted: Boolean,
  createdBy: ObjectId,     // Reference to User
  timestamps: true
}
```

### ProjectNote
```javascript
{
  project: ObjectId,       // Reference to Project
  lastUpdatedBy: ObjectId, // Reference to User
  content: String,
  timestamps: true
}
```

## 🔒 Authentication & Authorization

### JWT-Based Authentication

The system uses two types of tokens:

1. **Access Token** - Short-lived (15 minutes), used for API requests
2. **Refresh Token** - Long-lived (7 days), used to generate new access tokens

Tokens can be sent via:
- HTTP-only cookies (recommended)
- Authorization header: `Bearer <token>`

### User Roles

The system implements project-level role-based access control:

- **admin** - Project owner with full control
- **member** - Basic access to view and contribute

### Middleware

- `verifyJWT` - Validates JWT token and attaches user to request
- `validateProjectPermission(roles)` - Checks project membership and role permissions

### Email Verification

- SHA-256 hashed token with 5-minute expiry
- Automated email sent upon registration
- User cannot log in until email is verified

### Password Reset

- SHA-256 hashed token sent via email
- Token expires in 5 minutes
- Secure password reset flow

## 📁 Project Structure

```
definitions
├── package.json
├── README.md
├── public/
│   └── images/                      # Static files
├── src/
│   ├── index.js                     # Entry point, MongoDB connection, server start
│   ├── app.js                       # Express app configuration and middleware
│   ├── controllers/                 # Business logic
│   │   ├── auth.controllers.js
│   │   ├── healthcheck.controllers.js
│   │   ├── note.controllers.js
│   │   ├── project.controllers.js
│   │   └── task.controllers.js
│   ├── db/
│   │   └── index.js                 # MongoDB connection logic
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT validation & RBAC
│   │   ├── multer.middleware.js     # File upload configuration
│   │   └── validator.middleware.js  # Validation error handling
│   ├── models/                      # Mongoose schemas
│   │   ├── note.models.js
│   │   ├── project.models.js
│   │   ├── projectmember.models.js
│   │   ├── subtask.models.js
│   │   ├── task.models.js
│   │   └── user.models.js
│   ├── routes/                      # API route definitions
│   │   ├── auth.routes.js
│   │   ├── healthcheck.routes.js
│   │   ├── note.routes.js
│   │   ├── project.routes.js
│   │   └── task.routes.js
│   ├── utils/                       # Helper utilities
│   │   ├── api-errors.js            # Custom error class
│   │   ├── api-response.js          # Standardized response format
│   │   ├── asyncHandler.js          # Async error wrapper
│   │   ├── constants.js             # Enums (roles, statuses)
│   │   ├── imagekit.js              # ImageKit upload/delete
│   │   └── mail.js                  # Gmail OAuth2 email sender
│   └── validators/
│       └── index.js                 # express-validator rules
```

## 📜 Scripts

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 🎯 Key Features Explained

### File Upload System
- **Avatar uploads:** Max 5MB, images only (JPEG, PNG, GIF, WebP)
- **Task attachments:** Max 10MB, images + PDFs
- Cloud storage via ImageKit with automatic thumbnail generation
- Organized folder structure for better file management

### Email Service
- Beautiful HTML emails using Mailgen templates
- Gmail OAuth2 for secure email sending
- Templates for email verification and password reset

### Error Handling
- Custom `ApiError` class with HTTP status codes
- Global error handler middleware
- Stack traces in development mode
- Standardized error responses

### Response Formatting
All API responses follow a consistent structure:
```javascript
{
  success: boolean,
  statusCode: number,
  message: string,
  data: object
}
```

### Validation System
- Comprehensive request validation using express-validator
- Custom validators for MongoDB ObjectIds, emails, enums
- Password strength validation
- Detailed validation error messages


## 👤 Author

**Rajat**

## 📄 License

This project is licensed under the ISC License.
