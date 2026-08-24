import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import type { AuthState } from "@/types";
import type { QueryClient } from "@tanstack/react-query";
import Header from "@/components/shared/Header";
import ErrorPage from "@/components/shared/ErrorPage";
import NotFoundPage from "@/components/shared/NotFoundPage";
import { ColdStartLoader } from "@/components/shared/ColdStartLoader";

// Extend AuthState to include queryClient
interface RouterContext extends AuthState {
  queryClient: QueryClient;
}

// Shared shell for error/notFound pages so they get theming and toasts
const RootShell = ({ children }: { children: React.ReactNode }) => {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const RootLayout = () => {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isIndexPage = location.pathname === "/";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <div className="min-h-screen flex flex-col">
          {!isIndexPage && <Header />}
          {isIndexPage ? (
            <div className="flex flex-col items-center flex-1">
              <Outlet />
            </div>
          ) : (
              <ColdStartLoader>
                <Outlet />
              </ColdStartLoader>
          )}
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: ({ error, reset }) => (
    <RootShell>
      <ErrorPage error={error} reset={reset} />
    </RootShell>
  ),
  notFoundComponent: () => <NotFoundPage />,
});
