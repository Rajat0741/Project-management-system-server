import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { Link } from "@tanstack/react-router";
import { useLogin } from "@/hooks/useAuth";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const loginMutation = useLogin();

  const handleFormSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" required className="border-foreground/30" {...register("email")} />
                <FieldError errors={errors.email ? [errors.email] : []} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link to="/forgotPasswordRequest" className="ml-auto text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required className="border-foreground/30" {...register("password")} />
                <FieldError errors={errors.password ? [errors.password] : []} />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don't have an account?{" "}
                  <Link to="/register" className="cursor-pointer text-primary hover:underline">
                    Sign up
                  </Link>
                  <br />
                  <Link to="/resendVerificationToken" className="cursor-pointer text-primary hover:underline">
                    Resend verification email
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
