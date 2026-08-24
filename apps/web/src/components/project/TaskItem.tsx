import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Trash2,
  Download,
  FileImage,
  FileText,
  Pencil,
} from "lucide-react";
import {
  taskByIdQueryOptions,
  useDeleteTask,
  useToggleSubtaskStatus,
  useUpdateSubtask,
  useDeleteSubtask,
} from "@/hooks/useTasks";
import { TaskStatusLabels } from "@/schemas/task.schema";
import { EditTaskButton } from "./EditTaskDialog";
import { DownloadAttachmentsButton } from "./DownloadAttachmentsButton";
import type { Task, SubTask, ProjectMemberWithDetails } from "@/types";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Item, ItemContent, ItemTitle, ItemActions, ItemGroup, ItemMedia } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  todo: "outline",
  in_progress: "secondary",
  done: "default",
};

interface TaskItemProps {
  task: Task;
  projectId: string;
  members: ProjectMemberWithDetails[];
  isAdmin: boolean;
  index: number;
}

export function TaskItem({ task, projectId, members, isAdmin, index }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteTask = useDeleteTask(projectId);

  const assignee = members.find((m) => m.user._id === task.assignedTo);

  const { data: taskDetails, isLoading: isLoadingDetails } = useQuery({
    ...taskByIdQueryOptions(projectId, task._id),
    enabled: isExpanded,
  });

  const fullTask = taskDetails || task;

  const handleDelete = () => {
    deleteTask.mutate(task._id, {
      onSuccess: () => setShowDeleteDialog(false),
    });
  };

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.04 }}
          className="group/task"
        >
          <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:items-center dark:hover:bg-muted/40">
            <CollapsibleTrigger
              render={
                <Button variant="ghost" size="icon-xs" className="shrink-0 mt-0.5 sm:mt-0">
                  {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </Button>
              }
            />

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium text-foreground",
                  isExpanded ? "wrap-break-word" : "truncate",
                )}
              >
                {task.title}
              </p>
              {task.description && <p className="meta-text truncate mt-0.5">{task.description}</p>}
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {assignee && (
                <div className="flex items-center gap-1.5" title={assignee.user.fullName}>
                  <Avatar className="size-5">
                    <AvatarImage src={assignee.user.avatar.url} alt={assignee.user.fullName} />
                    <AvatarFallback className="text-[10px]">{assignee.user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="meta-text hidden lg:inline">{assignee.user.fullName.split(" ")[0]}</span>
                </div>
              )}

              <Badge variant={statusVariants[task.status] || "outline"} className="text-xs">
                {TaskStatusLabels[task.status] || task.status}
              </Badge>

              {isAdmin && (
                <div className="flex items-center gap-0.5">
                  <EditTaskButton task={fullTask} projectId={projectId} />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <CollapsibleContent>
            <div className="ml-2 space-y-4 border-t border-dashed border-slate-300 px-4 pb-4 pt-1 dark:border-foreground/20">
              {isLoadingDetails ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : (
                <TaskDetails projectId={projectId} task={fullTask} isAdmin={isAdmin} />
              )}
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{task.title}</strong>? This will also delete all subtasks and
              attachments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleteTask.isPending}>
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface TaskDetailsProps {
  projectId: string;
  task: Task;
  isAdmin: boolean;
}

function TaskDetails({ projectId, task, isAdmin }: TaskDetailsProps) {
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const toggleSubtaskStatus = useToggleSubtaskStatus(projectId, task._id);
  const updateSubtask = useUpdateSubtask(projectId, task._id);
  const deleteSubtask = useDeleteSubtask(projectId, task._id);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasAttachments = task.attachments && task.attachments.length > 0;

  const toggleSubtask = (subtask: SubTask) => {
    toggleSubtaskStatus.mutate({
      subtaskId: subtask._id,
      isCompleted: !subtask.isCompleted,
    });
  };

  const startEditSubtask = (subtask: SubTask) => {
    setEditingSubtaskId(subtask._id);
    setEditingTitle(subtask.title);
  };

  const saveSubtaskEdit = (subtaskId: string) => {
    if (editingTitle.trim()) {
      updateSubtask.mutate({ subtaskId, data: { title: editingTitle } });
    }
    setEditingSubtaskId(null);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteSubtask.mutate(subtaskId);
  };

  const getFileIcon = (url: string) => {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    }
    if (url.match(/\.pdf$/i)) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getFilename = (url: string) => {
    try {
      return decodeURIComponent(new URL(url).pathname.split("/").pop() || "file");
    } catch {
      return "file";
    }
  };

  if (!task.description && !hasSubtasks && !hasAttachments) {
    return <p className="text-sm text-muted-foreground text-center py-2">No additional details</p>;
  }

  return (
    <div className="space-y-4">
      {task.description && (
        <div>
          <p className="section-header my-2">Description</p>
          <p className="text-sm text-foreground wrap-break-word">{task.description}</p>
        </div>
      )}

      {hasSubtasks && (
        <>
          {task.description && <Separator className="bg-muted-foreground/15" />}
          <div>
            <p className="section-header my-2">
              Subtasks ({task.subtasks?.filter((s) => s.isCompleted).length}/{task.subtasks?.length})
            </p>
            <ItemGroup className="gap-2">
              {task.subtasks?.map((subtask) => (
                <Item
                  key={subtask._id}
                  size="xs"
                  variant="outline"
                  className={cn(
                    "items-center bg-background/80 shadow-sm border-muted-foreground/20",
                    subtask.isCompleted && "opacity-50",
                  )}
                >
                  <ItemMedia
                    variant="icon"
                    className="cursor-pointer hover:bg-accent self-center! translate-y-0!"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubtask(subtask);
                    }}
                  >
                    {subtask.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </ItemMedia>
                  <ItemContent>
                    {editingSubtaskId === subtask._id ? (
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => saveSubtaskEdit(subtask._id)}
                        onKeyDown={(e) => e.key === "Enter" && saveSubtaskEdit(subtask._id)}
                        autoFocus
                        className="h-6 text-sm"
                      />
                    ) : (
                      <ItemTitle className={cn(subtask.isCompleted && "line-through")}>{subtask.title}</ItemTitle>
                    )}
                  </ItemContent>
                  {isAdmin && editingSubtaskId !== subtask._id && (
                    <ItemActions>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditSubtask(subtask);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubtask(subtask._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ItemActions>
                  )}
                </Item>
              ))}
            </ItemGroup>
          </div>
        </>
      )}
``````````````````````````````````````````````````````````````````````````````````````````````````````````
      {hasAttachments && (
        <>
          {(task.description || hasSubtasks) && <Separator className="bg-muted-foreground/15" />}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <p className="section-header">Attachments ({task.attachments.length})</p>
              <DownloadAttachmentsButton attachments={task.attachments} fileName={`${task.title}-attachments`} />
            </div>
            <ItemGroup className="gap-2">
              {task.attachments.map((att, i) => (
                <Item
                  key={i}
                  size="xs"
                  variant="outline"
                  className="items-center bg-background/80 shadow-sm border-muted-foreground/20 hover:bg-background transition-colors"
                >
                  <ItemMedia variant="icon" className="self-center! translate-y-0!">
                    {getFileIcon(att.url)}
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="block max-w-full truncate" title={getFilename(att.url)}>
                      {getFilename(att.url)}
                    </ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <a
                      href={`${att.url}?ik-attachment=true`}
                      className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
                      download
                      target="_blank"
                      title="download"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </div>
        </>
      )}
    </div>
  );
}

export type { TaskItemProps };
