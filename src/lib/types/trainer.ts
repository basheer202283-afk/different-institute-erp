export interface Trainer {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  user_id: string | null;
  employee_number: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  qualifications: string | null;
  experience_years: number;
  hourly_rate: number | null;
  bio: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TrainerFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  employee_number?: string;
  specialization?: string;
  qualifications?: string;
  experience_years?: number;
  hourly_rate?: number;
  bio?: string;
  status?: Trainer['status'];
}

export interface TrainerFilters {
  search?: string;
  status?: Trainer['status'];
  specialization?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
