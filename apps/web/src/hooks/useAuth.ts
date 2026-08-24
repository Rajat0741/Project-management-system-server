import { useMutation, useQuery } from "@tanstack/react-query";
import type { LoginFormData, RegisterFormData } from "@/schemas/auth.schema";
import type { changePasswordFormData, SuccessResponse, User } from "@/types";
import apiClient from "@/lib/axiosApi";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useUserStore } from "@/store/userData";
import { queryClient, router } from "@/router";

/*
response.data = {
    statusCode: number;
    data: T;  -----> This contains the user data or any other data based on the request
    message: string;
    success: boolean;
    }
*/

// Custom hook for login
export const useLogin = () => {
  const navigate = useNavigate();
  const setUserData = useUserStore((state) => state.setUserData);

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response: SuccessResponse<User> = await apiClient.post("/auth/login", data);
      return response.data.data;
    },
    onSuccess: async (data) => {
      setUserData(data);
      toast.success("Logged in successfully!");
      // Force router to re-read context before navigating to prevent stale isAuthenticated value
      await router.invalidate();
      navigate({ to: "/dashboard" });
    },
  });
};

// Custom hook for register
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      await apiClient.post("/auth/register", data);
    },
    onSuccess: () => {
      navigate({ to: "/verificationEmailSent" });
      toast.success("Registered successfully!");
    },
  });
};

// Custom hook for resending verification token
export const useResendVerificationToken = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { email: string }) => {
      await apiClient.post("/auth/resend-email-verification", data);
    },
    onSuccess: () => {
      navigate({ to: "/verificationEmailSent" });
    },
  });
};

// Custom hook for logout
export const useLogout = () => {
  const navigate = useNavigate();
  const clearUserData = useUserStore((state) => state.clearUserData);

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      clearUserData();
      toast.success("Logged out successfully!");
      navigate({ to: "/login" });
    },
  });
};

// Custom hook for forgot password
export const useForgotPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { email: string }) => {
      await apiClient.post("/auth/forgot-password", data);
    },
    onSuccess: () => {
      toast.success("Password reset link sent to your email!");
      navigate({ to: "/forgotpasswordEmailSent" });
    },
  });
};

// Custom hook for reset password
export const useResetPassword = (resetToken: string) => {
  return useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      await apiClient.post(`/auth/reset-password/${resetToken}`, data);
    },
  });
};

// Custom hook for getting current user data
export const useGetCurrentUser = () => {
  const setUserData = useUserStore((state) => state.setUserData);
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response: SuccessResponse<User> = await apiClient.get("/auth/current-user");
      setUserData(response.data.data);
      return response.data;
    },
  });
};

// Custom hook for updating profile picture
export const useUpdateProfilePicture = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response: SuccessResponse<User> = await apiClient.patch("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Profile picture updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

// Custom hook for changing password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: changePasswordFormData) => {
      await apiClient.post("/auth/change-password", data);
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
  });
};
