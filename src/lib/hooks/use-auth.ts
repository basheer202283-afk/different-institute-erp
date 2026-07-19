"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, AppRole } from "@/lib/types/database";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const supabase = createClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

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
          role: profileData?.role ?? null,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({ user: null, profile: null, role: null, isLoading: false, isAuthenticated: false });
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        const profileData = profile as unknown as Profile | null;
        setState({
          user: session.user,
          profile: profileData,
          role: profileData?.role ?? null,
          isLoading: false,
          isAuthenticated: true,
        });
      } else if (event === "SIGNED_OUT") {
        setState({ user: null, profile: null, role: null, isLoading: false, isAuthenticated: false });
      }
    });

    return () => subscription.unsubscribe();
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
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  }, [supabase]);

  const hasRole = useCallback((roles: AppRole | AppRole[]) => {
    if (!state.role) return false;
    if (state.role === "owner") return true;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.role);
  }, [state.role]);

  return { ...state, signIn, signUp, signOut, resetPassword, hasRole };
}
