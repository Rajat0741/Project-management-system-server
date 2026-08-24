import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { projectFetchingQueryOptions, projectMembersFetchingQueryOptions } from "@/hooks/useProjects";
import { ProjectDetails } from "@/components/project/ProjectPage";
import { Spinner } from "@/components/ui/spinner";
import { useGetCurrentUser } from "@/hooks/useAuth";

export const Route = createFileRoute("/_protected/project/$projectid")({
  beforeLoad: async ({ context, params }) => {
    // Ensure project details are preloaded
    await context.queryClient.ensureQueryData(projectFetchingQueryOptions(params.projectid));
  },
  loader: ({ context, params }) => {
    // Start fetching members in loader
    context.queryClient.ensureQueryData(projectMembersFetchingQueryOptions(params.projectid));
  },
  component: ProjectRouteComponent,
  pendingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
});

function ProjectRouteComponent() {
  const { projectid } = Route.useParams();

  // Suspend component until project data is available (since we ensured it in beforeLoad)
  const { data: project } = useSuspenseQuery(projectFetchingQueryOptions(projectid));

  const { data: members } = useSuspenseQuery(projectMembersFetchingQueryOptions(projectid));

  // Get current user to check role
  const { data: currentUserResponse } = useGetCurrentUser();
  const currentUser = currentUserResponse?.data;

  // Determine role
  const currentMember = members.find((m) => m.user._id === currentUser?._id);
  const userRole = currentMember?.role || "member"; // Default to member if not found/loading, preventing admin access errantly

  return (
    <div className="w-full h-full p-4 md:p-8">
      <ProjectDetails project={project} members={members} currentUserRole={userRole} />
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Spinner />
    </div>
  );
}

function ErrorComponent() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center text-red-500">
      Error loading project. Please try again.
    </div>
  );
}
