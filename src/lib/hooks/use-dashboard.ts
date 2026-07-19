"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";

export interface DashboardStats {
  totalStudents: number;
  totalTrainers: number;
  totalCourses: number;
  totalRevenue: number;
  totalAttendance: number;
  recentStudents: Array<{
    id: string;
    first_name_ar: string | null;
    last_name_ar: string | null;
    student_number: string;
    status: string;
    created_at: string;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    payment_date: string;
    status: string;
  }>;
}

export function useDashboardStats() {
  const { organization, branch } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["dashboard-stats", organization?.id, branch?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!organization) {
        return {
          totalStudents: 0,
          totalTrainers: 0,
          totalCourses: 0,
          totalRevenue: 0,
          totalAttendance: 0,
          recentStudents: [],
          recentPayments: [],
        };
      }

      // Fetch students count
      const { count: totalStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      // Fetch trainers count
      const { count: totalTrainers } = await supabase
        .from("trainers")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      // Fetch courses count
      const { count: totalCourses } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      // Fetch total revenue from payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount")
        .eq("organization_id", organization.id)
        .eq("status", "paid")
        .is("deleted_at", null);

      const payments = (paymentsData ?? []) as Array<{ amount: number | null }>;
      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Fetch attendance count for today
      const today = new Date().toISOString().split("T")[0];
      const { count: totalAttendance } = await supabase
        .from("attendance_records")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .eq("attendance_date", today)
        .is("deleted_at", null);

      // Fetch recent students
      const { data: recentStudentsData } = await supabase
        .from("students")
        .select("id, first_name_ar, last_name_ar, student_number, status, created_at")
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5);

      const recentStudents = (recentStudentsData ?? []) as DashboardStats["recentStudents"];

      // Fetch recent payments
      const { data: recentPaymentsData } = await supabase
        .from("payments")
        .select("id, amount, payment_date, status")
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5);

      const recentPayments = (recentPaymentsData ?? []) as DashboardStats["recentPayments"];

      return {
        totalStudents: totalStudents || 0,
        totalTrainers: totalTrainers || 0,
        totalCourses: totalCourses || 0,
        totalRevenue: totalRevenue,
        totalAttendance: totalAttendance || 0,
        recentStudents: recentStudents,
        recentPayments: recentPayments,
      };
    },
    enabled: !!organization,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
