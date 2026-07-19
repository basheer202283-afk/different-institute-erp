import type { Json } from "@/lib/types/database";

// ============================================================
// Enrollment Types
// ============================================================

export type EnrollmentStatus =
  | "pending"
  | "approved"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected"
  | "transferred"
  | "deferred"
  | "expelled";

export type PaymentStatus = "pending" | "partial" | "paid" | "refunded" | "waived";

export type WaitingListStatus = "waiting" | "offered" | "accepted" | "declined" | "expired";

export interface Enrollment {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  student_id: string;
  course_id: string;
  class_id: string | null;
  semester_id: string | null;
  enrollment_date: string;
  start_date: string | null;
  end_date: string | null;
  status: EnrollmentStatus;
  approval_status: "pending" | "approved" | "rejected";
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  payment_status: PaymentStatus;
  total_fees: number;
  paid_amount: number;
  discount_amount: number;
  discount_reason: string | null;
  transfer_from_enrollment_id: string | null;
  transfer_to_enrollment_id: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  completion_date: string | null;
  grade: string | null;
  notes: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface EnrollmentWithRelations extends Enrollment {
  student?: {
    id: string;
    student_number: string;
    first_name_ar: string;
    last_name_ar: string;
    first_name_en: string | null;
    last_name_en: string | null;
    mobile: string | null;
    email: string | null;
    photo_url: string | null;
    status: string;
  };
  course?: {
    id: string;
    name: string;
    code: string;
    price: number;
    max_students: number | null;
    duration_hours: number | null;
    status: string;
  };
  class?: {
    id: string;
    name: string;
    code: string;
    max_students: number | null;
    current_students: number;
    status: string;
  };
  semester?: {
    id: string;
    name: string;
    code: string;
    start_date: string;
    end_date: string;
  };
}

// ============================================================
// Waiting List Types
// ============================================================

export interface WaitingListEntry {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  student_id: string;
  course_id: string;
  position: number;
  status: WaitingListStatus;
  priority: number;
  requested_date: string;
  offered_date: string | null;
  offer_expires_at: string | null;
  accepted_date: string | null;
  declined_date: string | null;
  decline_reason: string | null;
  notes: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WaitingListWithRelations extends WaitingListEntry {
  student?: {
    id: string;
    student_number: string;
    first_name_ar: string;
    last_name_ar: string;
    mobile: string | null;
  };
  course?: {
    id: string;
    name: string;
    code: string;
    max_students: number | null;
  };
}

// ============================================================
// Enrollment Approval Types
// ============================================================

export interface EnrollmentApproval {
  id: string;
  tenant_id: string;
  enrollment_id: string;
  requested_by: string;
  reviewed_by: string | null;
  status: "pending" | "approved" | "rejected";
  request_notes: string | null;
  review_notes: string | null;
  requested_at: string;
  reviewed_at: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Enrollment History / Audit
// ============================================================

export interface EnrollmentHistory {
  id: string;
  tenant_id: string;
  enrollment_id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  old_class_id: string | null;
  new_class_id: string | null;
  changed_by: string | null;
  reason: string | null;
  metadata: Json;
  created_at: string;
}

// ============================================================
// Batch Types
// ============================================================

export interface Batch {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  course_id: string;
  class_id: string | null;
  name: string;
  code: string;
  description: string | null;
  max_students: number | null;
  current_students: number;
  start_date: string | null;
  end_date: string | null;
  status: "planned" | "active" | "completed" | "cancelled";
  schedule: Json;
  location: string | null;
  instructor_id: string | null;
  notes: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface BatchWithRelations extends Batch {
  course?: {
    id: string;
    name: string;
    code: string;
  };
  class?: {
    id: string;
    name: string;
    code: string;
  };
  instructor?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

// ============================================================
// Form Data
// ============================================================

export interface EnrollmentFormData {
  student_id: string;
  course_id: string;
  class_id?: string;
  semester_id?: string;
  enrollment_date?: string;
  start_date?: string;
  end_date?: string;
  status?: EnrollmentStatus;
  payment_status?: PaymentStatus;
  total_fees?: number;
  paid_amount?: number;
  discount_amount?: number;
  discount_reason?: string;
  notes?: string;
}

export interface EnrollmentTransferData {
  enrollment_id: string;
  target_class_id: string;
  reason?: string;
  notes?: string;
}

export interface EnrollmentCancellationData {
  enrollment_id: string;
  reason: string;
  refund_amount?: number;
  notes?: string;
}

export interface WaitingListFormData {
  student_id: string;
  course_id: string;
  priority?: number;
  notes?: string;
}

export interface BatchFormData {
  course_id: string;
  class_id?: string;
  name: string;
  code: string;
  description?: string;
  max_students?: number;
  start_date?: string;
  end_date?: string;
  status?: Batch["status"];
  location?: string;
  instructor_id?: string;
  notes?: string;
}

// ============================================================
// Filters
// ============================================================

export interface EnrollmentFilters {
  search?: string;
  status?: EnrollmentStatus;
  payment_status?: PaymentStatus;
  course_id?: string;
  class_id?: string;
  semester_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  pageSize?: number;
}

export interface WaitingListFilters {
  search?: string;
  status?: WaitingListStatus;
  course_id?: string;
  page?: number;
  pageSize?: number;
}

export interface BatchFilters {
  search?: string;
  status?: Batch["status"];
  course_id?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================
// Statistics
// ============================================================

export interface EnrollmentStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
  waiting: number;
  totalRevenue: number;
  collectedRevenue: number;
  pendingPayments: number;
}

export interface CourseEnrollmentStats {
  course_id: string;
  course_name: string;
  max_students: number | null;
  enrolled: number;
  pending: number;
  completed: number;
  cancelled: number;
  waiting_list: number;
  revenue: number;
  collected: number;
}

// ============================================================
// Paginated Response
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
