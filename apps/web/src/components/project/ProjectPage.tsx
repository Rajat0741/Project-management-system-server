import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project, ProjectMemberWithDetails } from "@/types";
import { ProjectMembers } from "./ProjectMembersList";
import { ProjectOverview } from "./ProjectOverview";
import { ProjectSettings } from "./ProjectSettings";
import { ProjectTasks } from "./ProjectTasks";

interface ProjectDetailsProps {
  project: Project;
  members: ProjectMemberWithDetails[];
  currentUserRole?: "admin" | "member";
}

export function ProjectDetails({
  project,
  members,
  currentUserRole = "member",
}: ProjectDetailsProps) {
  const isAdmin = currentUserRole === "admin";
  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      <Tabs defaultValue="project" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="w-full max-w-125 dark:bg-neutral-900">
            <TabsTrigger value="project">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            {isAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>
        </div>

        <TabsContent
          value="project"
          className="space-y-6 animate-in fade-in-0 slide-in-from-left-2 duration-300"
        >
          <ProjectOverview
            project={project}
            members={members}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent
          value="members"
          className="pt-2 animate-in fade-in-0 slide-in-from-left-2 duration-300"
        >
          <ProjectMembers projectId={project._id} />
        </TabsContent>

        <TabsContent
          value="tasks"
          className="pt-2 animate-in fade-in-0 slide-in-from-left-2 duration-300"
        >
          <ProjectTasks
            projectId={project._id}
            members={members}
            isAdmin={isAdmin}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent
            value="settings"
            className="pt-2 animate-in fade-in-0 slide-in-from-left-2 duration-300"
          >
            <ProjectSettings project={project} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
