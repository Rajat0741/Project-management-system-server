import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordForm from "@/components/Auth/ResetPasswordForm";

export const Route = createFileRoute("/_notprotected/_message/newPassword/$resetToken")({
  component: RouteComponent,
});

function RouteComponent() {
  const { resetToken }= Route.useParams()
  return <ResetPasswordForm resetToken={resetToken} />;
}
