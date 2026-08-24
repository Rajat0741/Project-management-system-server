import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { DotBackground } from "@/components/ui/DotBackground";

export const Route = createFileRoute("/_notprotected")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
});

function RouteComponent() {
  return (
    <DotBackground>
      <div className="flex flex-col w-full h-full items-center justify-center min-h-screen">
        <Outlet />
      </div>
    </DotBackground>
  );
}
