import apiClient from "@/lib/axiosApi";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

export const Route = createFileRoute("/_notprotected/_message/verifyEmail/$verificationToken")({
  component: SuccessfullyVerified,
  pendingComponent: Verifying,
  errorComponent: InvalidOrExpiredToken,
  loader: async ({ params }) => {
    const { verificationToken } = params;
    const response = await apiClient.get(`/auth/verify-email/${verificationToken}`);
    return response.data;
  },
});

// Success Component - Email Successfully Verified
function SuccessfullyVerified() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to login after 3 seconds
    const timer = setTimeout(() => {
      navigate({ to: "/login" });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <CheckCircle2 className="size-10 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
        <CardDescription className="text-base">Your email has been successfully verified</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">You can now access all features of your account.</p>
        <Button className="w-full" onClick={() => navigate({ to: "/login" })}>
          Continue to Login
        </Button>
        <p className="text-xs text-muted-foreground">Redirecting automatically in 3 seconds...</p>
      </CardContent>
    </Card>
  );
}

// Pending Component - Verifying in Progress
function Verifying() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
          <Loader2 className="size-10 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
        <CardTitle className="text-2xl font-bold">Verifying...</CardTitle>
        <CardDescription className="text-base">Please wait while we verify your email</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">This will only take a moment.</p>
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

// Error Component - Invalid or Expired Token
function InvalidOrExpiredToken({ error }: { error: any }) {
  const navigate = useNavigate();
  const errorMessage = error?.message || error?.data?.message || "Invalid or expired verification token";

  return (
    <Card className="w-full max-w-md border-destructive/50">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
          <XCircle className="size-10 text-red-600 dark:text-red-400" />
        </div>
        <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
        <CardDescription className="text-base">{errorMessage}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          The verification link may have expired or is invalid. Please request a new verification email.
        </p>
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => navigate({ to: "/resendVerificationToken" })}>
            Request New Link
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/login" })}>
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
