"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole, StaffSubRole, ApprovalStatus } from "@/types/user";
import { tokenStorage } from "@/lib/api/client";

export interface AuthUser {
  id: string;
  role: UserRole;
  full_name: string;
  // Student fields
  matric_number?: string;
  registration_number?: string;
  faculty?: string;
  department?: string;
  level?: string;
  // Staff fields
  sub_role?: StaffSubRole;
  staff_id?: string;
  approval_status?: ApprovalStatus;
  // Admin fields
  email?: string;
  // Profile completeness
  profile_complete?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, access_token: string, refresh_token: string) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, access_token, refresh_token) => {
        tokenStorage.set(access_token, refresh_token);
        set({ user, isAuthenticated: true });
      },

      clearAuth: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "auth_user",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
