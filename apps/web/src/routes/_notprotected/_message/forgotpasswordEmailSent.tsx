import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_notprotected/_message/forgotpasswordEmailSent")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="size-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription className="text-base">Email has been sent to your email address</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">Click the link in the email to change your password.</p>
        <Button variant="outline" className="w-full" onClick={() => window.open("https://mail.google.com", "_blank")}>
          Open Email
        </Button>
        <p className="text-xs text-muted-foreground pt-2">
          Didn't receive the email? Check your spam folder or
          <br />
          <Link to="/register" className="text-primary text-sm hover:underline">
            resend password change request
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
