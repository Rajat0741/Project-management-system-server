import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { serverHealthQueryOptions } from "./hooks/useServerHealth";
import { queryClient, router } from "./router";
import { useUserStore } from "./store/userData";

// Fire health check immediately to trigger Render cold start
queryClient.prefetchQuery(serverHealthQueryOptions());

// Wrapper to provide reactive auth context
export function App() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  // Router automatically passes context from router definition
  return <RouterProvider router={router} context={{ isAuthenticated }} />;
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
