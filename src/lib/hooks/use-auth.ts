"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, AppRole } from "@/lib/types/database";
import { hasPermission, hasAnyPermission, type PermissionSlug } from "@/lib/permissions";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [supabase] = useState(() => createClient());
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!mounted) return;

          const profileData = profile as unknown as Profile | null;
          setState({
            user: session.user,
            profile: profileData,
            role: profileData?.role ?? null,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({ user: null, profile: null, role: null, isLoading: false, isAuthenticated: false });
        }
      } catch (error) {
        console.error("Auth init error:", error);
        if (mounted) {
          setState({ user: null, profile: null, role: null, isLoading: false, isAuthenticated: false });
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!mounted) return;

          const profileData = profile as unknown as Profile | null;
          setState({
            user: session.user,
            profile: profileData,
            role: profileData?.role ?? null,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Profile fetch error:", error);
          if (mounted) {
            setState({
              user: session.user,
              profile: null,
              role: null,
              isLoading: false,
              isAuthenticated: true,
            });
          }
        }
      } else if (event === "SIGNED_OUT") {
        setState({ user: null, profile: null, role: null, isLoading: false, isAuthenticated: false });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, [supabase]);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, string>) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: metadata },
    });
    return { data, error };
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    setState({ user: null, profile: null, role: null, isLoading: false, isAuthenticated: false });
    return { error };
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  }, [supabase]);

  const can = useCallback((permission: PermissionSlug) => {
    return hasPermission(state.role, permission);
  }, [state.role]);

  const canAny = useCallback((permissions: PermissionSlug[]) => {
    return hasAnyPermission(state.role, permissions);
  }, [state.role]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    can,
    canAny,
  };
}
