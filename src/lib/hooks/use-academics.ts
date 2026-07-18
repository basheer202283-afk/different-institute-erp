"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import type { CourseFormData, ClassFormData, ProgramFormData, DepartmentFormData, InstructorFormData, AcademicYearFormData, SemesterFormData } from "@/lib/validators";

type Program = { id: string; name: string; code: string; description: string | null; department_id: string | null; academic_level: string; duration_months: number | null; total_credits: number | null; total_courses: number | null; is_active: boolean; requirements: string | null; outcomes: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null; tenant_id: string };
type Course = { id: string; tenant_id: string; program_id: string | null; department_id: string | null; instructor_id: string | null; name: string; code: string; description: string | null; academic_level: string; status: string; credits: number; duration_hours: number | null; max_students: number | null; min_students: number; price: number; currency: string; start_date: string | null; end_date: string | null; schedule: unknown; prerequisites: string[]; syllabus: string | null; objectives: string | null; materials: string | null; is_online: boolean; online_link: string | null; location: string | null; image_url: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type ClassRow = { id: string; tenant_id: string; course_id: string; semester_id: string | null; instructor_id: string | null; name: string; code: string; section: string | null; status: string; max_students: number | null; current_students: number; start_date: string | null; end_date: string | null; schedule: unknown; room: string | null; building: string | null; is_active: boolean; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type Department = { id: string; tenant_id: string; parent_id: string | null; name: string; code: string; description: string | null; head_id: string | null; email: string | null; phone: string | null; is_active: boolean; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type Instructor = { id: string; tenant_id: string; user_id: string; department_id: string | null; employee_number: string | null; specialization: string | null; qualifications: string | null; experience_years: number; hourly_rate: number | null; bio: string | null; office_location: string | null; office_hours: string | null; is_active: boolean; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type AcademicYear = { id: string; tenant_id: string; name: string; code: string; start_date: string; end_date: string; is_current: boolean; is_active: boolean; description: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type Semester = { id: string; tenant_id: string; academic_year_id: string; name: string; code: string; start_date: string; end_date: string; is_current: boolean; is_active: boolean; description: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type Enrollment = { id: string; tenant_id: string; student_id: string; course_id: string; class_id: string | null; enrollment_date: string; start_date: string | null; end_date: string | null; status: string; payment_status: string; total_fees: number; paid_amount: number; discount_amount: number; discount_reason: string | null; notes: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type ClassSchedule = { id: string; tenant_id: string; class_id: string; day_of_week: number; start_time: string; end_time: string; room: string | null; building: string | null; is_active: boolean; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type ClassSession = { id: string; tenant_id: string; class_id: string; instructor_id: string | null; title: string | null; description: string | null; session_date: string; start_time: string; end_time: string; room: string | null; building: string | null; status: string; notes: string | null; materials: unknown; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };

// Programs
export function usePrograms() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["programs", tenantId],
    queryFn: async () => {
      if (!tenantId) return [] as Program[];
      const { data } = await supabase.from("programs").select("*").eq("tenant_id", tenantId).is("deleted_at", null).order("name");
      return (data ?? []) as Program[];
    },
    enabled: !!tenantId,
  });
}

export function useProgram(id: string) {
  const supabase = createClient();
  return useQuery({ queryKey: ["programs", id], queryFn: async () => { const { data } = await supabase.from("programs").select("*").eq("id", id).single(); return data as Program | null; }, enabled: !!id });
}

export function useCreateProgram() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: ProgramFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("programs") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["programs"] }); toast.success("Program created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProgram() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProgramFormData> }) => { const { error } = await (supabase.from("programs") as unknown as { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: unknown }> } }).update(data as Record<string, unknown>).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["programs"] }); toast.success("Program updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Courses
export function useCourses(params?: { search?: string; status?: string }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["courses", tenantId, params?.search, params?.status],
    queryFn: async () => {
      if (!tenantId) return [] as Course[];
      let q = supabase.from("courses").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.search) q = q.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%`);
      if (params?.status && params.status !== "all") q = q.eq("status", params.status);
      const { data } = await q.order("name");
      return (data ?? []) as Course[];
    },
    enabled: !!tenantId,
  });
}

export function useCourse(id: string) {
  const supabase = createClient();
  return useQuery({ queryKey: ["courses", id], queryFn: async () => { const { data } = await supabase.from("courses").select("*").eq("id", id).single(); return data as Course | null; }, enabled: !!id });
}

export function useCreateCourse() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: CourseFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("courses") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["courses"] }); toast.success("Course created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCourse() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CourseFormData> }) => { const { error } = await (supabase.from("courses") as unknown as { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: unknown }> } }).update(data as Record<string, unknown>).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["courses"] }); toast.success("Course updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Classes
export function useClasses(params?: { course_id?: string; status?: string }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["classes", tenantId, params?.course_id, params?.status],
    queryFn: async () => {
      if (!tenantId) return [] as ClassRow[];
      let q = supabase.from("classes").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.course_id) q = q.eq("course_id", params.course_id);
      if (params?.status && params.status !== "all") q = q.eq("status", params.status);
      const { data } = await q.order("name");
      return (data ?? []) as ClassRow[];
    },
    enabled: !!tenantId,
  });
}

export function useClass(id: string) {
  const supabase = createClient();
  return useQuery({ queryKey: ["classes", id], queryFn: async () => { const { data } = await supabase.from("classes").select("*").eq("id", id).single(); return data as ClassRow | null; }, enabled: !!id });
}

export function useCreateClass() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: ClassFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("classes") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); toast.success("Class created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateClass() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClassFormData> }) => { const { error } = await (supabase.from("classes") as unknown as { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: unknown }> } }).update(data as Record<string, unknown>).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); toast.success("Class updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Departments
export function useDepartments() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["departments", tenantId],
    queryFn: async () => { if (!tenantId) return [] as Department[]; const { data } = await supabase.from("departments").select("*").eq("tenant_id", tenantId).is("deleted_at", null).order("name"); return (data ?? []) as Department[]; },
    enabled: !!tenantId,
  });
}

export function useCreateDepartment() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: DepartmentFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("departments") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); toast.success("Department created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateDepartment() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DepartmentFormData> }) => { const { error } = await (supabase.from("departments") as unknown as { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: unknown }> } }).update(data as Record<string, unknown>).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); toast.success("Department updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Instructors
export function useInstructors() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["instructors", tenantId],
    queryFn: async () => { if (!tenantId) return [] as Instructor[]; const { data } = await supabase.from("instructors").select("*").eq("tenant_id", tenantId).is("deleted_at", null).order("created_at", { ascending: false }); return (data ?? []) as Instructor[]; },
    enabled: !!tenantId,
  });
}

export function useInstructor(id: string) {
  const supabase = createClient();
  return useQuery({ queryKey: ["instructors", id], queryFn: async () => { const { data } = await supabase.from("instructors").select("*").eq("id", id).single(); return data as Instructor | null; }, enabled: !!id });
}

export function useCreateInstructor() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: InstructorFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("instructors") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instructors"] }); toast.success("Instructor created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateInstructor() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InstructorFormData> }) => { const { error } = await (supabase.from("instructors") as unknown as { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: unknown }> } }).update(data as Record<string, unknown>).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instructors"] }); toast.success("Instructor updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Academic Years
export function useAcademicYears() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["academic_years", tenantId],
    queryFn: async () => { if (!tenantId) return [] as AcademicYear[]; const { data } = await supabase.from("academic_years").select("*").eq("tenant_id", tenantId).is("deleted_at", null).order("start_date", { ascending: false }); return (data ?? []) as AcademicYear[]; },
    enabled: !!tenantId,
  });
}

export function useCreateAcademicYear() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: AcademicYearFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("academic_years") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["academic_years"] }); toast.success("Academic year created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Semesters
export function useSemesters(academicYearId?: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["semesters", tenantId, academicYearId],
    queryFn: async () => {
      if (!tenantId) return [] as Semester[];
      let q = supabase.from("semesters").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (academicYearId) q = q.eq("academic_year_id", academicYearId);
      const { data } = await q.order("start_date", { ascending: false });
      return (data ?? []) as Semester[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateSemester() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: SemesterFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("semesters") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["semesters"] }); toast.success("Semester created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Enrollments
export function useEnrollments(params?: { student_id?: string; course_id?: string }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["enrollments", tenantId, params?.student_id, params?.course_id],
    queryFn: async () => {
      if (!tenantId) return [] as Enrollment[];
      let q = supabase.from("student_enrollments").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.student_id) q = q.eq("student_id", params.student_id);
      if (params?.course_id) q = q.eq("course_id", params.course_id);
      const { data } = await q.order("enrollment_date", { ascending: false });
      return (data ?? []) as Enrollment[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateEnrollment() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: { student_id: string; course_id: string; class_id?: string; enrollment_date: string; status?: string; total_fees?: number }) => {
      if (!tenantId) throw new Error("No tenant");
      const { error } = await (supabase.from("student_enrollments") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId, payment_status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["enrollments"] }); qc.invalidateQueries({ queryKey: ["students"] }); toast.success("Enrollment created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Class Schedules
export function useClassSchedules(classId?: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["class_schedules", tenantId, classId],
    queryFn: async () => {
      if (!tenantId) return [] as ClassSchedule[];
      let q = supabase.from("class_schedules").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (classId) q = q.eq("class_id", classId);
      const { data } = await q.order("day_of_week");
      return (data ?? []) as ClassSchedule[];
    },
    enabled: !!tenantId,
  });
}

// Class Sessions
export function useClassSessions(classId?: string, date?: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["class_sessions", tenantId, classId, date],
    queryFn: async () => {
      if (!tenantId) return [] as ClassSession[];
      let q = supabase.from("class_sessions").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (classId) q = q.eq("class_id", classId);
      if (date) q = q.eq("session_date", date);
      const { data } = await q.order("session_date", { ascending: false });
      return (data ?? []) as ClassSession[];
    },
    enabled: !!tenantId,
  });
}
