import type { Json } from "@/lib/types/database";

export type EmployeeStatus = "active" | "inactive" | "suspended" | "terminated" | "on_leave";
export type ContractType = "full_time" | "part_time" | "temporary" | "internship";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface Employee {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  user_id: string | null;
  employee_number: string;
  first_name_ar: string;
  last_name_ar: string;
  first_name_en: string | null;
  last_name_en: string | null;
  email: string | null;
  phone: string | null;
  national_id: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  department_id: string | null;
  position_id: string | null;
  hire_date: string;
  status: EmployeeStatus;
  contract_type: ContractType;
  salary: number;
  currency: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Department {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  name: string;
  name_ar: string | null;
  code: string;
  description: string | null;
  head_id: string | null;
  is_active: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Position {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  department_id: string | null;
  title: string;
  title_ar: string | null;
  description: string | null;
  min_salary: number | null;
  max_salary: number | null;
  is_active: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LeaveRequest {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: LeaveStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EmployeeFormData {
  first_name_ar: string;
  last_name_ar: string;
  first_name_en?: string;
  last_name_en?: string;
  email?: string;
  phone?: string;
  national_id?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  city?: string;
  department_id?: string;
  position_id?: string;
  hire_date?: string;
  status?: EmployeeStatus;
  contract_type?: ContractType;
  salary?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus;
  department_id?: string;
  contract_type?: ContractType;
  page?: number;
  pageSize?: number;
}

export interface EmployeeStats {
  total: number;
  active: number;
  on_leave: number;
  total_salary: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
