import type { Json } from "@/lib/types/database";

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'refunded' | 'cancelled' | 'failed';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'online' | 'check' | 'mobile_payment' | 'other';

export interface Invoice {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  student_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface InvoiceFormData {
  student_id: string;
  invoice_number: string;
  status?: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  notes?: string;
  terms?: string;
}

export interface InvoiceItem {
  id: string;
  tenant_id: string;
  invoice_id: string;
  fee_structure_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface InvoiceItemFormData {
  invoice_id: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  tax_rate?: number;
  discount_amount?: number;
}

export interface Payment {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  branch_id: string | null;
  student_id: string;
  invoice_id: string | null;
  payment_number: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_date: string;
  status: PaymentStatus;
  reference_number: string | null;
  transaction_id: string | null;
  notes: string | null;
  receipt_url: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface PaymentFormData {
  student_id: string;
  invoice_id?: string;
  payment_number: string;
  amount: number;
  currency?: string;
  payment_method: PaymentMethod;
  payment_date: string;
  status?: PaymentStatus;
  reference_number?: string;
  notes?: string;
}

export interface Scholarship {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  name: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  value_type: string;
  max_recipients: number | null;
  current_recipients: number;
  academic_year_id: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface ScholarshipFormData {
  name: string;
  code: string;
  description?: string;
  type?: string;
  value: number;
  value_type?: string;
  max_recipients?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface Discount {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  name: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  min_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  applicable_fees: string[];
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface DiscountFormData {
  name: string;
  code: string;
  description?: string;
  type?: string;
  value: number;
  min_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  payment_id: string | null;
  type: string;
  category: string;
  subcategory: string | null;
  amount: number;
  currency: string;
  description: string | null;
  reference: string | null;
  transaction_date: string;
  is_reconciled: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface FinanceStats {
  total_revenue: number;
  total_collected: number;
  total_outstanding: number;
  total_refunded: number;
  invoice_count: number;
  payment_count: number;
  collection_rate: number;
}

export interface FinanceFilters {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
