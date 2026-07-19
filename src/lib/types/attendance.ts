import type { Json } from "@/lib/types/database";

export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  student_id: string;
  class_id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'left_early' | 'holiday';
  check_in_time: string | null;
  check_out_time: string | null;
  late_minutes: number;
  reason: string | null;
  notes: string | null;
  marked_by: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface AttendanceFormData {
  student_id: string;
  class_id: string;
  attendance_date: string;
  status: AttendanceRecord['status'];
  check_in_time?: string;
  check_out_time?: string;
  late_minutes?: number;
  reason?: string;
  notes?: string;
}

export interface AttendanceFilters {
  class_id?: string;
  student_id?: string;
  date_from?: string;
  date_to?: string;
  status?: AttendanceRecord['status'];
  page?: number;
  pageSize?: number;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
