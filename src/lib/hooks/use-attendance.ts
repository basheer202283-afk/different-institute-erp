"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";

type AttendanceRecord = { id: string; tenant_id: string; student_id: string; class_id: string; session_id: string | null; attendance_date: string; status: string; check_in_time: string | null; check_out_time: string | null; late_minutes: number; reason: string | null; notes: string | null; marked_by: string | null; is_approved: boolean; approved_by: string | null; approved_at: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type AttendanceSummary = { id: string; tenant_id: string; student_id: string; class_id: string; month: number; year: number; total_sessions: number; present_count: number; absent_count: number; late_count: number; excused_count: number; attendance_percentage: number; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };

export function useAttendanceRecords(params?: { class_id?: string; date?: string; student_id?: string }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["attendance_records", tenantId, params?.class_id, params?.date, params?.student_id],
    queryFn: async () => {
      if (!tenantId) return [] as AttendanceRecord[];
      let q = supabase.from("attendance_records").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.class_id) q = q.eq("class_id", params.class_id);
      if (params?.date) q = q.eq("attendance_date", params.date);
      if (params?.student_id) q = q.eq("student_id", params.student_id);
      const { data } = await q.order("attendance_date", { ascending: false }).limit(200);
      return (data ?? []) as AttendanceRecord[];
    },
    enabled: !!tenantId,
  });
}

export function useAttendanceSummary(params?: { student_id?: string; class_id?: string }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["attendance_summary", tenantId, params?.student_id, params?.class_id],
    queryFn: async () => {
      if (!tenantId) return [] as AttendanceSummary[];
      let q = supabase.from("attendance_summary").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.student_id) q = q.eq("student_id", params.student_id);
      if (params?.class_id) q = q.eq("class_id", params.class_id);
      const { data } = await q.order("year", { ascending: false }).order("month", { ascending: false });
      return (data ?? []) as AttendanceSummary[];
    },
    enabled: !!tenantId,
  });
}

export function useMarkAttendance() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (records: Array<{ student_id: string; class_id: string; attendance_date: string; status: string; check_in_time?: string; notes?: string }>) => {
      if (!tenantId) throw new Error("No tenant");
      const withTenant = records.map((r) => ({ ...r, tenant_id: tenantId }));
      const { error } = await (supabase.from("attendance_records") as unknown as { upsert: (data: Record<string, unknown>[], options: Record<string, unknown>) => Promise<{ error: unknown }> }).upsert(withTenant as Record<string, unknown>[], { onConflict: "tenant_id,student_id,class_id,attendance_date" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance_records"] }); qc.invalidateQueries({ queryKey: ["attendance_summary"] }); toast.success("Attendance saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAttendanceStats() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["attendance_stats", tenantId, today],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data } = await supabase.from("attendance_records").select("status").eq("tenant_id", tenantId).eq("attendance_date", today).is("deleted_at", null);
      const records = (data ?? []) as Array<{ status: string }>;
      const total = records.length;
      const present = records.filter((r) => r.status === "present" || r.status === "late").length;
      const absent = records.filter((r) => r.status === "absent").length;
      const late = records.filter((r) => r.status === "late").length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      return { total, present, absent, late, rate };
    },
    enabled: !!tenantId,
  });
}
