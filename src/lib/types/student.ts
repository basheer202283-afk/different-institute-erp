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
  passport_number: string | null;
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
  alternative_mobile: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  admission_date: string | null;
  registration_date: string | null;
  status: StudentStatus;
  academic_level: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_whatsapp: string | null;
  guardian_email: string | null;
  guardian_relationship: string | null;
  guardian_address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_conditions: string | null;
  allergies: string | null;
  blood_group: string | null;
  religion: string | null;
  place_of_birth: string | null;
  previous_school: string | null;
  previous_grade: string | null;
  department_id: string | null;
  program_id: string | null;
  course_id: string | null;
  academic_year_id: string | null;
  level: string | null;
  notes: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface StudentAttachment {
  id: string;
  tenant_id: string;
  student_id: string;
  attachment_type: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  description: string | null;
  uploaded_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface StudentAcademicHistory {
  id: string;
  tenant_id: string;
  student_id: string;
  organization_id: string | null;
  branch_id: string | null;
  program_id: string | null;
  course_id: string | null;
  academic_year_id: string | null;
  enrollment_date: string | null;
  completion_date: string | null;
  status: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StudentStatusHistory {
  id: string;
  tenant_id: string;
  student_id: string;
  old_status: string | null;
  new_status: string;
  reason: string | null;
  changed_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface StudentFormData {
  registration_number?: string;
  national_id?: string;
  passport_number?: string;
  first_name_ar: string;
  last_name_ar: string;
  first_name_en?: string;
  last_name_en?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  mobile?: string;
  alternative_mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  status: StudentStatus;
  academic_level?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_whatsapp?: string;
  guardian_email?: string;
  guardian_relationship?: string;
  guardian_address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  allergies?: string;
  blood_group?: string;
  religion?: string;
  place_of_birth?: string;
  previous_school?: string;
  previous_grade?: string;
  department_id?: string;
  program_id?: string;
  course_id?: string;
  academic_year_id?: string;
  level?: string;
  registration_date?: string;
  admission_date?: string;
  notes?: string;
}

export interface StudentSearchParams {
  search?: string;
  status?: StudentStatus | 'all';
  branch_id?: string;
  course_id?: string;
  department_id?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentStats {
  total: number;
  active: number;
  pending: number;
  graduated: number;
  withdrawn: number;
  suspended: number;
}
