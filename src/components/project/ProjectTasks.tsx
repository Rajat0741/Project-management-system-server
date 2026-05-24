import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
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
  tasksQueryOptions,
  taskByIdQueryOptions,
  useDeleteTask,
  useToggleSubtaskStatus,
  useUpdateSubtask,
  useDeleteSubtask,
} from "@/hooks/useTasks";
import { TaskStatusLabels } from "@/schemas/task.schema";
import { CreateTaskButton } from "./CreateTaskButton";
import { EditTaskButton } from "./EditTaskDialog";
import { DownloadAttachmentsButton } from "./DownloadAttachmentsButton";
import type { Task, TaskStatus, SubTask, ProjectMemberWithDetails } from "@/types";

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

interface ProjectTasksProps {
  projectId: string;
  members: ProjectMemberWithDetails[];
  isAdmin: boolean;
}

export function ProjectTasks({ projectId, members, isAdmin }: ProjectTasksProps) {
  const { data: tasks, isLoading, isError } = useQuery(tasksQueryOptions(projectId));
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  const allTasks = tasks ?? [];
  const filteredTasks = statusFilter === "all" ? allTasks : allTasks.filter((task) => task.status === statusFilter);
  const statusCounts = {
    all: allTasks.length,
    todo: allTasks.filter((task) => task.status === "todo").length,
    in_progress: allTasks.filter((task) => task.status === "in_progress").length,
    done: allTasks.filter((task) => task.status === "done").length,
  };

  const completedCount = statusCounts.done;
  const totalCount = statusCounts.all;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 py-12 text-center dark:border-foreground/20 dark:bg-transparent">
        <p className="text-muted-foreground text-lg">Error loading tasks. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-foreground/15 dark:bg-card dark:shadow-none">
      {/* Header toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
          <p className="meta-text mt-0.5">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        {isAdmin && <CreateTaskButton projectId={projectId} members={members} />}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-foreground/70"
            initial={{ width: 0 }}
            animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-foreground/10">
        {(["all", "todo", "in_progress", "done"] as const).map((status) => {
          const labels: Record<string, string> = {
            all: "All",
            todo: "Not Started",
            in_progress: "In Progress",
            done: "Done",
          };
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "relative px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {labels[status]}
              <span
                className={cn(
                  "ml-1.5 text-xs tabular-nums",
                  isActive ? "text-foreground/70" : "text-muted-foreground",
                )}
              >
                {statusCounts[status]}
              </span>
              {isActive && (
                <motion.div
                  layoutId="task-filter-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 py-12 text-center dark:border-foreground/20 dark:bg-transparent">
          <p className="text-muted-foreground">
            {statusFilter !== "all"
              ? `No tasks with status "${TaskStatusLabels[statusFilter as TaskStatus] || statusFilter}"`
              : "No tasks yet"}
          </p>
          <p className="meta-text mt-1">Create your first task to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-foreground/10 dark:border-foreground/15 dark:bg-transparent">
          <AnimatePresence initial={true}>
            {filteredTasks.map((task, index) => (
              <TaskItem
                key={task._id}
                task={task}
                projectId={projectId}
                members={members}
                isAdmin={isAdmin}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Status badge variant mapping
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

function TaskItem({ task, projectId, members, isAdmin, index }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteTask = useDeleteTask(projectId);

  const assignee = members.find((m) => m.user._id === task.assignedTo);

  // Lazy load task details (including subtasks) when expanded
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
          {/* Collapsed row */}
          <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:items-center dark:hover:bg-muted/40">
            {/* Expand toggle */}
            <CollapsibleTrigger
              render={
                <Button variant="ghost" size="icon-xs" className="shrink-0 mt-0.5 sm:mt-0">
                  {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </Button>
              }
            />

            {/* Title + description */}
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

            {/* Metadata row */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {/* Assignee avatar */}
              {assignee && (
                <div className="flex items-center gap-1.5" title={assignee.user.fullName}>
                  <Avatar className="size-5">
                    <AvatarImage src={assignee.user.avatar.url} alt={assignee.user.fullName} />
                    <AvatarFallback className="text-[10px]">{assignee.user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="meta-text hidden lg:inline">{assignee.user.fullName.split(" ")[0]}</span>
                </div>
              )}

              {/* Status badge */}
              <Badge variant={statusVariants[task.status] || "outline"} className="text-xs">
                {TaskStatusLabels[task.status] || task.status}
              </Badge>

              {/* Admin actions */}
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

          {/* Expanded content */}
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

      {/* Delete Dialog */}
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
      {/* Subtasks */}
      {hasSubtasks && (
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
      )}

      {hasAttachments && hasSubtasks && <Separator className="bg-muted-foreground/15 my-2" />}

      {/* Attachments */}
      {hasAttachments && (
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
      )}
    </div>
  );
}
