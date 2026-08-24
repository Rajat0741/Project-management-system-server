import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Paperclip, ListTodo } from "lucide-react";
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

interface CreateTaskButtonProps {
  projectId: string;
  members: ProjectMemberWithDetails[];
}

export function CreateTaskButton({ projectId, members }: CreateTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Task
      </Button>
      <CreateTaskDialog isOpen={isOpen} onClose={() => setIsOpen(false)} projectId={projectId} members={members} />
    </>
  );
}

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMemberWithDetails[];
}

function CreateTaskDialog({ isOpen, onClose, projectId, members }: CreateTaskDialogProps) {
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
      assignedTo: "",
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
    createTask.mutate(
      { ...data, attachments },
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
      <DialogContent className="max-w-11/12 md:max-w-xl bg-muted no-scrollbar max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form id="create-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Assigned To */}
            <Field>
              <FieldLabel>Assign To</FieldLabel>
              <Controller
                control={control}
                name="assignedTo"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member">
                        {field.value ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={members.find((m) => m.user._id === field.value)?.user.avatar?.url} />
                              <AvatarFallback>
                                {members.find((m) => m.user._id === field.value)?.user.fullName?.charAt(0) ||
                                  members.find((m) => m.user._id === field.value)?.user.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {members.find((m) => m.user._id === field.value)?.user.fullName ||
                                members.find((m) => m.user._id === field.value)?.user.username}
                            </span>
                          </div>
                        ) : (
                          "Select team member"
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.user._id} value={member.user._id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.user.avatar?.url} />
                              <AvatarFallback>
                                {member.user.fullName?.charAt(0) || member.user.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.user.fullName || member.user.username}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.assignedTo?.message}</FieldError>
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
                      <span className="text-sm truncate max-w-50">{file.name}</span>
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
          <Button type="submit" form="create-task-form" disabled={createTask.isPending}>
            {createTask.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
