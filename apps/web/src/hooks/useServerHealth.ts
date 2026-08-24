import { queryOptions } from "@tanstack/react-query";

/**
 * Shared query options for the server health check.
 * Uses raw fetch instead of apiClient to avoid circular imports
 * and interceptor side-effects (e.g. redirect on 401).
 */
export function serverHealthQueryOptions() {
  return queryOptions({
    queryKey: ["serverHealth"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/healthCheck`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Health check failed");
      return res.json();
    },
    retry: Infinity,
    retryDelay: 5000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
