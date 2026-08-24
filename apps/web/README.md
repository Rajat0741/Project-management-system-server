# Project Management System - Client Side

A modern, full-featured project management system built with React, TypeScript, and TanStack Router. This application provides a complete solution for managing projects, tasks, team collaboration, and file handling with a focus on user experience and performance.

## ✨ Features

### 🔐 Authentication
- User registration with email verification
- Secure login/logout with JWT tokens
- Password reset flow (forgot password → email → reset)
- Email verification resend functionality
- Change password for authenticated users
- Profile avatar upload and management
- Automatic token refresh with session management

### 📊 Project Management
- Create, read, update, and delete projects
- Project dashboard with card-based layout
- Filter projects by role (admin/member) and search
- Sort projects (newest, oldest, name A-Z, name Z-A)
- Role-based access control (admin/member)
- Project overview with detailed information
- Invite team members by email
- Remove members and manage permissions
- Leave project functionality

### ✅ Task Management
- Create tasks with title, description, and assignees
- Task status tracking (Not Started, In Progress, Done)
- Edit and delete tasks
- Subtask system with completion tracking
- Assign/reassign tasks to team members
- Filter tasks by status and assignee
- Multiple file attachments per task
- Download individual files or bulk download as ZIP
- Visual progress indicators

### 👤 User Profile
- View and edit profile information
- Avatar management with upload
- Change password with validation
- Account details display

### 🎨 UI/UX Features
- Dark/Light mode toggle with persistence
- Fully responsive design (mobile, tablet, desktop)
- Toast notifications for all actions
- Loading states with spinners and skeletons
- Custom animated components:
- Server health check with cold start detection

## 🛠️ Tech Stack

### Core
- **React 19.2.0** - UI library with concurrent features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.2.4** - Fast build tool and dev server

### Routing & State
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query (React Query)** - Server state management
- **Zustand** - Lightweight client state with persistence

### UI & Styling
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **shadcn/ui** - Customizable component library
- **Aceternity UI** - Advanced animated components
- **Lucide React** - Modern icon library
- **Motion** - Animation library (formerly Framer Motion)
- **next-themes** - Dark mode support

### Forms & Validation
- **React Hook Form** - Performant form management
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation integration

### Data & Utilities
- **Axios** - HTTP client with interceptors
- **JSZip** - File compression for bulk downloads
- **file-saver** - Client-side file downloads
- **date-fns** - Date manipulation
- **Sonner** - Toast notifications
## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Backend API** - This is the client-side application. You need the [backend server](https://github.com/Rajat0741/Project-management-system-server.git) running

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

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:10000/api/v1
   ```
   
   For production:
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api/v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (includes TypeScript check)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication forms (Login, Register, etc.)
│   ├── profile/        # User profile components
│   ├── project/        # Project management components
│   ├── shared/         # Reusable components (Header, Error pages)
│   └── ui/            # shadcn/ui components (34 components)
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication operations
│   ├── useProjects.ts  # Project CRUD operations
│   ├── useTasks.ts     # Task & subtask operations
│   ├── useServerHealth.ts # Health check
│   ├── useTheme.ts     # Dark mode toggle
│   └── useColdStartToast.ts # Backend warming notification
├── lib/                # Utilities and configurations
│   ├── axiosApi.ts     # Axios instance with interceptors
│   ├── utils.ts        # Helper utility functions
│   └── zipUtils.ts     # File compression utilities
├── routes/             # File-based routing structure
│   ├── __root.tsx      # Root layout with theme & providers
│   ├── index.tsx       # Landing page
│   ├── _protected/     # Auth-required routes
│   │   ├── dashboard.tsx
│   │   ├── profile.tsx
│   │   └── project.$projectid.tsx
│   └── _notprotected/  # Public routes
│       └── _auth/      # Auth pages
├── schemas/            # Zod validation schemas
│   ├── auth.schema.ts
│   ├── project.schema.ts
│   └── task.schema.ts
├── store/             # Zustand state management
│   └── userData.ts    # User data with localStorage persistence
├── types/             # TypeScript type definitions
│   └── index.ts       # Comprehensive type definitions
└── utils/             # Additional utilities
    └── axiosApiHandler.ts
```

## 🔗 API Integration

This application connects to a RESTful API backend. The API handles:
- User authentication and authorization
- Project CRUD operations
- Task management
- File uploads and downloads
- Team member management

### API Configuration

The application uses Axios with:
- **Automatic token refresh** - Handles expired tokens transparently
- **Credentials support** - JWT tokens stored in HTTP-only cookies
- **Error handling** - Centralized error responses with user-friendly messages
- **Request interceptors** - Automatic authorization headers

## 🎯 Key Features Explained

### Protected Routes
Routes under `_protected/` require authentication. Unauthenticated users are automatically redirected to the login page.

### Optimistic Updates
The app uses React Query's optimistic updates for instant UI feedback before server confirmation.

### File Handling
- Upload multiple files to tasks
- Download individual attachments
- Bulk download all task attachments as ZIP

### Cold Start Detection
The app detects when the backend is warming up (common with free-tier hosting) and notifies users with an estimated wait time.

### Type Safety
End-to-end type safety with TypeScript and Zod schemas for runtime validation.

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_API_URL` = Your backend API URL
3. Deploy

The project includes a `vercel.json` configuration file for proper routing.

### Other Platforms
Build the project and deploy the `dist` folder:
```bash
npm run build
```

Make sure to configure the environment variable `VITE_API_URL` on your hosting platform.

## 🔧 Configuration

### Component Library
The project uses shadcn/ui with custom configuration:
- **Style**: base-maia
- **Icons**: Lucide
- **Custom registry**: Aceternity UI for animated components

Configure in `components.json`

### Tailwind CSS
Custom Tailwind configuration with CSS variables for theming. Modify in `tailwind.config.js` (if present) or via `components.json`.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Aceternity UI](https://ui.aceternity.com/) - Animated components
- [TanStack](https://tanstack.com/) - Router and Query libraries
- [Vite](https://vitejs.dev/) - Next-generation build tool

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
