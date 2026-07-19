"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type { StudentReport, FinancialReport, AttendanceReport, EnrollmentReport, TrainerReport, DashboardAnalytics, ReportFilters } from "@/lib/types/report";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function useStudentReport(filters: ReportFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["report-students", organization?.id, filters],
    queryFn: async (): Promise<StudentReport> => {
      if (!organization) return { total_students: 0, active: 0, pending: 0, suspended: 0, graduated: 0, withdrawn: 0, by_gender: {}, by_nationality: {}, by_month: {} };

      let query = supabase.from("students").select("status, gender, nationality, created_at").eq("organization_id", organization.id).is("deleted_at", null);
      if (filters.date_from) query = query.gte("created_at", filters.date_from);
      if (filters.date_to) query = query.lte("created_at", filters.date_to);

      const { data } = await query;
      const rows = (data ?? []) as Array<{ status: string; gender: string | null; nationality: string | null; created_at: string }>;

      const report: StudentReport = { total_students: rows.length, active: 0, pending: 0, suspended: 0, graduated: 0, withdrawn: 0, by_gender: {}, by_nationality: {}, by_month: {} };

      for (const r of rows) {
        if (r.status === "active") report.active++;
        if (r.status === "pending") report.pending++;
        if (r.status === "suspended") report.suspended++;
        if (r.status === "graduated") report.graduated++;
        if (r.status === "withdrawn") report.withdrawn++;
        const g = r.gender || "غير محدد";
        report.by_gender[g] = (report.by_gender[g] || 0) + 1;
        const n = r.nationality || "غير محدد";
        report.by_nationality[n] = (report.by_nationality[n] || 0) + 1;
        const month = r.created_at?.substring(0, 7) ?? "unknown";
        report.by_month[month] = (report.by_month[month] || 0) + 1;
      }
      return report;
    },
    enabled: !!organization,
  });
}

export function useFinancialReport(filters: ReportFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["report-finance", organization?.id, filters],
    queryFn: async (): Promise<FinancialReport> => {
      if (!organization) return { total_revenue: 0, collected: 0, outstanding: 0, discounts: 0, refunds: 0, by_month: {}, by_course: {}, by_payment_method: {} };

      let query = supabase.from("student_enrollments").select("total_fees, paid_amount, discount_amount, payment_status, enrollment_date, course_id").eq("organization_id", organization.id).is("deleted_at", null);
      if (filters.date_from) query = query.gte("enrollment_date", filters.date_from);
      if (filters.date_to) query = query.lte("enrollment_date", filters.date_to);
      if (filters.course_id) query = query.eq("course_id", filters.course_id);

      const { data } = await query;
      const rows = (data ?? []) as Array<{ total_fees: number; paid_amount: number; discount_amount: number; payment_status: string; enrollment_date: string; course_id: string }>;

      const report: FinancialReport = { total_revenue: 0, collected: 0, outstanding: 0, discounts: 0, refunds: 0, by_month: {}, by_course: {}, by_payment_method: {} };

      for (const r of rows) {
        report.total_revenue += Number(r.total_fees) || 0;
        report.collected += Number(r.paid_amount) || 0;
        report.discounts += Number(r.discount_amount) || 0;
        if (r.payment_status === "refunded") report.refunds += Number(r.paid_amount) || 0;
        const month = r.enrollment_date?.substring(0, 7) ?? "unknown";
        if (!report.by_month[month]) report.by_month[month] = { revenue: 0, collected: 0 };
        report.by_month[month].revenue += Number(r.total_fees) || 0;
        report.by_month[month].collected += Number(r.paid_amount) || 0;
        const courseKey = r.course_id?.substring(0, 8) ?? "unknown";
        if (!report.by_course[courseKey]) report.by_course[courseKey] = { revenue: 0, students: 0 };
        report.by_course[courseKey].revenue += Number(r.total_fees) || 0;
        report.by_course[courseKey].students++;
      }
      report.outstanding = report.total_revenue - report.collected;
      return report;
    },
    enabled: !!organization,
  });
}

export function useAttendanceReport(filters: ReportFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["report-attendance", organization?.id, filters],
    queryFn: async (): Promise<AttendanceReport> => {
      if (!organization) return { total_records: 0, present: 0, absent: 0, late: 0, excused: 0, attendance_rate: 0, by_course: {}, by_month: {} };

      let query = supabase.from("attendance_records").select("status, attendance_date, class_id").eq("organization_id", organization.id).is("deleted_at", null);
      if (filters.date_from) query = query.gte("attendance_date", filters.date_from);
      if (filters.date_to) query = query.lte("attendance_date", filters.date_to);

      const { data } = await query;
      const rows = (data ?? []) as Array<{ status: string; attendance_date: string; class_id: string }>;

      const report: AttendanceReport = { total_records: rows.length, present: 0, absent: 0, late: 0, excused: 0, attendance_rate: 0, by_course: {}, by_month: {} };

      for (const r of rows) {
        if (r.status === "present") report.present++;
        if (r.status === "absent") report.absent++;
        if (r.status === "late") report.late++;
        if (r.status === "excused") report.excused++;
        const month = r.attendance_date?.substring(0, 7) ?? "unknown";
        if (!report.by_month[month]) report.by_month[month] = { total: 0, present: 0, rate: 0 };
        report.by_month[month].total++;
        if (r.status === "present" || r.status === "late") report.by_month[month].present++;
      }

      report.attendance_rate = report.total_records > 0 ? Math.round(((report.present + report.late) / report.total_records) * 100) : 0;
      for (const m of Object.keys(report.by_month)) {
        const d = report.by_month[m];
        d.rate = d.total > 0 ? Math.round((d.present / d.total) * 100) : 0;
      }
      return report;
    },
    enabled: !!organization,
  });
}

export function useEnrollmentReport(filters: ReportFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["report-enrollment", organization?.id, filters],
    queryFn: async (): Promise<EnrollmentReport> => {
      if (!organization) return { total_enrollments: 0, active: 0, completed: 0, cancelled: 0, pending: 0, by_course: {}, by_month: {}, by_status: {} };

      let query = supabase.from("student_enrollments").select("status, enrollment_date, course_id").eq("organization_id", organization.id).is("deleted_at", null);
      if (filters.date_from) query = query.gte("enrollment_date", filters.date_from);
      if (filters.date_to) query = query.lte("enrollment_date", filters.date_to);

      const { data } = await query;
      const rows = (data ?? []) as Array<{ status: string; enrollment_date: string; course_id: string }>;

      const report: EnrollmentReport = { total_enrollments: rows.length, active: 0, completed: 0, cancelled: 0, pending: 0, by_course: {}, by_month: {}, by_status: {} };

      for (const r of rows) {
        if (r.status === "active" || r.status === "approved") report.active++;
        if (r.status === "completed") report.completed++;
        if (r.status === "cancelled" || r.status === "rejected") report.cancelled++;
        if (r.status === "pending") report.pending++;
        report.by_status[r.status] = (report.by_status[r.status] || 0) + 1;
        const month = r.enrollment_date?.substring(0, 7) ?? "unknown";
        report.by_month[month] = (report.by_month[month] || 0) + 1;
        const courseKey = r.course_id?.substring(0, 8) ?? "unknown";
        report.by_course[courseKey] = (report.by_course[courseKey] || 0) + 1;
      }
      return report;
    },
    enabled: !!organization,
  });
}

export function useTrainerReport() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["report-trainers", organization?.id],
    queryFn: async (): Promise<TrainerReport> => {
      if (!organization) return { total_trainers: 0, active: 0, by_specialization: {}, courses_per_trainer: {} };

      const { data } = await supabase.from("trainers").select("status, specialization").eq("organization_id", organization.id).is("deleted_at", null);
      const rows = (data ?? []) as Array<{ status: string; specialization: string | null }>;

      const report: TrainerReport = { total_trainers: rows.length, active: 0, by_specialization: {}, courses_per_trainer: {} };
      for (const r of rows) {
        if (r.status === "active") report.active++;
        const spec = r.specialization || "غير محدد";
        report.by_specialization[spec] = (report.by_specialization[spec] || 0) + 1;
      }
      return report;
    },
    enabled: !!organization,
  });
}

export function useDashboardAnalytics() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["dashboard-analytics", organization?.id],
    queryFn: async (): Promise<DashboardAnalytics> => {
      if (!organization) return { total_students: 0, total_trainers: 0, total_courses: 0, total_enrollments: 0, total_revenue: 0, attendance_rate: 0, new_students_this_month: 0, active_enrollments: 0, pending_enrollments: 0, certificates_issued: 0 };

      const [studentsRes, trainersRes, coursesRes, enrollmentsRes, attendanceRes, certsRes] = await Promise.all([
        supabase.from("students").select("id, created_at", { count: "exact" }).eq("organization_id", organization.id).is("deleted_at", null),
        supabase.from("trainers").select("id", { count: "exact" }).eq("organization_id", organization.id).is("deleted_at", null),
        supabase.from("courses").select("id", { count: "exact" }).eq("organization_id", organization.id).is("deleted_at", null),
        supabase.from("student_enrollments").select("status, total_fees, paid_amount").eq("organization_id", organization.id).is("deleted_at", null),
        supabase.from("attendance_records").select("status").eq("organization_id", organization.id).is("deleted_at", null).limit(1000),
        supabase.from("certificates").select("id", { count: "exact" }).eq("organization_id", organization.id).eq("status", "active").is("deleted_at", null),
      ]);

      const enrollments = (enrollmentsRes.data ?? []) as Array<{ status: string; total_fees: number; paid_amount: number }>;
      const attendance = (attendanceRes.data ?? []) as Array<{ status: string }>;
      const students = (studentsRes.data ?? []) as Array<{ created_at: string }>;
      const now = new Date();
      const thisMonth = now.toISOString().substring(0, 7);

      const totalRevenue = enrollments.reduce((sum, e) => sum + (Number(e.total_fees) || 0), 0);
      const presentCount = attendance.filter(a => a.status === "present" || a.status === "late").length;
      const newStudents = students.filter(s => s.created_at?.startsWith(thisMonth)).length;

      return {
        total_students: studentsRes.count ?? 0,
        total_trainers: trainersRes.count ?? 0,
        total_courses: coursesRes.count ?? 0,
        total_enrollments: enrollments.length,
        total_revenue: totalRevenue,
        attendance_rate: attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0,
        new_students_this_month: newStudents,
        active_enrollments: enrollments.filter(e => e.status === "active").length,
        pending_enrollments: enrollments.filter(e => e.status === "pending").length,
        certificates_issued: certsRes.count ?? 0,
      };
    },
    enabled: !!organization,
  });
}
