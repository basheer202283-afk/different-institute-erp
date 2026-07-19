export interface Student {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  student_number: string;
  registration_number: string | null;
  national_id: string | null;
  first_name_ar: string;
  last_name_ar: string;
  first_name_en: string | null;
  last_name_en: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  age: number | null;
  gender: 'male' | 'female' | null;
  nationality: string | null;
  mobile: string | null;
  alternative_mobile: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  registration_date: string | null;
  status: 'active' | 'pending' | 'suspended' | 'graduated' | 'withdrawn';
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
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StudentFormData {
  first_name_ar: string;
  last_name_ar: string;
  first_name_en?: string;
  last_name_en?: string;
  national_id?: string;
  registration_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  nationality?: string;
  mobile?: string;
  alternative_mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: Student['status'];
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
  notes?: string;
}

export interface StudentFilters {
  search?: string;
  status?: Student['status'];
  gender?: Student['gender'];
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
