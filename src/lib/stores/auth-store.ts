import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/database";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  roles: string[];
  permissions: string[];
  tenantId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, profile: Profile, roles: string[], permissions: string[]) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      roles: [],
      permissions: [],
      tenantId: null,
      isLoading: true,
      isAuthenticated: false,
      setAuth: (user, profile, roles, permissions) =>
        set({
          user,
          profile,
          roles,
          permissions,
          tenantId: profile.tenant_id,
          isLoading: false,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          profile: null,
          roles: [],
          permissions: [],
          tenantId: null,
          isLoading: false,
          isAuthenticated: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
    }),
    {
      name: "erp-auth",
      partialize: (state) => ({
        roles: state.roles,
        permissions: state.permissions,
        tenantId: state.tenantId,
      }),
    }
  )
);
