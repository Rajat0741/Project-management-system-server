import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_notprotected/_message")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-11/12" >
      <Outlet />
    </div> 
  );
}
