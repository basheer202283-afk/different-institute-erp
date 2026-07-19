"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type {
  Enrollment,
  EnrollmentWithRelations,
  EnrollmentFormData,
  EnrollmentFilters,
  EnrollmentStats,
  EnrollmentTransferData,
  WaitingListEntry,
  WaitingListFormData,
  WaitingListFilters,
  PaginatedResponse,
} from "@/lib/types/enrollment";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// ENROLLMENT HOOKS
// ============================================================

// Fetch enrollments with pagination and filters
export function useEnrollments(filters: EnrollmentFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const {
    search, status, payment_status, course_id, class_id, semester_id,
    date_from, date_to, page = 1, pageSize = 10,
  } = filters;

  return useQuery({
    queryKey: ["enrollments", organization?.id, search, status, payment_status, course_id, class_id, semester_id, date_from, date_to, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Enrollment>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase
        .from("student_enrollments")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (search) query = query.or(`notes.ilike.%${search}%,discount_reason.ilike.%${search}%,cancellation_reason.ilike.%${search}%`);
      if (status) query = query.eq("status", status);
      if (payment_status) query = query.eq("payment_status", payment_status);
      if (course_id) query = query.eq("course_id", course_id);
      if (class_id) query = query.eq("class_id", class_id);
      if (semester_id) query = query.eq("semester_id", semester_id);
      if (date_from) query = query.gte("enrollment_date", date_from);
      if (date_to) query = query.lte("enrollment_date", date_to);

      const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;

      return {
        data: (data ?? []) as Enrollment[],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    enabled: !!organization,
  });
}

// Fetch single enrollment
export function useEnrollment(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["enrollments", id],
    queryFn: async (): Promise<Enrollment | null> => {
      const { data, error } = await supabase
        .from("student_enrollments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Enrollment;
    },
    enabled: !!id,
  });
}

// Fetch enrollments by student
export function useStudentEnrollments(studentId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["enrollments", "student", studentId],
    queryFn: async (): Promise<Enrollment[]> => {
      const { data, error } = await supabase
        .from("student_enrollments")
        .select("*")
        .eq("student_id", studentId)
        .is("deleted_at", null)
        .order("enrollment_date", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Enrollment[];
    },
    enabled: !!studentId,
  });
}

// Fetch enrollments by course
export function useCourseEnrollments(courseId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["enrollments", "course", courseId],
    queryFn: async (): Promise<Enrollment[]> => {
      const { data, error } = await supabase
        .from("student_enrollments")
        .select("*")
        .eq("course_id", courseId)
        .is("deleted_at", null)
        .order("enrollment_date", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Enrollment[];
    },
    enabled: !!courseId,
  });
}

// Fetch enrollment with student/course details
export function useEnrollmentDetail(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["enrollments", "detail", id],
    queryFn: async (): Promise<EnrollmentWithRelations | null> => {
      const { data: enrollment, error } = await supabase
        .from("student_enrollments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!enrollment) return null;

      const record = enrollment as unknown as Enrollment;
      const result: EnrollmentWithRelations = { ...record };

      if (record.student_id) {
        const { data: student } = await supabase
          .from("students")
          .select("id, student_number, first_name_ar, last_name_ar, first_name_en, last_name_en, mobile, email, photo_url, status")
          .eq("id", record.student_id)
          .single();
        if (student) result.student = student as EnrollmentWithRelations["student"];
      }

      if (record.course_id) {
        const { data: course } = await supabase
          .from("courses")
          .select("id, name, code, price, max_students, duration_hours, status")
          .eq("id", record.course_id)
          .single();
        if (course) result.course = course as EnrollmentWithRelations["course"];
      }

      if (record.class_id) {
        const { data: cls } = await supabase
          .from("classes")
          .select("id, name, code, max_students, current_students, status")
          .eq("id", record.class_id)
          .single();
        if (cls) result.class = cls as EnrollmentWithRelations["class"];
      }

      if (record.semester_id) {
        const { data: semester } = await supabase
          .from("semesters")
          .select("id, name, code, start_date, end_date")
          .eq("id", record.semester_id)
          .single();
        if (semester) result.semester = semester as EnrollmentWithRelations["semester"];
      }

      return result;
    },
    enabled: !!id,
  });
}

// Create enrollment
export function useCreateEnrollment() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EnrollmentFormData) => {
      if (!organization) throw new Error("No organization");

      // Check capacity
      if (data.class_id) {
        const { data: cls } = await supabase
          .from("classes")
          .select("max_students, current_students")
          .eq("id", data.class_id)
          .single();

        const classData = cls as any;
        if (classData?.max_students && classData.current_students >= classData.max_students) {
          throw new Error("الفصل ممتلئ. لا يمكن التسجيل.");
        }
      }

      // Check for duplicate enrollment
      const { data: existing } = await supabase
        .from("student_enrollments")
        .select("id")
        .eq("student_id", data.student_id)
        .eq("course_id", data.course_id)
        .is("deleted_at", null)
        .not("status", "eq", "cancelled")
        .not("status", "eq", "rejected")
        .limit(1);

      if (existing && (existing as any).length > 0) {
        throw new Error("الطالبة مسجلة بالفعل في هذه الدورة.");
      }

      const insertData = {
        student_id: data.student_id,
        course_id: data.course_id,
        class_id: data.class_id || null,
        semester_id: data.semester_id || null,
        organization_id: organization.id,
        enrollment_date: data.enrollment_date || new Date().toISOString().split("T")[0],
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        status: data.status || "pending",
        approval_status: "pending",
        payment_status: data.payment_status || "pending",
        total_fees: data.total_fees || 0,
        paid_amount: data.paid_amount || 0,
        discount_amount: data.discount_amount || 0,
        discount_reason: data.discount_reason || null,
        notes: data.notes || null,
      };

      const { data: enrollment, error } = await (supabase
        .from("student_enrollments") as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Update class current_students count
      if (data.class_id) {
        const { data: cls } = await supabase
          .from("classes")
          .select("current_students")
          .eq("id", data.class_id)
          .single();
        const classData = cls as any;
        const currentCount = classData?.current_students || 0;
        await (supabase.from("classes") as any)
          .update({ current_students: currentCount + 1 }).eq("id", data.class_id);
      }

      return enrollment as Enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("تم إنشاء التسجيل بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في إنشاء التسجيل: ${error.message}`);
    },
  });
}

// Update enrollment
export function useUpdateEnrollment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EnrollmentFormData> }) => {
      const updateData: Record<string, unknown> = {
        ...data,
        class_id: data.class_id || null,
        semester_id: data.semester_id || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        discount_reason: data.discount_reason || null,
        notes: data.notes || null,
      };

      const { data: enrollment, error } = await (supabase
        .from("student_enrollments") as any)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return enrollment as Enrollment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", variables.id] });
      toast.success("تم تحديث التسجيل بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تحديث التسجيل: ${error.message}`);
    },
  });
}

// Update enrollment status
export function useUpdateEnrollmentStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: Enrollment["status"]; reason?: string }) => {
      const updateData: Record<string, unknown> = { status };
      if (status === "cancelled") {
        updateData.cancellation_reason = reason || null;
        updateData.cancelled_at = new Date().toISOString();
      }
      if (status === "completed") {
        updateData.completion_date = new Date().toISOString();
      }

      const { error } = await (supabase.from("student_enrollments") as any)
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("تم تحديث حالة التسجيل بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تحديث الحالة: ${error.message}`);
    },
  });
}

// Approve/reject enrollment
export function useApproveEnrollment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action, review_notes }: { id: string; action: "approve" | "reject"; review_notes?: string }) => {
      const updateData: Record<string, unknown> = {
        approval_status: action === "approve" ? "approved" : "rejected",
        approved_at: new Date().toISOString(),
        status: action === "approve" ? "approved" : "rejected",
      };
      if (action === "reject") {
        updateData.rejection_reason = review_notes || null;
      }

      const { error } = await (supabase.from("student_enrollments") as any)
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      return { id, action };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      const msg = variables.action === "approve" ? "تمت الموافقة على التسجيل" : "تم رفض التسجيل";
      toast.success(msg);
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });
}

// Transfer enrollment to different batch
export function useTransferEnrollment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EnrollmentTransferData) => {
      // Get current enrollment
      const { data: current, error: fetchError } = await supabase
        .from("student_enrollments")
        .select("*")
        .eq("id", data.enrollment_id)
        .single();

      if (fetchError) throw fetchError;
      const currentEnrollment = current as any as Enrollment;

      // Check target class capacity
      const { data: targetClass } = await supabase
        .from("classes")
        .select("max_students, current_students")
        .eq("id", data.target_class_id)
        .single();

      const tc = targetClass as any;
      if (tc?.max_students && tc.current_students >= tc.max_students) {
        throw new Error("الفصل المستهدف ممتلئ.");
      }

      // Update current enrollment to transferred
      await (supabase.from("student_enrollments") as any)
        .update({
          status: "transferred",
          transfer_to_enrollment_id: null,
        })
        .eq("id", data.enrollment_id);

      // Create new enrollment in target class
      const insertData = {
        student_id: currentEnrollment.student_id,
        course_id: currentEnrollment.course_id,
        class_id: data.target_class_id,
        semester_id: currentEnrollment.semester_id,
        organization_id: currentEnrollment.organization_id,
        tenant_id: currentEnrollment.tenant_id,
        enrollment_date: new Date().toISOString().split("T")[0],
        start_date: currentEnrollment.start_date,
        end_date: currentEnrollment.end_date,
        status: "active",
        approval_status: "approved",
        payment_status: currentEnrollment.payment_status,
        total_fees: currentEnrollment.total_fees,
        paid_amount: currentEnrollment.paid_amount,
        discount_amount: currentEnrollment.discount_amount,
        discount_reason: currentEnrollment.discount_reason,
        transfer_from_enrollment_id: data.enrollment_id,
        notes: `نقلت من ${currentEnrollment.class_id || "—"}: ${data.reason || ""}`,
      };

      const { data: newEnrollment, error: insertError } = await (supabase
        .from("student_enrollments") as any)
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Update class counts
      if (currentEnrollment.class_id) {
        const { data: oldClass } = await supabase
          .from("classes")
          .select("current_students")
          .eq("id", currentEnrollment.class_id)
          .single();
        const oc = oldClass as any;
        await (supabase.from("classes") as any)
          .update({ current_students: Math.max(0, (oc?.current_students || 1) - 1) })
          .eq("id", currentEnrollment.class_id);
      }

      const { data: newClass } = await supabase
        .from("classes")
        .select("current_students")
        .eq("id", data.target_class_id)
        .single();
      const nc = newClass as any;
      await (supabase.from("classes") as any)
        .update({ current_students: (nc?.current_students || 0) + 1 })
        .eq("id", data.target_class_id);

      return newEnrollment as Enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("تم نقل التسجيل بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في النقل: ${error.message}`);
    },
  });
}

// Cancel enrollment
export function useCancelEnrollment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason, refund_amount }: { id: string; reason: string; refund_amount?: number }) => {
      const updateData: Record<string, unknown> = {
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      };
      if (refund_amount !== undefined) {
        updateData.payment_status = "refunded";
      }

      const { error } = await (supabase.from("student_enrollments") as any)
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Decrement class current_students
      const { data: enrollment } = await supabase
        .from("student_enrollments")
        .select("class_id")
        .eq("id", id)
        .single();
      const enr = enrollment as any;

      if (enr?.class_id) {
        const { data: cls } = await supabase
          .from("classes")
          .select("current_students")
          .eq("id", enr.class_id)
          .single();
        const cl = cls as any;
        await (supabase.from("classes") as any)
          .update({ current_students: Math.max(0, (cl?.current_students || 1) - 1) })
          .eq("id", enr.class_id);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("تم إلغاء التسجيل بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في الإلغاء: ${error.message}`);
    },
  });
}

// Delete enrollment (soft delete)
export function useDeleteEnrollment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("student_enrollments") as any)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("تم حذف التسجيل بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في حذف التسجيل: ${error.message}`);
    },
  });
}

// ============================================================
// WAITING LIST HOOKS
// ============================================================

export function useWaitingList(filters: WaitingListFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { search, status, course_id, page = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ["waiting-list", organization?.id, search, status, course_id, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<WaitingListEntry>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase
        .from("enrollment_waiting_list")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("position", { ascending: true });

      if (status) query = query.eq("status", status);
      if (course_id) query = query.eq("course_id", course_id);

      const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;

      return {
        data: (data ?? []) as WaitingListEntry[],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    enabled: !!organization,
  });
}

export function useAddToWaitingList() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WaitingListFormData) => {
      if (!organization) throw new Error("No organization");

      const { data: maxPos } = await supabase
        .from("enrollment_waiting_list")
        .select("position")
        .eq("course_id", data.course_id)
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("position", { ascending: false })
        .limit(1);

      const positions = (maxPos ?? []) as Array<{ position: number }>;
      const nextPosition = positions.length > 0 ? positions[0].position + 1 : 1;

      const { data: existing } = await supabase
        .from("enrollment_waiting_list")
        .select("id")
        .eq("student_id", data.student_id)
        .eq("course_id", data.course_id)
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .eq("status", "waiting")
        .limit(1);

      if (existing && (existing as any).length > 0) {
        throw new Error("الطالبة موجودة بالفعل في قائمة الانتظار لهذه الدورة.");
      }

      const insertData = {
        student_id: data.student_id,
        course_id: data.course_id,
        organization_id: organization.id,
        position: nextPosition,
        status: "waiting",
        priority: data.priority || 5,
        requested_date: new Date().toISOString().split("T")[0],
        notes: data.notes || null,
      };

      const { data: entry, error } = await (supabase
        .from("enrollment_waiting_list") as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return entry as WaitingListEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-list"] });
      toast.success("تمت الإضافة إلى قائمة الانتظار");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });
}

export function useUpdateWaitingListStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: WaitingListEntry["status"]; reason?: string }) => {
      const updateData: Record<string, unknown> = { status };
      if (status === "offered") {
        updateData.offered_date = new Date().toISOString();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        updateData.offer_expires_at = expiresAt.toISOString();
      } else if (status === "accepted") {
        updateData.accepted_date = new Date().toISOString();
      } else if (status === "declined") {
        updateData.declined_date = new Date().toISOString();
        updateData.decline_reason = reason || null;
      }

      const { error } = await (supabase.from("enrollment_waiting_list") as any)
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["waiting-list"] });
      const messages: Record<string, string> = {
        offered: "تم تقديم العرض للطالبة",
        accepted: "تم قبول العرض",
        declined: "تم رفض العرض",
        expired: "انتهت صلاحية العرض",
      };
      toast.success(messages[variables.status] ?? "تم تحديث الحالة");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });
}

export function useRemoveFromWaitingList() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("enrollment_waiting_list") as any)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-list"] });
      toast.success("تمت الإزالة من قائمة الانتظار");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });
}

// ============================================================
// ENROLLMENT STATS HOOKS
// ============================================================

export function useEnrollmentStats() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["enrollment-stats", organization?.id],
    queryFn: async (): Promise<EnrollmentStats> => {
      if (!organization) {
        return { total: 0, pending: 0, active: 0, completed: 0, cancelled: 0, waiting: 0, totalRevenue: 0, collectedRevenue: 0, pendingPayments: 0 };
      }

      const { data: enrollments } = await supabase
        .from("student_enrollments")
        .select("status, total_fees, paid_amount")
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      const rows = (enrollments ?? []) as Array<{ status: string; total_fees: number; paid_amount: number }>;

      const stats: EnrollmentStats = {
        total: rows.length, pending: 0, active: 0, completed: 0, cancelled: 0,
        waiting: 0, totalRevenue: 0, collectedRevenue: 0, pendingPayments: 0,
      };

      for (const row of rows) {
        if (row.status === "pending" || row.status === "approved") stats.pending++;
        if (row.status === "active") stats.active++;
        if (row.status === "completed") stats.completed++;
        if (row.status === "cancelled" || row.status === "rejected") stats.cancelled++;
        stats.totalRevenue += Number(row.total_fees) || 0;
        stats.collectedRevenue += Number(row.paid_amount) || 0;
      }

      stats.pendingPayments = stats.totalRevenue - stats.collectedRevenue;

      const { count: waitingCount } = await supabase
        .from("enrollment_waiting_list")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .eq("status", "waiting")
        .is("deleted_at", null);

      stats.waiting = waitingCount ?? 0;
      return stats;
    },
    enabled: !!organization,
  });
}

// ============================================================
// CLASSES/BATCHES LIST HOOK (for dropdowns)
// ============================================================

export function useAvailableClasses(courseId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["available-classes", courseId],
    queryFn: async () => {
      let query = supabase
        .from("classes")
        .select("id, name, code, max_students, current_students, course_id")
        .eq("is_active", true)
        .is("deleted_at", null);

      if (courseId) query = query.eq("course_id", courseId);

      const { data, error } = await query.order("name");
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string; name: string; code: string;
        max_students: number | null; current_students: number; course_id: string;
      }>;
    },
  });
}

// Fetch semesters for dropdown
export function useSemesters() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["semesters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("semesters")
        .select("id, name, code, start_date, end_date, is_current, is_active")
        .is("deleted_at", null)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Array<{
        id: string; name: string; code: string; start_date: string; end_date: string;
        is_current: boolean; is_active: boolean;
      }>;
    },
  });
}

// ============================================================
// ENROLLMENT REPORTS HOOK
// ============================================================

export function useEnrollmentReport(filters: { date_from?: string; date_to?: string; course_id?: string } = {}) {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["enrollment-report", organization?.id, filters],
    queryFn: async () => {
      if (!organization) return null;

      let query = supabase
        .from("student_enrollments")
        .select("status, payment_status, total_fees, paid_amount, discount_amount, enrollment_date, course_id")
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      if (filters.date_from) query = query.gte("enrollment_date", filters.date_from);
      if (filters.date_to) query = query.lte("enrollment_date", filters.date_to);
      if (filters.course_id) query = query.eq("course_id", filters.course_id);

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as Array<{
        status: string; payment_status: string; total_fees: number; paid_amount: number;
        discount_amount: number; enrollment_date: string; course_id: string;
      }>;

      const byStatus: Record<string, number> = {};
      for (const r of rows) byStatus[r.status] = (byStatus[r.status] || 0) + 1;

      const byMonth: Record<string, number> = {};
      for (const r of rows) {
        const month = r.enrollment_date?.substring(0, 7) ?? "unknown";
        byMonth[month] = (byMonth[month] || 0) + 1;
      }

      const totalFees = rows.reduce((sum, r) => sum + (Number(r.total_fees) || 0), 0);
      const totalPaid = rows.reduce((sum, r) => sum + (Number(r.paid_amount) || 0), 0);
      const totalDiscounts = rows.reduce((sum, r) => sum + (Number(r.discount_amount) || 0), 0);

      return {
        total_enrollments: rows.length, by_status: byStatus, by_month: byMonth,
        total_fees: totalFees, total_paid: totalPaid, total_discounts: totalDiscounts,
        outstanding: totalFees - totalPaid,
      };
    },
    enabled: !!organization,
  });
}
