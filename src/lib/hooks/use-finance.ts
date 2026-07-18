"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import type { InvoiceFormData, PaymentFormData, FeeStructureFormData, ScholarshipFormData } from "@/lib/validators/phase3";

type Invoice = { id: string; tenant_id: string; student_id: string; invoice_number: string; status: string; issue_date: string; due_date: string; subtotal: number; tax_amount: number; discount_amount: number; total_amount: number; paid_amount: number; balance: number; currency: string; notes: string | null; terms: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type Payment = { id: string; tenant_id: string; student_id: string; invoice_id: string | null; payment_number: string; amount: number; currency: string; payment_method: string; payment_date: string; status: string; reference_number: string | null; transaction_id: string | null; notes: string | null; receipt_url: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type FeeStructure = { id: string; tenant_id: string; name: string; code: string; description: string | null; academic_year_id: string | null; program_id: string | null; amount: number; currency: string; fee_type: string; is_mandatory: boolean; is_active: boolean; due_days: number; late_fee_amount: number; late_fee_percentage: number; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type Scholarship = { id: string; tenant_id: string; name: string; code: string; description: string | null; type: string; value: number; value_type: string; max_recipients: number | null; current_recipients: number; academic_year_id: string | null; criteria: unknown; is_active: boolean; start_date: string | null; end_date: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type Transaction = { id: string; tenant_id: string; payment_id: string | null; type: string; category: string; subcategory: string | null; amount: number; currency: string; description: string | null; reference: string | null; transaction_date: string; is_reconciled: boolean; reconciled_at: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type Discount = { id: string; tenant_id: string; name: string; code: string; description: string | null; type: string; value: number; min_amount: number; max_discount: number | null; usage_limit: number | null; used_count: number; is_active: boolean; start_date: string | null; end_date: string | null; applicable_fees: string[]; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };

// Invoices
export function useInvoices(params?: { search?: string; status?: string }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["invoices", tenantId, params?.search, params?.status],
    queryFn: async () => {
      if (!tenantId) return [] as Invoice[];
      let q = supabase.from("invoices").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.search) q = q.or(`invoice_number.ilike.%${params.search}%`);
      if (params?.status && params.status !== "all") q = q.eq("status", params.status);
      const { data } = await q.order("created_at", { ascending: false });
      return (data ?? []) as Invoice[];
    },
    enabled: !!tenantId,
  });
}

export function useInvoice(id: string) {
  const supabase = createClient();
  return useQuery({ queryKey: ["invoices", id], queryFn: async () => { const { data } = await supabase.from("invoices").select("*").eq("id", id).single(); return data as Invoice | null; }, enabled: !!id });
}

export function useCreateInvoice() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: InvoiceFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("invoices") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success("Invoice created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateInvoice() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InvoiceFormData> }) => { const { error } = await (supabase.from("invoices") as unknown as { update: (data: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } }).update(data as Record<string, unknown>).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success("Invoice updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Payments
export function usePayments(params?: { search?: string; status?: string }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["payments", tenantId, params?.search, params?.status],
    queryFn: async () => {
      if (!tenantId) return [] as Payment[];
      let q = supabase.from("payments").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.search) q = q.or(`payment_number.ilike.%${params.search}%`);
      if (params?.status && params.status !== "all") q = q.eq("status", params.status);
      const { data } = await q.order("created_at", { ascending: false });
      return (data ?? []) as Payment[];
    },
    enabled: !!tenantId,
  });
}

export function useCreatePayment() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: PaymentFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("payments") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payments"] }); qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success("Payment recorded"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Fee Structures
export function useFeeStructures() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["fee_structures", tenantId],
    queryFn: async () => { if (!tenantId) return [] as FeeStructure[]; const { data } = await supabase.from("fee_structures").select("*").eq("tenant_id", tenantId).is("deleted_at", null).order("name"); return (data ?? []) as FeeStructure[]; },
    enabled: !!tenantId,
  });
}

export function useCreateFeeStructure() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: FeeStructureFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("fee_structures") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fee_structures"] }); toast.success("Fee structure created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Scholarships
export function useScholarships() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["scholarships", tenantId],
    queryFn: async () => { if (!tenantId) return [] as Scholarship[]; const { data } = await supabase.from("scholarships").select("*").eq("tenant_id", tenantId).is("deleted_at", null).order("name"); return (data ?? []) as Scholarship[]; },
    enabled: !!tenantId,
  });
}

export function useCreateScholarship() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: ScholarshipFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("scholarships") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scholarships"] }); toast.success("Scholarship created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Transactions
export function useTransactions() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["transactions", tenantId],
    queryFn: async () => { if (!tenantId) return [] as Transaction[]; const { data } = await supabase.from("transactions").select("*").eq("tenant_id", tenantId).is("deleted_at", null).order("transaction_date", { ascending: false }).limit(100); return (data ?? []) as Transaction[]; },
    enabled: !!tenantId,
  });
}

// Discounts
export function useDiscounts() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["discounts", tenantId],
    queryFn: async () => { if (!tenantId) return [] as Discount[]; const { data } = await supabase.from("discounts").select("*").eq("tenant_id", tenantId).is("deleted_at", null).order("name"); return (data ?? []) as Discount[]; },
    enabled: !!tenantId,
  });
}

// Finance Stats
export function useFinanceStats() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["finance_stats", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const [invoices, payments] = await Promise.all([
        supabase.from("invoices").select("total_amount, paid_amount, status").eq("tenant_id", tenantId).is("deleted_at", null),
        supabase.from("payments").select("amount, payment_date, status").eq("tenant_id", tenantId).is("deleted_at", null),
      ]);
      const inv = (invoices.data ?? []) as Array<{ total_amount: number; paid_amount: number; status: string }>;
      const pay = (payments.data ?? []) as Array<{ amount: number; payment_date: string; status: string }>;
      const totalRevenue = inv.reduce((s, i) => s + (i.total_amount ?? 0), 0);
      const totalPaid = inv.reduce((s, i) => s + (i.paid_amount ?? 0), 0);
      const outstanding = totalRevenue - totalPaid;
      const totalPayments = pay.filter((p) => p.status === "paid").reduce((s, p) => s + (p.amount ?? 0), 0);
      const thisMonth = pay.filter((p) => { const d = new Date(p.payment_date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).reduce((s, p) => s + (p.amount ?? 0), 0);
      return { totalRevenue, totalPaid, outstanding, totalPayments, thisMonth, invoiceCount: inv.length, paymentCount: pay.length, overdueCount: inv.filter((i) => i.status === "overdue").length };
    },
    enabled: !!tenantId,
  });
}
