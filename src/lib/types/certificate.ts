import type { Json } from "@/lib/types/database";

export type CertificateStatus = "draft" | "active" | "revoked" | "expired";

export interface CertificateTemplate {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  name: string;
  name_ar: string | null;
  description: string | null;
  template_type: "course_completion" | "achievement" | "participation" | "custom";
  layout_html: string;
  is_default: boolean;
  is_active: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Certificate {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  student_id: string;
  course_id: string | null;
  enrollment_id: string | null;
  template_id: string | null;
  certificate_number: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  issue_date: string;
  expiry_date: string | null;
  status: CertificateStatus;
  grade: string | null;
  score: number | null;
  hours_completed: number | null;
  qr_code: string | null;
  verification_url: string | null;
  digital_signature: string | null;
  issued_by: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
  file_path: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface CertificateWithRelations extends Certificate {
  student?: {
    id: string;
    student_number: string;
    first_name_ar: string;
    last_name_ar: string;
    first_name_en: string | null;
    last_name_en: string | null;
    photo_url: string | null;
  };
  course?: {
    id: string;
    name: string;
    code: string;
  };
  template?: {
    id: string;
    name: string;
    name_ar: string | null;
  };
  issuer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
  };
}

export interface CertificateFormData {
  student_id: string;
  course_id?: string;
  enrollment_id?: string;
  template_id?: string;
  title: string;
  title_ar?: string;
  description?: string;
  issue_date?: string;
  expiry_date?: string;
  status?: CertificateStatus;
  grade?: string;
  score?: number;
  hours_completed?: number;
}

export interface CertificateFilters {
  search?: string;
  status?: CertificateStatus;
  course_id?: string;
  template_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  pageSize?: number;
}

export interface CertificateStats {
  total: number;
  active: number;
  revoked: number;
  expired: number;
  issued_this_month: number;
  issued_this_year: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
