import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  loyalty_points: number;
}

interface UserStore {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  updateLoyaltyPoints: (points: number) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
      updateLoyaltyPoints: (points) =>
        set((state) => ({
          user: state.user ? { ...state.user, loyalty_points: points } : null,
        })),
    }),
    { name: "mufflux-user" }
  )
);
