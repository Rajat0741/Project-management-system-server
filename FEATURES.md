# Project Management System - Features

This project is a full-stack application divided into two separate repositories for the client frontend and server backend:
- **Client Repository:** [Project Management System - Client Side](https://github.com/Rajat0741/project-management-system--client-side.git)
- **Server Repository:** [Project Management System - Server Backend](https://github.com/Rajat0741/Project-management-system-server.git)

Below is a comprehensive list of all features combining both the client-side UI and the backend API capabilities.

## 🔐 Authentication & Security
- **JWT-Based Architecture:** Secure authentication utilizing short-lived access tokens (15m) and long-lived refresh tokens (7d) stored securely via HTTP-only cookies.
- **Email Verification:** Automated HTML email workflows for verifying user registrations (via Mailgen & Google APIs) before granting system access.
- **Secure Password Reset:** Time-limited password reset tokens delivered via email.
- **Role-Based Access Control (RBAC):** Granular project-level permissions restricting specific actions to `admin`, `project_admin`, or `member`.
- **Protected Routes & API Endpoints:** Complete barrier protection on both the frontend React routes and the backend Express endpoints.

## � User Profile & Settings
- **Profile Management:** Users can view, edit, and update their personal information securely.
- **Avatar Uploads:** Cloud-based image storage (via ImageKit) with automatic thumbnail generation and 5MB size limits.
- **Account Security:** In-app authenticated password change functionality and session management.

## 📊 Project Management
- **Complete CRUD Operations:** Create, read, update, and delete workspaces/projects.
- **Interactive Dashboards:** Card-based project listing with dynamic sorting (date, name) and filtering (by role: admin/member).
- **Team Collaboration:** Add team members to projects, manage ongoing roles, and safely remove members. 
- **Project Overviews:** Detailed project interfaces highlighting tasks, team composition, shared notes, and progress.
- **Leave Project:** Self-serve functionality for members to securely exit a project workspace.

## ✅ Task & Subtask Tracking
- **Task Lifecycle:** Create tasks with rich descriptions, assign them to team members, and aggressively track status (Todo, In Progress, Done).
- **Subtask System:** Break complex tasks down into smaller, actionable subtasks with independent completion checkboxes and tracking.
- **Advanced Filtering:** Filter tasks gracefully by their current status or their assigned member.
- **Visual Indicators:** Real-time progress bars and animated UI indicators for task completion rates.

## 📂 File Handling & Attachments
- **Task Attachments:** Upload multiple files (Images, PDFs) natively per task with sizes up to 10MB each.
- **Cloud Storage Integration:** Reliable, optimized file storing and serving using ImageKit.
- **Versatile Downloads:** Download individual file attachments directly or perform bulk downloads by asynchronously packaging all task attachments into a ZIP file entirely on the client-side.

## 🎨 UI/UX & Frontend Experiences
- **Responsive Layouts:** Fully responsive layout optimized perfectly for mobile, tablet, and desktop viewing.
- **Theming & Aesthetics:** Persistent Dark and Light mode toggles out-of-the-box.
- **Optimistic UI Updates:** Instant, seamless UI feedback upon user interaction before server confirmation, utilizing TanStack React Query.
- **Feedback & Notifications:** Comprehensive toast notification system (Sonner) for all system events, API errors, and success states.
- **Smooth Loading States:** Engaging user experiences via custom spinners, skeletons, and a cold start loader (notifying users with wait estimates when the free-tier backend is actively waking up).
- **Modern Animations:** High-end visual components powered by Aceternity UI and Motion (Framer Motion).

## 🛠️ Combined Technical Stack
- **Frontend Application:** React 19, TypeScript 5, Vite, TanStack Router & Query, Zustand, Tailwind CSS 4, shadcn/ui.
- **Backend API Server:** Node.js, Express v5, MongoDB & Mongoose ODM, multer, express-validator.
- **External Services:** ImageKit (Cloud Object Storage), Google OAuth2 & Mailgen (Email delivery services).
