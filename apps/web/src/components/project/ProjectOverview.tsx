import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Project, ProjectMemberWithDetails, Task, TaskStatus } from "@/types";
import { tasksQueryOptions } from "@/hooks/useTasks";
import { useLeaveProject, useUpdateProject } from "@/hooks/useProjects";
import { TaskStatusLabels } from "@/schemas/task.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  LogOut,
  Pencil,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

interface ProjectOverviewProps {
  project: Project;
  members: ProjectMemberWithDetails[];
  isAdmin: boolean;
}

const statusPriority: Record<TaskStatus, number> = {
  in_progress: 0,
  todo: 1,
  done: 2,
};

export function ProjectOverview({ project, members, isAdmin }: ProjectOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const updateProject = useUpdateProject(project._id);
  const { data: tasks, isLoading: isLoadingTasks } = useQuery(tasksQueryOptions(project._id));

  const allTasks = tasks ?? [];
  const taskCounts = {
    total: allTasks.length,
    todo: allTasks.filter((task) => task.status === "todo").length,
    inProgress: allTasks.filter((task) => task.status === "in_progress").length,
    done: allTasks.filter((task) => task.status === "done").length,
  };

  const ACTIVE_TASKS_LIMIT = 5;
  const DONE_TASKS_LIMIT = 3;

  const activeTasks = allTasks
    .filter((task) => task.status === "in_progress" || task.status === "todo")
    .sort((a, b) => {
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, ACTIVE_TASKS_LIMIT);

  const doneTasks = allTasks
    .filter((task) => task.status === "done")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, DONE_TASKS_LIMIT);

  const previewTasks = activeTasks.length > 0 ? activeTasks : doneTasks;
  const progress = taskCounts.total > 0 ? Math.round((taskCounts.done / taskCounts.total) * 100) : 0;
  const adminCount = members.filter((member) => member.role === "admin").length;
  const memberCount = members.length - adminCount;

  const handleSave = () => {
    updateProject.mutate(
      { name, description },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleCancel = () => {
    setName(project.name);
    setDescription(project.description || "");
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-foreground/15 dark:bg-card dark:shadow-none">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
          {isEditing ? (
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <label className="section-header">Project name</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} className="mt-2" />
              </div>
              <div>
                <label className="section-header">Description</label>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 min-h-24"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={handleSave} disabled={updateProject.isPending}>
                  <Check className="size-4" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="size-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="min-w-0 wrap-break-word text-xl font-semibold tracking-tight text-foreground">
                  {project.name}
                </h2>
                <Badge variant={isAdmin ? "default" : "secondary"} className="capitalize">
                  {isAdmin ? "Admin" : "Member"}
                </Badge>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {project.description || "No description provided"}
              </p>
            </div>
          )}

          {!isEditing && (
            <div className="flex shrink-0 items-center gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
              )}
              <LeaveProjectButton projectId={project._id} />
            </div>
          )}
        </div>

        <div className="grid gap-3 border-t border-slate-200 bg-slate-50/50 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-foreground/10 dark:bg-transparent">
          <OverviewStat icon={ListTodo} label="Tasks" value={taskCounts.total} detail={`${progress}% complete`} />
          <OverviewStat icon={Clock3} label="In progress" value={taskCounts.inProgress} detail="Active now" />
          <OverviewStat icon={Users} label="Members" value={members.length} detail={`${adminCount} admin`} />
          <OverviewStat icon={Calendar} label="Updated" value={formatDate(project.updatedAt)} detail="Last change" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_20rem] min-w-0">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-foreground/15 dark:bg-card dark:shadow-none overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-4 dark:border-foreground/10">
            <div>
              <h3 className="text-base font-medium text-foreground">Active work</h3>
              <p className="meta-text mt-0.5">
                {taskCounts.done} of {taskCounts.total} completed
              </p>
            </div>
            <Badge variant="outline">{taskCounts.todo} not started</Badge>
          </div>

          {taskCounts.total > 0 && (
            <div className="px-4 pt-4">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground/70" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="p-4">
            <TaskPreview tasks={previewTasks} isLoading={isLoadingTasks} showingCompleted={activeTasks.length === 0} />
          </div>
        </div>

        <aside className="rounded-xl border min-w-0 border-slate-200 bg-white p-4 shadow-sm dark:border-foreground/15 dark:bg-card dark:shadow-none overflow-hidden">
          <p className="section-header">Project details</p>
          <div className="mt-4 space-y-3">
            <DetailRow label="Created" value={formatDate(project.createdAt)} />
            <DetailRow label="Updated" value={formatDate(project.updatedAt)} />
            <DetailRow label="Admins" value={adminCount.toString()} />
            <DetailRow label="Members" value={memberCount.toString()} />
          </div>
        </aside>
      </section>
    </div>
  );
}

interface OverviewStatProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  detail: string;
}

function OverviewStat({ icon: Icon, label, value, detail }: OverviewStatProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xs dark:border-foreground/10 dark:bg-background dark:shadow-none">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
        <p className="meta-text truncate">
          {label} - {detail}
        </p>
      </div>
    </div>
  );
}

function TaskPreview({
  tasks,
  isLoading,
  showingCompleted,
}: {
  tasks: Task[];
  isLoading: boolean;
  showingCompleted: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60 py-10 text-center dark:border-foreground/20 dark:bg-transparent">
        <p className="text-sm font-medium text-foreground">No tasks yet</p>
        <p className="meta-text mt-1">Create a task to start tracking work here.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white dark:divide-foreground/10 dark:border-foreground/15 dark:bg-transparent">
      {showingCompleted && (
        <div className="px-3 py-2">
          <p className="meta-text">No active tasks. Showing recently completed work.</p>
        </div>
      )}
      {tasks.map((task) => (
        <div
          key={task._id}
          className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-muted/40"
        >
          <TaskStatusIcon status={task.status} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
            {task.description && <p className="mt-0.5 truncate">{task.description}</p>}
          </div>
          <Badge variant={task.status === "done" ? "default" : task.status === "in_progress" ? "secondary" : "outline"}>
            {TaskStatusLabels[task.status]}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function TaskStatusIcon({ status }: { status: TaskStatus }) {
  if (status === "done") {
    return <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" />;
  }

  if (status === "in_progress") {
    return <Clock3 className="size-4 shrink-0 text-muted-foreground" />;
  }

  return <Circle className="size-4 shrink-0 text-muted-foreground" />;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="meta-text">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface LeaveProjectButtonProps {
  projectId: string;
}

function LeaveProjectButton({ projectId }: LeaveProjectButtonProps) {
  const { mutate: leaveProject } = useLeaveProject(projectId);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <LogOut className="size-4" />
            Leave
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You will lose access to this project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => leaveProject()}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
