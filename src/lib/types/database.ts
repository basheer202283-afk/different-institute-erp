export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type StudentStatus = 'active' | 'pending' | 'suspended' | 'graduated' | 'withdrawn';

export interface Student {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  user_id: string | null;
  student_number: string;
  registration_number: string | null;
  national_id: string | null;
  first_name_ar: string | null;
  last_name_ar: string | null;
  first_name_en: string | null;
  last_name_en: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  age: number | null;
  gender: string | null;
  nationality: string | null;
  mobile: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  status: StudentStatus;
  academic_level: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  guardian_relationship: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Trainer {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Course {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  name: string;
  code: string;
  description: string | null;
  status: string;
  price: number;
  duration_hours: number | null;
  max_students: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Payment {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  student_id: string;
  invoice_id: string | null;
  payment_number: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  student_id: string;
  class_id: string;
  attendance_date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

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

export interface Organization {
  id: string;
  name: string;
  slug: string;
  legal_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  brand_color: string;
  secondary_color: string;
  tagline: string | null;
  address: string | null;
  city: string | null;
  country: string;
  timezone: string;
  locale: string;
  currency: string;
  date_format: string;
  status: string;
  subscription_plan: string;
  max_branches: number;
  max_users: number;
  max_students: number;
  settings: Json;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Branch {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  branch_code: string | null;
  description: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  manager_id: string | null;
  opening_date: string | null;
  capacity: number | null;
  timezone: string;
  locale: string;
  is_active: boolean;
  settings: Json;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Profile {
  id: string;
  tenant_id: string | null;
  organization_id: string | null;
  branch_id: string | null;
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
  organization_id: string;
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

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface BranchMember {
  id: string;
  branch_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContextAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  old_organization_id: string | null;
  new_organization_id: string | null;
  old_branch_id: string | null;
  new_branch_id: string | null;
  ip_address: string | null;
  metadata: Json;
  created_at: string;
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
      organizations: {
        Row: Organization;
        Insert: Partial<Organization> & { name: string; slug: string };
        Update: Partial<Organization>;
      };
      branches: {
        Row: Branch;
        Insert: Partial<Branch> & { organization_id: string; name: string; code: string };
        Update: Partial<Branch>;
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      tenants: {
        Row: Tenant;
        Insert: Partial<Tenant> & { organization_id: string; name: string; slug: string };
        Update: Partial<Tenant>;
      };
      organization_members: {
        Row: OrganizationMember;
        Insert: Partial<OrganizationMember> & { organization_id: string; user_id: string };
        Update: Partial<OrganizationMember>;
      };
      branch_members: {
        Row: BranchMember;
        Insert: Partial<BranchMember> & { branch_id: string; user_id: string };
        Update: Partial<BranchMember>;
      };
      context_audit_log: {
        Row: ContextAuditLog;
        Insert: Partial<ContextAuditLog>;
        Update: never;
      };
      login_audit: {
        Row: LoginAudit;
        Insert: Partial<LoginAudit>;
        Update: Partial<LoginAudit>;
      };
      students: {
        Row: Student;
        Insert: Partial<Student> & { tenant_id: string; student_number: string };
        Update: Partial<Student>;
      };
      trainers: {
        Row: Trainer;
        Insert: Partial<Trainer> & { tenant_id: string; first_name: string; last_name: string };
        Update: Partial<Trainer>;
      };
      courses: {
        Row: Course;
        Insert: Partial<Course> & { tenant_id: string; name: string; code: string };
        Update: Partial<Course>;
      };
      payments: {
        Row: Payment;
        Insert: Partial<Payment> & { tenant_id: string; student_id: string; payment_number: string; amount: number };
        Update: Partial<Payment>;
      };
      attendance_records: {
        Row: AttendanceRecord;
        Insert: Partial<AttendanceRecord> & { tenant_id: string; student_id: string; class_id: string; attendance_date: string; status: string };
        Update: Partial<AttendanceRecord>;
      };
    };
    Functions: {
      get_user_tenant_id: { Args: Record<string, never>; Returns: string };
      get_user_organization_id: { Args: Record<string, never>; Returns: string };
      get_user_branch_id: { Args: Record<string, never>; Returns: string };
      has_role: { Args: { role_slug: string }; Returns: boolean };
      is_super_admin: { Args: Record<string, never>; Returns: boolean };
      is_tenant_admin: { Args: Record<string, never>; Returns: boolean };
      user_belongs_to_organization: { Args: { org_id: string }; Returns: boolean };
      user_belongs_to_branch: { Args: { br_id: string }; Returns: boolean };
    };
  };
}
