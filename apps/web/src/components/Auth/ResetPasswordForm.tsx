import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/auth.schema";
import { useResetPassword } from "@/hooks/useAuth";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordFormProps {
  resetToken: string;
}

export default function ResetPasswordForm({ resetToken }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const resetPasswordMutation = useResetPassword(resetToken);

  const handleFormSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data, {
      onSuccess: () => {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 3000);
      },
    });
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <CheckCircle2 className="size-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Password Reset Successfully!</CardTitle>
          <CardDescription className="text-base">Your password has been updated</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">You can now login with your new password.</p>
          <Button className="w-full" onClick={() => navigate({ to: "/login" })}>
            Continue to Login
          </Button>
          <p className="text-xs text-muted-foreground">Redirecting automatically in 3 seconds...</p>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className="min-w-sm md:min-w-lg mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
            <KeyRound className="size-10 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription className="text-base">Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.newPassword}>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input id="password" type="password" placeholder="Enter new password" className="border-foreground/30" {...register("newPassword")} />
                <FieldError errors={errors.newPassword ? [errors.newPassword] : []} />
              </Field>
              <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending ? "Resetting Password..." : "Reset Password"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
  );
}
