import z from "zod"

export const CreateProjectSchema = z.object({
  name: z.string().min(3, "Project name must have atleast 3 characters").max(100, "Project name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal(""))
})

export type CreateProjectData = z.infer<typeof CreateProjectSchema>

export const AddMemberSchema = z.object({
  email: z.email("Please enter a valid email address"),
  role: z.enum(["admin", "member"]),
})

export type AddMemberData = z.infer<typeof AddMemberSchema>