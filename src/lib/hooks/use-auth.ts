"use client";

import { useEffect, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { Profile } from "@/lib/types/database";

export function useAuth() {
  const supabase = createClient();
  const store = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  const fetchUserData = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profile) {
      store.clearAuth();
      return;
    }

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role_id, roles!inner(slug)")
      .eq("user_id", userId)
      .eq("is_active", true);

    const roles = ((userRoles ?? []) as unknown as Array<{ roles: { slug: string } }>).map((ur) => ur.roles.slug) ?? [];

    const { data: rolePerms } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", userId)
      .eq("is_active", true);

    const roleIds = ((rolePerms ?? []) as Array<{ role_id: string }>).map((r) => r.role_id) ?? [];

    let permissions: string[] = [];
    if (roleIds.length > 0) {
      const { data: perms } = await supabase
        .from("role_permissions")
        .select("permissions!inner(slug), effect")
        .in("role_id", roleIds);

      permissions = ((perms ?? []) as unknown as Array<{ permissions: { slug: string } }>).map((p) => p.permissions.slug) ?? [];
    }

    store.setAuth(
      (await supabase.auth.getUser()).data.user!,
      profile as Profile,
      roles,
      [...new Set(permissions)]
    );
  }, [supabase, store]);

  useEffect(() => {
    if (initialized) return;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        store.clearAuth();
      }
      setInitialized(true);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchUserData(session.user.id);
      } else if (event === "SIGNED_OUT") {
        store.clearAuth();
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        await fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, store, initialized, fetchUserData]);

  const signIn = useCallback(async (email: string, password: string, rememberMe = false) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    if (rememberMe) {
      localStorage.setItem("erp_remember_email", email);
    } else {
      localStorage.removeItem("erp_remember_email");
    }
    return { data, error: null };
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
    store.clearAuth();
    return { error };
  }, [supabase, store]);

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  }, [supabase]);

  const updatePassword = useCallback(async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  }, [supabase]);

  const hasRole = useCallback((role: string) => {
    return store.roles.includes(role) || store.roles.includes("super_admin");
  }, [store.roles]);

  const hasPermission = useCallback((permission: string) => {
    if (store.roles.includes("super_admin")) return true;
    return store.permissions.includes(permission);
  }, [store.roles, store.permissions]);

  const hasAnyRole = useCallback((roles: string[]) => {
    if (store.roles.includes("super_admin")) return true;
    return roles.some((r) => store.roles.includes(r));
  }, [store.roles]);

  const hasAnyPermission = useCallback((permissions: string[]) => {
    if (store.roles.includes("super_admin")) return true;
    return permissions.some((p) => store.permissions.includes(p));
  }, [store.roles, store.permissions]);

  return {
    ...store,
    isReady: initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    refreshUser: () => store.user ? fetchUserData(store.user.id) : Promise.resolve(),
  };
}
