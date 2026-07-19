export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'owner' | 'admin' | 'reception' | 'accountant' | 'trainer';

export interface Profile {
  id: string;
  tenant_id: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
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
    };
    Functions: {
      get_user_tenant_id: { Args: Record<string, never>; Returns: string };
      has_role: { Args: { role_slug: string }; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
