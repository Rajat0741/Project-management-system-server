import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { useChangePassword } from "@/hooks/useAuth";
import { changePasswordSchema } from "@/schemas/auth.schema";
import type { ChangePasswordFormData } from "@/schemas/auth.schema";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      },
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="w-full inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-accent shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
        <KeyRound className="size-4" />
        Change Password
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-muted ">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new password to update your credentials.
          </DialogDescription>
        </DialogHeader>

        <form id="change-password-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            {/* Current Password */}
            <Field>
              <FieldLabel>Current Password</FieldLabel>
              <div className="relative">
                <Input
                  {...register("currentPassword")}
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError>{errors.currentPassword?.message}</FieldError>
            </Field>

            {/* New Password */}
            <Field>
              <FieldLabel>New Password</FieldLabel>
              <div className="relative">
                <Input
                  {...register("newPassword")}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError>{errors.newPassword?.message}</FieldError>
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="change-password-form" disabled={changePassword.isPending}>
            {changePassword.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Update Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
