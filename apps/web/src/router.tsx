import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { axiosErrorHandler } from "@/utils/axiosApiHandler";
import { routeTree } from "./routeTree.gen";

// Create QueryClient with global error handling
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: axiosErrorHandler,
  }),
  mutationCache: new MutationCache({
    onError: axiosErrorHandler,
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry auth failures - let the interceptor handle them
        if (
          isAxiosError(error) &&
          [401, 403].includes(error.response?.status ?? 0)
        ) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Create router instance with context
export const router = createRouter({
  routeTree,
  context: {
    isAuthenticated: undefined as unknown as boolean,
    queryClient,
  },
});

// Register router type
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
