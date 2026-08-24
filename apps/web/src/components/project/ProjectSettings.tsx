import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateProjectSchema,
  AddMemberSchema,
  type CreateProjectData,
  type AddMemberData,
} from "@/schemas/project.schema";
import { useUpdateProject, useAddProjectMember, useDeleteProject } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import type { Project } from "@/types";
import { toast } from "sonner";

interface ProjectSettingsProps {
  project: Project;
}

export function ProjectSettings({ project }: ProjectSettingsProps) {
  return (
    <div className="space-y-6">
      <EditProjectForm project={project} />
      <AddMemberForm projectId={project._id} />
      <DeleteProjectSection projectId={project._id} projectName={project.name} />
    </div>
  );
}

function EditProjectForm({ project }: { project: Project }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectData>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || "",
    },
  });

  const updateProject = useUpdateProject(project._id);

  const onSubmit = (data: CreateProjectData) => {
    updateProject.mutate(data, {
      onSuccess: () => {
        toast.success("Project updated successfully");
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Information</CardTitle>
        <CardDescription>Update the project's details</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="edit-project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel>Project Name</FieldLabel>
              <Input {...register("name")} placeholder="Enter project name" />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Input {...register("description")} placeholder="Enter description" />
              <FieldError>{errors.description?.message}</FieldError>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex justify-end">
        <Button type="submit" form="edit-project-form" disabled={updateProject.isPending}>
          {updateProject.isPending && <Spinner className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function AddMemberForm({ projectId }: { projectId: string }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberData>({
    resolver: zodResolver(AddMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const addMember = useAddProjectMember(projectId);

  const onSubmit = (data: AddMemberData) => {
    addMember.mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Team Member</CardTitle>
        <CardDescription>Invite a new member to the project</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="add-member-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-end"
        >
          <div className="flex-1 w-full">
            <Field>
              <FieldLabel>Email Address</FieldLabel>
              <Input {...register("email")} placeholder="Enter email address" />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>
          </div>
          <div className="w-full sm:w-45">
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.role?.message}</FieldError>
            </Field>
          </div>
          <Button type="submit" disabled={addMember.isPending}>
            {addMember.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Add Member
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DeleteProjectSection({ projectId, projectName }: { projectId: string; projectName: string }) {
  const deleteProject = useDeleteProject();

  const handleDelete = () => {
    deleteProject.mutate(projectId);
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <CardDescription>
            Permanently delete this project and all of its content. This action cannot be undone.
          </CardDescription>
          <div className="text-sm text-muted-foreground mt-2">Reference ID: {projectId}</div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" className="shrink-0">
                Delete Project
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project
                <span className="font-semibold text-foreground"> {projectName}</span> and remove all data associated
                with it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteProject.isPending ? "Deleting..." : "Delete Project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
