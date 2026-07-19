"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/lib/types/database";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  roles: UserRole[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const supabase = createClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    roles: [],
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profile) {
      const profileData = profile as unknown as Profile;
      setState({
        user: null, // Will be set by caller
        profile: profileData,
        roles: [profileData.role || "trainer"],
        isLoading: false,
        isAuthenticated: true,
      });
    }
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const profileData = profile as unknown as Profile | null;
        setState({
          user: session.user,
          profile: profileData,
          roles: profileData ? [profileData.role] : [],
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({ user: null, profile: null, roles: [], isLoading: false, isAuthenticated: false });
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setState({ user: null, profile: null, roles: [], isLoading: false, isAuthenticated: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, [supabase]);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, string>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    return { data, error };
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    setState({ user: null, profile: null, roles: [], isLoading: false, isAuthenticated: false });
    return { error };
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  }, [supabase]);

  const hasRole = useCallback((role: UserRole) => {
    return state.roles.includes(role) || state.roles.includes("owner");
  }, [state.roles]);

  const hasAnyRole = useCallback((roles: UserRole[]) => {
    if (state.roles.includes("owner")) return true;
    return roles.some((r) => state.roles.includes(r));
  }, [state.roles]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    hasRole,
    hasAnyRole,
  };
}
