"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type { Student, StudentFormData, StudentFilters, PaginatedResponse } from "@/lib/types/student";
import { toast } from "sonner";

// Fetch students with pagination and filters
export function useStudents(filters: StudentFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { search, status, gender, page = 1, pageSize = 10 } = filters;

  return useQuery({
    queryKey: ["students", organization?.id, search, status, gender, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Student>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase
        .from("students")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `first_name_ar.ilike.%${search}%,last_name_ar.ilike.%${search}%,student_number.ilike.%${search}%,national_id.ilike.%${search}%,mobile.ilike.%${search}%`
        );
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (gender) {
        query = query.eq("gender", gender);
      }

      const { data, count, error } = await query
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return {
        data: (data ?? []) as Student[],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    enabled: !!organization,
  });
}

// Fetch single student
export function useStudent(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Student;
    },
    enabled: !!id,
  });
}

// Create student
export function useCreateStudent() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StudentFormData) => {
      if (!organization) throw new Error("No organization");

      const insertData = {
        ...data,
        organization_id: organization.id,
        email: data.email || null,
        guardian_email: data.guardian_email || null,
      };

      const { data: student, error } = await (supabase
        .from("students") as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return student as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم إنشاء الطالب بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في إنشاء الطالب: ${error.message}`);
    },
  });
}

// Update student
export function useUpdateStudent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StudentFormData> }) => {
      const updateData = {
        ...data,
        email: data.email || null,
        guardian_email: data.guardian_email || null,
      };

      const { data: student, error } = await (supabase
        .from("students") as any)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return student as Student;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", variables.id] });
      toast.success("تم تحديث بيانات الطالب بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تحديث الطالب: ${error.message}`);
    },
  });
}

// Delete student (soft delete)
export function useDeleteStudent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from("students") as any)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم حذف الطالب بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في حذف الطالب: ${error.message}`);
    },
  });
}

// Update student status
export function useUpdateStudentStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Student['status'] }) => {
      const { error } = await (supabase
        .from("students") as any)
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم تحديث حالة الطالب بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تحديث الحالة: ${error.message}`);
    },
  });
}
