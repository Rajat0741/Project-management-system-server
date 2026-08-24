import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Paperclip, ListTodo } from "lucide-react";
import { CreateTaskSchema, TaskStatusLabels, type CreateTaskData } from "@/schemas/task.schema";
import { useCreateTask } from "@/hooks/useTasks";
import type { ProjectMemberWithDetails } from "@/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AssignTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  assignToMember: ProjectMemberWithDetails;
}

export function AssignTaskDialog({ isOpen, onClose, projectId, assignToMember }: AssignTaskDialogProps) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const createTask = useCreateTask(projectId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskData>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedTo: assignToMember.user._id,
      status: "todo",
      subtasks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subtasks",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allowedFiles = Array.from(e.target.files).filter(
        (file) => file.type.startsWith("image/") || file.type === "application/pdf",
      );
      setAttachments((prev) => [...prev, ...allowedFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CreateTaskData) => {
    // Manually ensure assignedTo is included since it isn't an input field in the form
    const submissionData = { ...data, assignedTo: assignToMember.user._id };

    createTask.mutate(
      { ...submissionData, attachments },
      {
        onSuccess: () => {
          reset();
          setAttachments([]);
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    reset();
    setAttachments([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-muted no-scrollbar max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
        </DialogHeader>

        <form id="assign-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Show who the task is being assigned to */}
          <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
            <Avatar className="h-10 w-10">
              <AvatarImage src={assignToMember.user.avatar?.url} />
              <AvatarFallback>
                {assignToMember.user.fullName?.charAt(0) || assignToMember.user.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{assignToMember.user.fullName || assignToMember.user.username}</p>
              <p className="text-sm text-muted-foreground">@{assignToMember.user.username}</p>
            </div>
          </div>

          <FieldGroup className="space-y-4">
            {/* Title */}
            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input {...register("title")} placeholder="Enter task title" />
              <FieldError>{errors.title?.message}</FieldError>
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel>Description (optional)</FieldLabel>
              <Textarea {...register("description")} placeholder="Enter task description" />
              <FieldError>{errors.description?.message}</FieldError>
            </Field>

            {/* Status */}
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TaskStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.status?.message}</FieldError>
            </Field>

            {/* Subtasks */}
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Subtasks (optional)</FieldLabel>
                <Button type="button" variant="ghost" size="sm" onClick={() => append({ title: "" })}>
                  <ListTodo className="mr-1 h-4 w-4" />
                  Add Subtask
                </Button>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      {...register(`subtasks.${index}.title`)}
                      placeholder={`Subtask ${index + 1}`}
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </Field>

            {/* Attachments */}
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Attachments (optional)</FieldLabel>
                <label className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 cursor-pointer">
                  <Paperclip className="h-4 w-4" />
                  Add File
                  <input type="file" multiple onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAttachment(index)}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="assign-task-form" disabled={createTask.isPending}>
            {createTask.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Assign Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
