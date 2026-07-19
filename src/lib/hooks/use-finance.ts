"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type { 
  Invoice, InvoiceFormData, Payment, PaymentFormData, 
  Scholarship, ScholarshipFormData, Discount, DiscountFormData,
  FinanceStats, FinanceFilters, PaginatedResponse 
} from "@/lib/types/finance";
import { toast } from "sonner";

// ============================================================
// INVOICES
// ============================================================

export function useInvoices(filters: FinanceFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { search, status, date_from, date_to, page = 1, pageSize = 10 } = filters;

  return useQuery({
    queryKey: ["invoices", organization?.id, search, status, date_from, date_to, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Invoice>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase
        .from("invoices")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`invoice_number.ilike.%${search}%,notes.ilike.%${search}%`);
      }
      if (status) query = query.eq("status", status);
      if (date_from) query = query.gte("issue_date", date_from);
      if (date_to) query = query.lte("issue_date", date_to);

      const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;

      return {
        data: (data ?? []) as Invoice[],
        count: count ?? 0, page, pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    enabled: !!organization,
  });
}

export function useInvoice(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const { organization } = useTenant();
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      if (!organization) throw new Error("No organization");
      const { data: invoice, error } = await (supabase.from("invoices") as any)
        .insert({ ...data, organization_id: organization.id })
        .select().single();
      if (error) throw error;
      return invoice as Invoice;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["finance-stats"] });
      toast.success("تم إنشاء الفاتورة بنجاح");
    },
    onError: (e: Error) => toast.error(`خطأ: ${e.message}`),
  });
}

export function useUpdateInvoice() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InvoiceFormData> }) => {
      const { data: invoice, error } = await (supabase.from("invoices") as any)
        .update(data).eq("id", id).select().single();
      if (error) throw error;
      return invoice as Invoice;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoices", vars.id] });
      toast.success("تم تحديث الفاتورة بنجاح");
    },
    onError: (e: Error) => toast.error(`خطأ: ${e.message}`),
  });
}

export function useDeleteInvoice() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("invoices") as any)
        .update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("تم حذف الفاتورة بنجاح");
    },
    onError: (e: Error) => toast.error(`خطأ: ${e.message}`),
  });
}

// ============================================================
// PAYMENTS
// ============================================================

export function usePayments(filters: FinanceFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { search, status, date_from, date_to, page = 1, pageSize = 10 } = filters;

  return useQuery({
    queryKey: ["payments", organization?.id, search, status, date_from, date_to, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Payment>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase
        .from("payments")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`payment_number.ilike.%${search}%,reference_number.ilike.%${search}%`);
      }
      if (status) query = query.eq("status", status);
      if (date_from) query = query.gte("payment_date", date_from);
      if (date_to) query = query.lte("payment_date", date_to);

      const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;

      return {
        data: (data ?? []) as Payment[],
        count: count ?? 0, page, pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    enabled: !!organization,
  });
}

export function useCreatePayment() {
  const { organization } = useTenant();
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaymentFormData) => {
      if (!organization) throw new Error("No organization");
      const { data: payment, error } = await (supabase.from("payments") as any)
        .insert({ ...data, organization_id: organization.id })
        .select().single();
      if (error) throw error;
      return payment as Payment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["finance-stats"] });
      toast.success("تم تسجيل الدفعة بنجاح");
    },
    onError: (e: Error) => toast.error(`خطأ: ${e.message}`),
  });
}

// ============================================================
// SCHOLARSHIPS
// ============================================================

export function useScholarships() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["scholarships", organization?.id],
    queryFn: async () => {
      if (!organization) return [] as Scholarship[];
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Scholarship[];
    },
    enabled: !!organization,
  });
}

export function useCreateScholarship() {
  const { organization } = useTenant();
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: ScholarshipFormData) => {
      if (!organization) throw new Error("No organization");
      const { data: scholarship, error } = await (supabase.from("scholarships") as any)
        .insert({ ...data, organization_id: organization.id })
        .select().single();
      if (error) throw error;
      return scholarship as Scholarship;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scholarships"] });
      toast.success("تم إنشاء المنحة بنجاح");
    },
    onError: (e: Error) => toast.error(`خطأ: ${e.message}`),
  });
}

// ============================================================
// DISCOUNTS
// ============================================================

export function useDiscounts() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["discounts", organization?.id],
    queryFn: async () => {
      if (!organization) return [] as Discount[];
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Discount[];
    },
    enabled: !!organization,
  });
}

export function useCreateDiscount() {
  const { organization } = useTenant();
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: DiscountFormData) => {
      if (!organization) throw new Error("No organization");
      const { data: discount, error } = await (supabase.from("discounts") as any)
        .insert({ ...data, organization_id: organization.id })
        .select().single();
      if (error) throw error;
      return discount as Discount;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discounts"] });
      toast.success("تم إنشاء الخصم بنجاح");
    },
    onError: (e: Error) => toast.error(`خطأ: ${e.message}`),
  });
}

// ============================================================
// FINANCE STATS
// ============================================================

export function useFinanceStats() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["finance-stats", organization?.id],
    queryFn: async (): Promise<FinanceStats> => {
      if (!organization) {
        return { total_revenue: 0, total_collected: 0, total_outstanding: 0, total_refunded: 0, invoice_count: 0, payment_count: 0, collection_rate: 0 };
      }

      // Get invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("total_amount, paid_amount, status")
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      const invoiceList = (invoices ?? []) as Array<{ total_amount: number; paid_amount: number; status: string }>;
      const total_revenue = invoiceList.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const total_collected = invoiceList.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
      const total_outstanding = total_revenue - total_collected;

      // Get payments
      const { data: payments } = await supabase
        .from("payments")
        .select("amount, status")
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      const paymentList = (payments ?? []) as Array<{ amount: number; status: string }>;
      const total_refunded = paymentList.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.amount || 0), 0);

      return {
        total_revenue,
        total_collected,
        total_outstanding,
        total_refunded,
        invoice_count: invoiceList.length,
        payment_count: paymentList.length,
        collection_rate: total_revenue > 0 ? Math.round((total_collected / total_revenue) * 100) : 0,
      };
    },
    enabled: !!organization,
  });
}

// ============================================================
// STUDENTS (for invoice/payment forms)
// ============================================================

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
