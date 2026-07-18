"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useDashboardStats() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();

  return useQuery({
    queryKey: ["dashboard", "stats", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const studentsRes = await supabase.from("students").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).is("deleted_at", null);
      const coursesRes = await supabase.from("courses").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).is("deleted_at", null);
      const classesRes = await supabase.from("classes").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "active").is("deleted_at", null);
      const invoicesRes = await supabase.from("invoices").select("total_amount, paid_amount, status").eq("tenant_id", tenantId).is("deleted_at", null);
      const paymentsRes = await supabase.from("payments").select("amount, payment_date").eq("tenant_id", tenantId).eq("status", "paid").is("deleted_at", null);
      const attendanceRes = await supabase.from("attendance_records").select("status").eq("tenant_id", tenantId).is("deleted_at", null);
      const tasksRes = await supabase.from("tasks").select("id, status, priority, title, due_date").eq("tenant_id", tenantId).is("deleted_at", null).order("due_date", { ascending: true }).limit(10);
      const announcementsRes = await supabase.from("announcements").select("id, title, type, published_at, is_pinned").eq("tenant_id", tenantId).eq("is_published", true).is("deleted_at", null).order("published_at", { ascending: false }).limit(5);
      const eventsRes = await supabase.from("calendar_events").select("id, title, type, start_time, end_time, location").eq("tenant_id", tenantId).gte("start_time", new Date().toISOString()).is("deleted_at", null).order("start_time", { ascending: true }).limit(8);

      const totalStudents = studentsRes.count ?? 0;
      const totalCourses = coursesRes.count ?? 0;
      const activeClasses = classesRes.count ?? 0;

      const invoices = (invoicesRes.data ?? []) as Array<{ total_amount: number | null; paid_amount: number | null; status: string }>;
      const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount ?? 0), 0);
      const paidRevenue = invoices.reduce((sum, inv) => sum + (inv.paid_amount ?? 0), 0);
      const outstanding = totalRevenue - paidRevenue;

      const payments = (paymentsRes.data ?? []) as Array<{ amount: number | null; payment_date: string }>;
      const monthlyPayments = payments
        .filter((p) => {
          const d = new Date(p.payment_date);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, p) => sum + (p.amount ?? 0), 0);

      const attendance = (attendanceRes.data ?? []) as Array<{ status: string }>;
      const totalAtt = attendance.length;
      const presentAtt = attendance.filter((a) => a.status === "present" || a.status === "late").length;
      const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

      const activeStudents = await supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .in("status", ["active", "enrolled"])
        .is("deleted_at", null);

      const instructors = await supabase
        .from("instructors")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .is("deleted_at", null);

      const monthlyRevenue: { month: string; revenue: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString("default", { month: "short" });
        const monthPayments = payments
          .filter((p) => {
            const pd = new Date(p.payment_date);
            return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
          })
          .reduce((sum, p) => sum + (p.amount ?? 0), 0);
        monthlyRevenue.push({ month: monthName, revenue: monthPayments });
      }

      return {
        totalStudents,
        activeStudents: activeStudents.count ?? 0,
        totalCourses,
        activeClasses,
        totalInstructors: instructors.count ?? 0,
        totalRevenue,
        paidRevenue,
        outstanding,
        monthlyPayments,
        attendanceRate,
        totalAtt,
        presentAtt,
        tasks: (tasksRes.data ?? []) as Array<{ id: string; status: string; priority: string; title: string; due_date: string | null }>,
        announcements: (announcementsRes.data ?? []) as Array<{ id: string; title: string; type: string; published_at: string | null; is_pinned: boolean }>,
        events: (eventsRes.data ?? []) as Array<{ id: string; title: string; type: string; start_time: string; end_time: string; location: string | null }>,
        monthlyRevenue,
        invoices,
      };
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
  });
}
