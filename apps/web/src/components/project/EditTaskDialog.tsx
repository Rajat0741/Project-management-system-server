import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Paperclip, Trash2 } from "lucide-react";
import { UpdateTaskSchema, type UpdateTaskData } from "@/schemas/task.schema";
import { useUpdateTask, useCreateSubtask, useAddAttachment, useDeleteAttachment } from "@/hooks/useTasks";
import type { Task } from "@/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

interface EditTaskDialogProps {
  task: Task;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskDialog({ task, projectId, isOpen, onClose }: EditTaskDialogProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newAttachment, setNewAttachment] = useState<File | null>(null);

  const updateTask = useUpdateTask(projectId, task._id);
  const createSubtask = useCreateSubtask(projectId, task._id);
  const addAttachment = useAddAttachment(projectId, task._id);
  const deleteAttachment = useDeleteAttachment(projectId, task._id);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateTaskData>({
    resolver: zodResolver(UpdateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
    },
  });

  const onSubmit = (data: UpdateTaskData) => {
    if (!isDirty) {
      onClose();
      return;
    }
    updateTask.mutate(data, { onSuccess: onClose });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    createSubtask.mutate(
      { title: newSubtaskTitle },
      {
        onSuccess: () => setNewSubtaskTitle(""),
      },
    );
  };

  const handleAddAttachment = () => {
    if (!newAttachment) return;
    addAttachment.mutate(newAttachment, {
      onSuccess: () => setNewAttachment(null),
    });
  };

  const handleDeleteAttachment = (fileId: string) => {
    deleteAttachment.mutate(fileId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-11/12 md:max-w-xl no-scrollbar bg-muted">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form id="edit-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input {...register("title")} placeholder="Task title" />
              <FieldError>{errors.title?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea {...register("description")} placeholder="Task description" />
              <FieldError>{errors.description?.message}</FieldError>
            </Field>
          </FieldGroup>
        </form>

        {/* Add Subtask Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Add Subtask</p>
          <div className="flex gap-2">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="New subtask title"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubtask())}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleAddSubtask}
              disabled={createSubtask.isPending || !newSubtaskTitle.trim()}
            >
              {createSubtask.isPending ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Attachments</p>

          {/* Existing attachments */}
          {task.attachments.length > 0 && (
            <div className="space-y-1">
              {task.attachments.map((att) => (
                <div key={att.fileId} className="flex items-center justify-between p-2 bg-background rounded text-sm">
                  <span className="truncate max-w-50">
                    {decodeURIComponent(new URL(att.url).pathname.split("/").pop() || "file")}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDeleteAttachment(att.fileId)}
                    disabled={deleteAttachment.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add attachment */}
          <div className="flex gap-2">
            <Input
              type="file"
              onChange={(e) => setNewAttachment(e.target.files?.[0] || null)}
              accept="image/*,.pdf"
              className="text-sm"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleAddAttachment}
              disabled={addAttachment.isPending || !newAttachment}
            >
              {addAttachment.isPending ? <Spinner className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-task-form" disabled={updateTask.isPending}>
            {updateTask.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Trigger button for convenience
interface EditTaskButtonProps {
  task: Task;
  projectId: string;
}

export function EditTaskButton({ task, projectId }: EditTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <EditTaskDialog task={task} projectId={projectId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
