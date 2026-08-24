import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectDashboard } from "@/components/project/ProjectDashboard";
import { Spinner } from "@/components/ui/spinner";
import { projectLoadingQueryOptions } from "@/hooks/useProjects";

export const Route = createFileRoute("/_protected/dashboard")({
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(projectLoadingQueryOptions());
  },
  pendingComponent: DashboardPending,
  errorComponent: DashboardError,
  component: DashboardComponent,
});

// Pending Component - displays while data is loading
function DashboardPending() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}

// Error Component - displays when an error occurs
function DashboardError({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Projects</h2>
        <p className="text-red-400">{error.message}</p>
      </div>
    </div>
  );
}

// Main Component - renders when data is successfully loaded
function DashboardComponent() {
  const { data: projects } = useSuspenseQuery(projectLoadingQueryOptions());
  
  return (
    <div className="w-full">
      <ProjectDashboard projects={projects} />
    </div>
  );
}
