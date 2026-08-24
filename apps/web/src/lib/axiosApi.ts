import type { ErrorResponse } from "@/types";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { router } from "@/router";
import { useUserStore } from "@/store/userData";

// Extend Axios config to include retry flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const clearUserData = useUserStore.getState().clearUserData;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await apiClient.post("/auth/refresh-token");
        return apiClient(originalRequest);
      } catch (refreshError) {
        router.navigate({ to: "/login" });
        clearUserData();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
