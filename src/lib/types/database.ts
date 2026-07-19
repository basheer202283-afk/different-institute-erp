export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = 'owner' | 'manager' | 'reception' | 'accountant' | 'trainer';

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

export interface Student {
  id: string;
  tenant_id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  status: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Course {
  id: string;
  tenant_id: string;
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

export interface Trainer {
  id: string;
  tenant_id: string;
  user_id: string | null;
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

export interface Attendance {
  id: string;
  tenant_id: string;
  student_id: string;
  course_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  student_id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  created_at: string;
  updated_at: string;
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
      students: {
        Row: Student;
        Insert: Partial<Student> & { tenant_id: string; student_number: string; first_name: string; last_name: string };
        Update: Partial<Student>;
      };
      courses: {
        Row: Course;
        Insert: Partial<Course> & { tenant_id: string; name: string; code: string };
        Update: Partial<Course>;
      };
      trainers: {
        Row: Trainer;
        Insert: Partial<Trainer> & { tenant_id: string; first_name: string; last_name: string };
        Update: Partial<Trainer>;
      };
      attendance: {
        Row: Attendance;
        Insert: Partial<Attendance> & { tenant_id: string; student_id: string; course_id: string; date: string; status: string };
        Update: Partial<Attendance>;
      };
      invoices: {
        Row: Invoice;
        Insert: Partial<Invoice> & { tenant_id: string; student_id: string; invoice_number: string };
        Update: Partial<Invoice>;
      };
    };
    Functions: {
      get_user_tenant_id: { Args: Record<string, never>; Returns: string };
      has_role: { Args: { role_slug: string }; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
