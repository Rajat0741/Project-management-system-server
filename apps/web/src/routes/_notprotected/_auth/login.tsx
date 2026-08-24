import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/Auth/LoginForm";

export const Route = createFileRoute("/_notprotected/_auth/login")({
  component: Login,
});

function Login() {
  return <LoginForm />;
}
