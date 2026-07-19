"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type { Employee, EmployeeFormData, EmployeeFilters, EmployeeStats, Department, LeaveRequest, PaginatedResponse } from "@/lib/types/employee";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function useEmployees(filters: EmployeeFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { search, status, department_id, contract_type, page = 1, pageSize = 10 } = filters;

  return useQuery({
    queryKey: ["employees", organization?.id, search, status, department_id, contract_type, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Employee>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase.from("employees").select("*", { count: "exact" }).eq("organization_id", organization.id).is("deleted_at", null).order("created_at", { ascending: false });
      if (search) query = query.or(`first_name_ar.ilike.%${search}%,last_name_ar.ilike.%${search}%,employee_number.ilike.%${search}%,email.ilike.%${search}%`);
      if (status) query = query.eq("status", status);
      if (department_id) query = query.eq("department_id", department_id);
      if (contract_type) query = query.eq("contract_type", contract_type);

      const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;

      return { data: (data ?? []) as Employee[], count: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) };
    },
    enabled: !!organization,
  });
}

export function useEmployee(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["employees", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Employee;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      if (!organization) throw new Error("No organization");
      const empNumber = `EMP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const { data: emp, error } = await (supabase.from("employees") as any).insert({
        ...data, organization_id: organization.id, employee_number: empNumber,
        email: data.email || null, phone: data.phone || null,
        department_id: data.department_id || null, position_id: data.position_id || null,
        hire_date: data.hire_date || new Date().toISOString().split("T")[0],
        salary: data.salary || 0, currency: "YER",
      }).select().single();
      if (error) throw error;
      return emp as Employee;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); queryClient.invalidateQueries({ queryKey: ["employee-stats"] }); toast.success("تم إنشاء الموظف بنجاح"); },
    onError: (e: Error) => { toast.error(`خطأ: ${e.message}`); },
  });
}

export function useUpdateEmployee() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmployeeFormData> }) => {
      const { data: emp, error } = await (supabase.from("employees") as any).update(data).eq("id", id).select().single();
      if (error) throw error;
      return emp as Employee;
    },
    onSuccess: (_, v) => { queryClient.invalidateQueries({ queryKey: ["employees"] }); queryClient.invalidateQueries({ queryKey: ["employees", v.id] }); toast.success("تم تحديث الموظف بنجاح"); },
    onError: (e: Error) => { toast.error(`خطأ: ${e.message}`); },
  });
}

export function useDeleteEmployee() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("employees") as any).update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); toast.success("تم حذف الموظف بنجاح"); },
  });
}

export function useEmployeeStats() {
  const { organization } = useTenant();
  const supabase = createClient();
  return useQuery({
    queryKey: ["employee-stats", organization?.id],
    queryFn: async (): Promise<EmployeeStats> => {
      if (!organization) return { total: 0, active: 0, on_leave: 0, total_salary: 0 };
      const { data } = await supabase.from("employees").select("status, salary").eq("organization_id", organization.id).is("deleted_at", null);
      const rows = (data ?? []) as Array<{ status: string; salary: number }>;
      const stats: EmployeeStats = { total: rows.length, active: 0, on_leave: 0, total_salary: 0 };
      for (const r of rows) {
        if (r.status === "active") stats.active++;
        if (r.status === "on_leave") stats.on_leave++;
        stats.total_salary += Number(r.salary) || 0;
      }
      return stats;
    },
    enabled: !!organization,
  });
}

// Departments
export function useDepartments() {
  const { organization } = useTenant();
  const supabase = createClient();
  return useQuery({
    queryKey: ["departments", organization?.id],
    queryFn: async (): Promise<Department[]> => {
      if (!organization) return [];
      const { data, error } = await supabase.from("departments").select("*").eq("organization_id", organization.id).is("deleted_at", null).order("name");
      if (error) throw error;
      return (data ?? []) as Department[];
    },
    enabled: !!organization,
  });
}

export function useCreateDepartment() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; name_ar?: string; code: string; description?: string }) => {
      if (!organization) throw new Error("No organization");
      const { data: dept, error } = await (supabase.from("departments") as any).insert({ ...data, organization_id: organization.id, is_active: true }).select().single();
      if (error) throw error;
      return dept as Department;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["departments"] }); toast.success("تم إنشاء القسم بنجاح"); },
  });
}

// Leave Requests
export function useLeaveRequests(employeeId?: string) {
  const { organization } = useTenant();
  const supabase = createClient();
  return useQuery({
    queryKey: ["leave-requests", organization?.id, employeeId],
    queryFn: async (): Promise<LeaveRequest[]> => {
      if (!organization) return [];
      let query = supabase.from("leave_requests").select("*").eq("organization_id", organization.id).is("deleted_at", null).order("created_at", { ascending: false });
      if (employeeId) query = query.eq("employee_id", employeeId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as LeaveRequest[];
    },
    enabled: !!organization,
  });
}

export function useCreateLeaveRequest() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { employee_id: string; leave_type: string; start_date: string; end_date: string; reason?: string; notes?: string }) => {
      if (!organization) throw new Error("No organization");
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const { data: lr, error } = await (supabase.from("leave_requests") as any).insert({ ...data, organization_id: organization.id, days, status: "pending" }).select().single();
      if (error) throw error;
      return lr as LeaveRequest;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leave-requests"] }); toast.success("تم إرسال طلب الإجازة"); },
  });
}

export function useApproveLeaveRequest() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, reason }: { id: string; action: "approve" | "reject"; reason?: string }) => {
      const updateData: Record<string, unknown> = { status: action === "approve" ? "approved" : "rejected", approved_at: new Date().toISOString() };
      if (action === "reject") updateData.rejection_reason = reason;
      const { error } = await (supabase.from("leave_requests") as any).update(updateData).eq("id", id);
      if (error) throw error;
      return { id, action };
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast.success(v.action === "approve" ? "تمت الموافقة على الإجازة" : "تم رفض طلب الإجازة");
    },
  });
}
