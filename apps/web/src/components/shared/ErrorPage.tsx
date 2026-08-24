import { isAxiosError } from "axios";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, WifiOff, ServerCrash, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorPageProps {
  error: unknown;
  reset?: () => void;
}

type ErrorInfo = {
  title: string;
  message: string;
  icon: React.ReactNode;
  details?: string;
};

function getErrorInfo(error: unknown): ErrorInfo {
  // Network / connection errors
  if (isAxiosError(error) && !error.response) {
    return {
      title: "Connection Failed",
      message:
        "Unable to reach the server. This usually means the server is down or your internet connection is unstable.",
      icon: <WifiOff className="size-12 text-destructive" />,
      details: error.config?.baseURL
        ? `Tried to connect to: ${error.config.baseURL}`
        : "API URL may not be configured. Please contact support.",
    };
  }

  // HTTP errors
  if (isAxiosError(error) && error.response) {
    const status = error.response.status;
    const serverMessage =
      (error.response.data as { message?: string })?.message || error.message;

    if (status === 500) {
      return {
        title: "Server Error",
        message: "Something went wrong on the server. Please try again later.",
        icon: <ServerCrash className="size-12 text-destructive" />,
        details: serverMessage,
      };
    }

    if (status === 403) {
      return {
        title: "Access Denied",
        message: "You don't have permission to access this resource.",
        icon: <AlertCircle className="size-12 text-destructive" />,
      };
    }

    return {
      title: `Error ${status}`,
      message: serverMessage || "An unexpected error occurred.",
      icon: <AlertCircle className="size-12 text-destructive" />,
    };
  }

  // Generic JS errors
  if (error instanceof Error) {
    return {
      title: "Something Went Wrong",
      message: error.message,
      icon: <AlertCircle className="size-12 text-destructive" />,
    };
  }

  return {
    title: "Unexpected Error",
    message: "An unexpected error occurred. Please try again.",
    icon: <AlertCircle className="size-12 text-destructive" />,
  };
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  const { title, message, icon, details } = getErrorInfo(error);

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          {icon}
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">{message}</p>
          {details && (
            <p className="text-xs text-muted-foreground/70 bg-muted rounded-lg px-3 py-2 font-mono break-all">
              {details}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.history.back()}
          >
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Go Back
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (reset) {
                reset();
              } else {
                router.invalidate();
              }
            }}
          >
            <RefreshCw className="size-4" data-icon="inline-start" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
