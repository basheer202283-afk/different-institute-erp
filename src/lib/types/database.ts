export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole =
  | 'super_admin'
  | 'owner'
  | 'branch_manager'
  | 'finance_manager'
  | 'hr_manager'
  | 'academic_manager'
  | 'trainer'
  | 'reception'
  | 'student'
  | 'guardian';

export interface Profile {
  id: string;
  tenant_id: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  phone: string | null;
  locale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  settings: Json;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  tenant_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
  level: number;
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  module: string;
  action: string;
  resource: string | null;
}

export interface LoginAudit {
  id: string;
  user_id: string | null;
  email: string | null;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  failure_reason: string | null;
  metadata: Json;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      tenants: {
        Row: Tenant;
        Insert: Partial<Tenant> & { name: string; slug: string };
        Update: Partial<Tenant>;
      };
      login_audit: {
        Row: LoginAudit;
        Insert: Partial<LoginAudit>;
        Update: Partial<LoginAudit>;
      };
    };
    Functions: {
      get_user_tenant_id: { Args: Record<string, never>; Returns: string };
      has_role: { Args: { role_slug: string }; Returns: boolean };
      is_super_admin: { Args: Record<string, never>; Returns: boolean };
      is_tenant_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
