import { z } from 'zod';

export const invoiceFormSchema = z.object({
  student_id: z.string().min(1, 'الطالبة مطلوبة'),
  invoice_number: z.string().min(1, 'رقم الفاتورة مطلوب').max(50),
  status: z.enum(['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded']).default('draft'),
  issue_date: z.string().min(1, 'تاريخ الإصدار مطلوب'),
  due_date: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),
  subtotal: z.coerce.number().min(0).optional(),
  tax_amount: z.coerce.number().min(0).optional(),
  discount_amount: z.coerce.number().min(0).optional(),
  total_amount: z.coerce.number().min(0).optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const paymentFormSchema = z.object({
  student_id: z.string().min(1, 'الطالبة مطلوبة'),
  invoice_id: z.string().uuid().optional().or(z.literal('')),
  payment_number: z.string().min(1, 'رقم الدفعة مطلوب').max(50),
  amount: z.coerce.number().min(0.01, 'المبلغ مطلوب'),
  currency: z.string().max(3).optional(),
  payment_method: z.enum(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'online', 'check', 'mobile_payment', 'other']),
  payment_date: z.string().min(1, 'تاريخ الدفع مطلوب'),
  status: z.enum(['pending', 'partial', 'paid', 'overdue', 'refunded', 'cancelled', 'failed']).default('pending'),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export const scholarshipFormSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(200),
  code: z.string().min(1, 'الرمز مطلوب').max(20),
  description: z.string().optional(),
  type: z.string().optional(),
  value: z.coerce.number().min(0, 'القيمة مطلوبة'),
  value_type: z.string().optional(),
  max_recipients: z.coerce.number().min(0).optional(),
  is_active: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type ScholarshipFormValues = z.infer<typeof scholarshipFormSchema>;

export const discountFormSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(200),
  code: z.string().min(1, 'الرمز مطلوب').max(20),
  description: z.string().optional(),
  type: z.string().optional(),
  value: z.coerce.number().min(0, 'القيمة مطلوبة'),
  min_amount: z.coerce.number().min(0).optional(),
  max_discount: z.coerce.number().min(0).optional(),
  usage_limit: z.coerce.number().min(0).optional(),
  is_active: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type DiscountFormValues = z.infer<typeof discountFormSchema>;
