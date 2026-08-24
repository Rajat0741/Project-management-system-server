import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/_notprotected/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium text-xl">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <ClipboardCheck className="size-4" />
          </div>
          Project Management System
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
