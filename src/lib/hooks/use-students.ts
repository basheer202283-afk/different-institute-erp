"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import type { StudentFormData } from "@/lib/validators";

const TABLE = "students";

type StudentRow = { id: string; tenant_id: string; user_id: string | null; student_number: string; admission_date: string | null; status: string; academic_level: string; guardian_name: string | null; guardian_phone: string | null; guardian_email: string | null; guardian_relationship: string | null; emergency_contact_name: string | null; emergency_contact_phone: string | null; medical_conditions: string | null; allergies: string | null; blood_group: string | null; nationality: string | null; religion: string | null; place_of_birth: string | null; previous_school: string | null; previous_grade: string | null; notes: string | null; tags: string[]; custom_fields: unknown; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };

export function useStudents(params?: { search?: string; status?: string; page?: number; pageSize?: number }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const page = params?.page ?? 0;
  const pageSize = params?.pageSize ?? 20;

  return useQuery({
    queryKey: ["students", tenantId, params?.search, params?.status, page],
    queryFn: async () => {
      if (!tenantId) return { data: [] as StudentRow[], count: 0 };
      let query = supabase.from(TABLE).select("*", { count: "exact" }).eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.search) query = query.or(`student_number.ilike.%${params.search}%,guardian_name.ilike.%${params.search}%,nationality.ilike.%${params.search}%`);
      if (params?.status && params.status !== "all") query = query.eq("status", params.status);
      query = query.order("created_at", { ascending: false }).range(page * pageSize, (page + 1) * pageSize - 1);
      const { data, count } = await query;
      return { data: (data ?? []) as StudentRow[], count: count ?? 0 };
    },
    enabled: !!tenantId,
  });
}

export function useStudent(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
      if (error) throw error;
      return data as StudentRow | null;
    },
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: StudentFormData) => {
      if (!tenantId) throw new Error("No tenant");
      const { error } = await (supabase.from(TABLE) as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...data, tenant_id: tenantId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["students"] }); toast.success("Student created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateStudent() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StudentFormData> }) => {
      const { error } = await (supabase.from(TABLE) as unknown as { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: unknown }> } }).update(data as Record<string, unknown>).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["students"] }); toast.success("Student updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteStudent() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from(TABLE) as unknown as { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: unknown }> } }).update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["students"] }); toast.success("Student deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useStudentEnrollments(studentId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["student_enrollments", studentId],
    queryFn: async () => {
      const { data } = await supabase.from("student_enrollments").select("*").eq("student_id", studentId).is("deleted_at", null).order("enrollment_date", { ascending: false });
      return (data ?? []) as Array<{ id: string; enrollment_date: string; status: string; [key: string]: unknown }>;
    },
    enabled: !!studentId,
  });
}

export function useStudentStats() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["student_stats", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const [total, active, pending, onLeave] = await Promise.all([
        supabase.from(TABLE).select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).is("deleted_at", null),
        supabase.from(TABLE).select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).in("status", ["active", "enrolled"]).is("deleted_at", null),
        supabase.from(TABLE).select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "pending").is("deleted_at", null),
        supabase.from(TABLE).select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "on_leave").is("deleted_at", null),
      ]);
      return { total: total.count ?? 0, active: active.count ?? 0, pending: pending.count ?? 0, onLeave: onLeave.count ?? 0 };
    },
    enabled: !!tenantId,
  });
}
