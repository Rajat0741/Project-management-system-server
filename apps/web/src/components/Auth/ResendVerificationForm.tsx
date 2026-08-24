import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resendVerificationSchema, type ResendVerificationFormData } from "@/schemas/auth.schema";
import { useResendVerificationToken } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

export default function ResendVerificationForm({ className, ...props }: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
    mode: "onBlur",
  });

  const navigate = useNavigate();
  const resendVerificationMutation = useResendVerificationToken();

  const handleFormSubmit = (data: ResendVerificationFormData) => {
    resendVerificationMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Resend Verification Email</CardTitle>
          <CardDescription>Enter your email to receive a new verification link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" required className="border-foreground/30" {...register("email")} />
                <FieldError errors={errors.email ? [errors.email] : []} />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={resendVerificationMutation.isPending}>
                  {resendVerificationMutation.isPending ? "Sending..." : "Send Verification Link"}
                </Button>
                <FieldDescription className="text-center">
                  Already verified?{" "}
                  <a
                    className="cursor-pointer text-primary hover:underline"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate({ to: "/login" });
                    }}
                  >
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
