export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
}

export const AvailableUserRole = Object.values(UserRolesEnum);

export const TasksStatusEnum  = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: 'done'
}

export const AvailableTaskStatuses = Object.values(TasksStatusEnum)