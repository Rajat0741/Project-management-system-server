import z from "zod";

// Task status values (API uses "todo", UI displays "not started")
export const TaskStatusEnum = z.enum(["todo", "in_progress", "done"]);

// Display labels for task status
export const TaskStatusLabels: Record<z.infer<typeof TaskStatusEnum>, string> = {
  todo: "Not Started",
  in_progress: "In Progress",
  done: "Done",
};

// Subtask creation schema
export const CreateSubtaskSchema = z.object({
  title: z.string().min(1, "Subtask title is required").max(100, "Subtask title must be less than 100 characters"),
});

// Task creation schema
export const CreateTaskSchema = z.object({
  title: z.string().min(3, "Title must have at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal("")),
  assignedTo: z.string().min(1, "Please select a team member"),
  status: TaskStatusEnum,
  subtasks: z.array(CreateSubtaskSchema).optional(),
});

// Update task schema (all fields optional)
export const UpdateTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must have at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .optional(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  assignedTo: z.string().optional(),
  status: TaskStatusEnum.optional(),
});

export type CreateTaskData = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskData = z.infer<typeof UpdateTaskSchema>;
export type CreateSubtaskData = z.infer<typeof CreateSubtaskSchema>;
