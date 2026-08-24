import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/index";

type Store = {
  isAuthenticated: boolean;
  userData: User | null;
  setUserData: (user: User) => void;
  clearUserData: () => void;
};

export const useUserStore = create<Store>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userData: null,
      setUserData: (user) => set({ userData: user, isAuthenticated: true }),
      clearUserData: () => set({ userData: null, isAuthenticated: false }),
    }),
    { name: "user-storage" }, // localStorage key
  ),
);
