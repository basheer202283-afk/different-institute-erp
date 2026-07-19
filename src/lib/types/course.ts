import type { Json } from "@/lib/types/database";

export interface Course {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  program_id: string | null;
  department_id: string | null;
  instructor_id: string | null;
  name: string;
  code: string;
  description: string | null;
  academic_level: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'professional' | 'expert';
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled' | 'archived';
  credits: number;
  duration_hours: number | null;
  max_students: number | null;
  min_students: number;
  price: number;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  schedule: Json;
  prerequisites: string[];
  syllabus: string | null;
  objectives: string | null;
  materials: string | null;
  is_online: boolean;
  online_link: string | null;
  location: string | null;
  image_url: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface CourseFormData {
  name: string;
  code: string;
  description?: string;
  program_id?: string;
  department_id?: string;
  instructor_id?: string;
  academic_level?: Course['academic_level'];
  status?: Course['status'];
  credits?: number;
  duration_hours?: number;
  max_students?: number;
  min_students?: number;
  price?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  prerequisites?: string[];
  syllabus?: string;
  objectives?: string;
  materials?: string;
  is_online?: boolean;
  online_link?: string;
  location?: string;
}

export interface CourseFilters {
  search?: string;
  status?: Course['status'];
  academic_level?: Course['academic_level'];
  program_id?: string;
  department_id?: string;
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
