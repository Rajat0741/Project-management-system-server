import { createFileRoute } from "@tanstack/react-router";
import ResendVerificationForm from "@/components/Auth/ResendVerificationForm";

export const Route = createFileRoute("/_notprotected/_auth/resendVerificationToken")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ResendVerificationForm />;
}
