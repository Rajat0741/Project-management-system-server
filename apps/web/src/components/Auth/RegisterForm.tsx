import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { useRegister } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

export default function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const registerMutation = useRegister();

  const handleFormSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-2xl", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.fullName}>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input id="fullName" type="text" placeholder="John Doe" className="border-foreground/30" {...register("fullName")} />
                  <FieldError errors={errors.fullName ? [errors.fullName] : []} />
                </Field>
                <Field data-invalid={!!errors.username}>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input id="username" type="text" placeholder="johndoe" className="border-foreground/30" {...register("username")} />
                  <FieldError errors={errors.username ? [errors.username] : []} />
                </Field>
              </div>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" className="border-foreground/30" {...register("email")} />
                <FieldError errors={errors.email ? [errors.email] : []} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" className="border-foreground/30" {...register("password")} />
                <FieldError errors={errors.password ? [errors.password] : []} />
                <FieldDescription>Must be at least 8 characters long.</FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
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
