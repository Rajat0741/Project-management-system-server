import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <FileQuestion className="size-12 text-muted-foreground" />
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
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
            onClick={() => router.navigate({ to: "/" })}
          >
            <Home className="size-4" data-icon="inline-start" />
            Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
