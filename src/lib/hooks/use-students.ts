"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import { toast } from "sonner";
import type { Student, StudentFormData, StudentSearchParams, StudentStats, StudentAttachment } from "@/lib/types/student";

export function useStudents(params: StudentSearchParams = {}) {
  const { organization, branch } = useTenant();
  const supabase = createClient();
  const page = params.page ?? 0;
  const pageSize = params.pageSize ?? 20;

  return useQuery({
    queryKey: ["students", organization?.id, branch?.id, params.search, params.status, page, params.sortBy, params.sortOrder],
    queryFn: async () => {
      if (!organization) return { data: [], count: 0 };

      let query = supabase
        .from("students")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      if (branch) {
        query = query.eq("branch_id", branch.id);
      }

      if (params.search) {
        const search = params.search;
        query = query.or(
          `first_name_ar.ilike.%${search}%,last_name_ar.ilike.%${search}%,first_name_en.ilike.%${search}%,last_name_en.ilike.%${search}%,student_number.ilike.%${search}%,registration_number.ilike.%${search}%,mobile.ilike.%${search}%,national_id.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      if (params.status && params.status !== 'all') {
        query = query.eq("status", params.status);
      }

      if (params.branch_id) {
        query = query.eq("branch_id", params.branch_id);
      }

      if (params.course_id) {
        query = query.eq("course_id", params.course_id);
      }

      if (params.department_id) {
        query = query.eq("department_id", params.department_id);
      }

      const sortBy = params.sortBy ?? "created_at";
      const sortOrder = params.sortOrder ?? "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });
      query = query.range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, count } = await query;
      return { data: (data ?? []) as Student[], count: count ?? 0 };
    },
    enabled: !!organization,
  });
}

export function useStudent(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Student;
    },
    enabled: !!id,
  });
}

export function useStudentStats() {
  const { organization, branch } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["student-stats", organization?.id, branch?.id],
    queryFn: async () => {
      if (!organization) return { total: 0, active: 0, pending: 0, graduated: 0, withdrawn: 0, suspended: 0 };

      const baseQuery = supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      const branchQuery = branch ? baseQuery.eq("branch_id", branch.id) : baseQuery;

      const [total, active, pending, graduated, withdrawn, suspended] = await Promise.all([
        branchQuery,
        supabase.from("students").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "active").is("deleted_at", null),
        supabase.from("students").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "pending").is("deleted_at", null),
        supabase.from("students").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "graduated").is("deleted_at", null),
        supabase.from("students").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "withdrawn").is("deleted_at", null),
        supabase.from("students").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "suspended").is("deleted_at", null),
      ]);

      return {
        total: total.count ?? 0,
        active: active.count ?? 0,
        pending: pending.count ?? 0,
        graduated: graduated.count ?? 0,
        withdrawn: withdrawn.count ?? 0,
        suspended: suspended.count ?? 0,
      } as StudentStats;
    },
    enabled: !!organization,
  });
}

export function useCreateStudent() {
  const { organization, branch } = useTenant();
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: StudentFormData) => {
      if (!organization) throw new Error("No organization");
      const { error } = await (supabase.from("students") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> })
        .insert({
          ...data,
          organization_id: organization.id,
          branch_id: branch?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student-stats"] });
      toast.success("تم إنشاء الطالبة بنجاح");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateStudent() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StudentFormData> }) => {
      const { error } = await (supabase.from("students") as unknown as { update: (data: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } })
        .update(data as Record<string, unknown>)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم تحديث بيانات الطالبة بنجاح");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteStudent() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("students") as unknown as { update: (data: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } })
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student-stats"] });
      toast.success("تم حذف الطالبة بنجاح");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRestoreStudent() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("students") as unknown as { update: (data: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } })
        .update({ deleted_at: null, deleted_by: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student-stats"] });
      toast.success("تم استعادة الطالبة بنجاح");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useStudentAttachments(studentId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["student-attachments", studentId],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_attachments")
        .select("*")
        .eq("student_id", studentId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      return (data ?? []) as StudentAttachment[];
    },
    enabled: !!studentId,
  });
}
