"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, createElement } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Organization, Branch } from "@/lib/types/database";

interface TenantContextType {
  organization: Organization | null;
  branch: Branch | null;
  branches: Branch[];
  organizations: Organization[];
  isLoading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  switchBranch: (branchId: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenantData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles").select("organization_id, branch_id").eq("id", session.user.id).single();
      const pd = profile as unknown as { organization_id: string | null; branch_id: string | null } | null;

      if (pd?.organization_id) {
        const { data: org } = await supabase.from("organizations").select("*").eq("id", pd.organization_id).single();
        setOrganization(org as unknown as Organization);

        const { data: bd } = await supabase.from("branches").select("*").eq("organization_id", pd.organization_id).eq("is_active", true).order("name");
        setBranches((bd ?? []) as Branch[]);

        if (pd.branch_id) {
          const { data: br } = await supabase.from("branches").select("*").eq("id", pd.branch_id).single();
          setBranch(br as unknown as Branch);
        }
      }

      const { data: orgMembers } = await supabase.from("organization_members").select("organization_id").eq("user_id", session.user.id).eq("is_active", true);
      if (orgMembers && orgMembers.length > 0) {
        const orgIds = (orgMembers as Array<{ organization_id: string }>).map((m) => m.organization_id);
        const { data: orgs } = await supabase.from("organizations").select("*").in("id", orgIds).eq("status", "active");
        setOrganizations((orgs ?? []) as Organization[]);
      }
    } catch (e) { console.error("Tenant fetch error:", e); }
    finally { setIsLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchTenantData(); }, [fetchTenantData]);

  const switchOrganization = useCallback(async (orgId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await (supabase.from("profiles") as unknown as { update: (data: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<unknown> } }).update({ organization_id: orgId, branch_id: null }).eq("id", session.user.id);
    await (supabase.from("context_audit_log") as unknown as { insert: (data: Record<string, unknown>) => Promise<unknown> }).insert({ user_id: session.user.id, action: "switch_organization", old_organization_id: organization?.id, new_organization_id: orgId });
    await fetchTenantData();
  }, [supabase, organization, fetchTenantData]);

  const switchBranch = useCallback(async (branchId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await (supabase.from("profiles") as unknown as { update: (data: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<unknown> } }).update({ branch_id: branchId }).eq("id", session.user.id);
    await (supabase.from("context_audit_log") as unknown as { insert: (data: Record<string, unknown>) => Promise<unknown> }).insert({ user_id: session.user.id, action: "switch_branch", old_branch_id: branch?.id, new_branch_id: branchId });
    await fetchTenantData();
  }, [supabase, branch, fetchTenantData]);

  const value: TenantContextType = {
    organization, branch, branches, organizations, isLoading, switchOrganization, switchBranch
  };

  return createElement(TenantContext.Provider, { value }, children);
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
