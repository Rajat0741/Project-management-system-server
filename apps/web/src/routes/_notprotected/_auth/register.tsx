import { createFileRoute } from "@tanstack/react-router";
import RegisterForm from "@/components/Auth/RegisterForm";

export const Route = createFileRoute("/_notprotected/_auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RegisterForm />;
}
