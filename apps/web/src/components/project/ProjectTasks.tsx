import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { tasksQueryOptions } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { TaskStatusLabels } from "@/schemas/task.schema";
import type { ProjectMemberWithDetails, TaskStatus } from "@/types";
import { CreateTaskButton } from "./CreateTaskButton";
import { TaskItem } from "./TaskItem";

interface ProjectTasksProps {
  projectId: string;
  members: ProjectMemberWithDetails[];
  isAdmin: boolean;
}

export function ProjectTasks({
  projectId,
  members,
  isAdmin,
}: ProjectTasksProps) {
  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery(tasksQueryOptions(projectId));
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  const allTasks = tasks ?? [];
  const filteredTasks =
    statusFilter === "all"
      ? allTasks
      : allTasks.filter((task) => task.status === statusFilter);
  const statusCounts = {
    all: allTasks.length,
    todo: allTasks.filter((task) => task.status === "todo").length,
    in_progress: allTasks.filter((task) => task.status === "in_progress")
      .length,
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
        <p className="text-muted-foreground text-lg">
          Error loading tasks. Please try again.
        </p>
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
        {isAdmin && (
          <CreateTaskButton projectId={projectId} members={members} />
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-foreground/70"
            initial={{ width: 0 }}
            animate={{
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
            }}
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
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
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
          <p className="meta-text mt-1">
            Create your first task to get started
          </p>
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
