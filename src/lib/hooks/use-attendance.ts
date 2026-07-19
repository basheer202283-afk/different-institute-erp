"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type { AttendanceRecord, AttendanceFormData, AttendanceFilters, AttendanceStats, PaginatedResponse } from "@/lib/types/attendance";
import { toast } from "sonner";

// Fetch attendance records with pagination and filters
export function useAttendanceRecords(filters: AttendanceFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { class_id, student_id, date_from, date_to, status, page = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ["attendance", organization?.id, class_id, student_id, date_from, date_to, status, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<AttendanceRecord>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase
        .from("attendance_records")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("attendance_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (class_id) {
        query = query.eq("class_id", class_id);
      }

      if (student_id) {
        query = query.eq("student_id", student_id);
      }

      if (date_from) {
        query = query.gte("attendance_date", date_from);
      }

      if (date_to) {
        query = query.lte("attendance_date", date_to);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, count, error } = await query
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return {
        data: (data ?? []) as AttendanceRecord[],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    enabled: !!organization,
  });
}

// Fetch attendance statistics
export function useAttendanceStats(filters: { class_id?: string; date_from?: string; date_to?: string } = {}) {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["attendance-stats", organization?.id, filters.class_id, filters.date_from, filters.date_to],
    queryFn: async (): Promise<AttendanceStats> => {
      if (!organization) return { total: 0, present: 0, absent: 0, late: 0, excused: 0, attendance_rate: 0 };

      let query = supabase
        .from("attendance_records")
        .select("status")
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      if (filters.class_id) {
        query = query.eq("class_id", filters.class_id);
      }

      if (filters.date_from) {
        query = query.gte("attendance_date", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("attendance_date", filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;

      const records = (data ?? []) as Array<{ status: string }>;
      const total = records.length;
      const present = records.filter((r) => r.status === "present").length;
      const absent = records.filter((r) => r.status === "absent").length;
      const late = records.filter((r) => r.status === "late").length;
      const excused = records.filter((r) => r.status === "excused").length;
      const attendance_rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      return { total, present, absent, late, excused, attendance_rate };
    },
    enabled: !!organization,
  });
}

// Create attendance record
export function useCreateAttendance() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AttendanceFormData) => {
      if (!organization) throw new Error("No organization");

      const insertData = {
        ...data,
        organization_id: organization.id,
        reason: data.reason || null,
        notes: data.notes || null,
        check_in_time: data.check_in_time || null,
        check_out_time: data.check_out_time || null,
        late_minutes: data.late_minutes ?? 0,
      };

      const { data: record, error } = await (supabase
        .from("attendance_records") as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return record as AttendanceRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
      toast.success("تم تسجيل الحضور بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تسجيل الحضور: ${error.message}`);
    },
  });
}

// Bulk create attendance records
export function useBulkCreateAttendance() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (records: AttendanceFormData[]) => {
      if (!organization) throw new Error("No organization");

      const insertData = records.map((record) => ({
        ...record,
        organization_id: organization.id,
        reason: record.reason || null,
        notes: record.notes || null,
        check_in_time: record.check_in_time || null,
        check_out_time: record.check_out_time || null,
        late_minutes: record.late_minutes ?? 0,
      }));

      const { data, error } = await (supabase
        .from("attendance_records") as any)
        .insert(insertData)
        .select();

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
      toast.success("تم تسجيل الحضور بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تسجيل الحضور: ${error.message}`);
    },
  });
}

// Update attendance record
export function useUpdateAttendance() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AttendanceFormData> }) => {
      const updateData = {
        ...data,
        reason: data.reason || null,
        notes: data.notes || null,
        check_in_time: data.check_in_time || null,
        check_out_time: data.check_out_time || null,
      };

      const { data: record, error } = await (supabase
        .from("attendance_records") as any)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return record as AttendanceRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
      toast.success("تم تحديث الحضور بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تحديث الحضور: ${error.message}`);
    },
  });
}

// Delete attendance record
export function useDeleteAttendance() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from("attendance_records") as any)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
      toast.success("تم حذف سجل الحضور بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في حذف سجل الحضور: ${error.message}`);
    },
  });
}

// Fetch classes for attendance
export function useClasses() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["classes", organization?.id],
    queryFn: async () => {
      if (!organization) return [];

      const { data, error } = await supabase
        .from("classes")
        .select("id, name, code, course_id")
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organization,
  });
}

// Fetch students for attendance
export function useStudents() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["students-list", organization?.id],
    queryFn: async () => {
      if (!organization) return [];

      const { data, error } = await supabase
        .from("students")
        .select("id, first_name_ar, last_name_ar, student_number")
        .eq("organization_id", organization.id)
        .eq("status", "active")
        .is("deleted_at", null)
        .order("first_name_ar");

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organization,
  });
}
