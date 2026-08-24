import { useQuery } from "@tanstack/react-query";
import { serverHealthQueryOptions } from "@/hooks/useServerHealth";
import { Spinner } from "@/components/ui/spinner";

export function ColdStartLoader({ children }: { children: React.ReactNode }) {
  const { isLoading } = useQuery(serverHealthQueryOptions());

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-screen text-sm text-muted-foreground">
        <Spinner className="size-6 shrink-0" />
        <span>Server is waking up — this may take a moment.</span>
      </div>
    );
  }

  return <>{children}</>;
}
