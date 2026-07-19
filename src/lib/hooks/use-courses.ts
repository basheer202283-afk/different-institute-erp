"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type { Course, CourseFormData, CourseFilters, PaginatedResponse } from "@/lib/types/course";
import { toast } from "sonner";

// Fetch courses with pagination and filters
export function useCourses(filters: CourseFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { search, status, academic_level, program_id, department_id, page = 1, pageSize = 10 } = filters;

  return useQuery({
    queryKey: ["courses", organization?.id, search, status, academic_level, program_id, department_id, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Course>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase
        .from("courses")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (academic_level) {
        query = query.eq("academic_level", academic_level);
      }

      if (program_id) {
        query = query.eq("program_id", program_id);
      }

      if (department_id) {
        query = query.eq("department_id", department_id);
      }

      const { data, count, error } = await query
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return {
        data: (data ?? []) as Course[],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    enabled: !!organization,
  });
}

// Fetch single course
export function useCourse(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["courses", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Course;
    },
    enabled: !!id,
  });
}

// Create course
export function useCreateCourse() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CourseFormData) => {
      if (!organization) throw new Error("No organization");

      const insertData = {
        ...data,
        organization_id: organization.id,
        description: data.description || null,
        program_id: data.program_id || null,
        department_id: data.department_id || null,
        instructor_id: data.instructor_id || null,
        syllabus: data.syllabus || null,
        objectives: data.objectives || null,
        materials: data.materials || null,
        online_link: data.online_link || null,
        location: data.location || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      };

      const { data: course, error } = await (supabase
        .from("courses") as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return course as Course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("تم إنشاء الدورة بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في إنشاء الدورة: ${error.message}`);
    },
  });
}

// Update course
export function useUpdateCourse() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CourseFormData> }) => {
      const updateData = {
        ...data,
        description: data.description || null,
        program_id: data.program_id || null,
        department_id: data.department_id || null,
        instructor_id: data.instructor_id || null,
        syllabus: data.syllabus || null,
        objectives: data.objectives || null,
        materials: data.materials || null,
        online_link: data.online_link || null,
        location: data.location || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      };

      const { data: course, error } = await (supabase
        .from("courses") as any)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return course as Course;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", variables.id] });
      toast.success("تم تحديث الدورة بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تحديث الدورة: ${error.message}`);
    },
  });
}

// Delete course (soft delete)
export function useDeleteCourse() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from("courses") as any)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("تم حذف الدورة بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في حذف الدورة: ${error.message}`);
    },
  });
}

// Update course status
export function useUpdateCourseStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Course['status'] }) => {
      const { error } = await (supabase
        .from("courses") as any)
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("تم تحديث حالة الدورة بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تحديث الحالة: ${error.message}`);
    },
  });
}
