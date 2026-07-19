export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  course_id?: string;
  branch_id?: string;
  status?: string;
}

export interface StudentReport {
  total_students: number;
  active: number;
  pending: number;
  suspended: number;
  graduated: number;
  withdrawn: number;
  by_gender: Record<string, number>;
  by_nationality: Record<string, number>;
  by_month: Record<string, number>;
}

export interface FinancialReport {
  total_revenue: number;
  collected: number;
  outstanding: number;
  discounts: number;
  refunds: number;
  by_month: Record<string, { revenue: number; collected: number }>;
  by_course: Record<string, { revenue: number; students: number }>;
  by_payment_method: Record<string, number>;
}

export interface AttendanceReport {
  total_records: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
  by_course: Record<string, { total: number; present: number; rate: number }>;
  by_month: Record<string, { total: number; present: number; rate: number }>;
}

export interface EnrollmentReport {
  total_enrollments: number;
  active: number;
  completed: number;
  cancelled: number;
  pending: number;
  by_course: Record<string, number>;
  by_month: Record<string, number>;
  by_status: Record<string, number>;
}

export interface TrainerReport {
  total_trainers: number;
  active: number;
  by_specialization: Record<string, number>;
  courses_per_trainer: Record<string, number>;
}

export interface DashboardAnalytics {
  total_students: number;
  total_trainers: number;
  total_courses: number;
  total_enrollments: number;
  total_revenue: number;
  attendance_rate: number;
  new_students_this_month: number;
  active_enrollments: number;
  pending_enrollments: number;
  certificates_issued: number;
}
