import { z } from "zod";

// Finance validators
export const invoiceSchema = z.object({
  student_id: z.string().uuid("Select a student"),
  invoice_number: z.string().min(1, "Invoice number required").max(50),
  status: z.enum(["draft", "sent", "viewed", "partial", "paid", "overdue", "cancelled", "refunded"]),
  issue_date: z.string().min(1, "Issue date required"),
  due_date: z.string().min(1, "Due date required"),
  subtotal: z.coerce.number().min(0).default(0),
  tax_amount: z.coerce.number().min(0).default(0),
  discount_amount: z.coerce.number().min(0).default(0),
  total_amount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().or(z.literal("")),
  terms: z.string().optional().or(z.literal("")),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const paymentSchema = z.object({
  student_id: z.string().uuid("Select a student"),
  invoice_id: z.string().uuid().optional().or(z.literal("")),
  payment_number: z.string().min(1, "Payment number required").max(50),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  payment_method: z.enum(["cash", "bank_transfer", "credit_card", "debit_card", "online", "check", "mobile_payment", "other"]),
  payment_date: z.string().min(1, "Payment date required"),
  status: z.enum(["pending", "partial", "paid", "overdue", "refunded", "cancelled", "failed"]),
  reference_number: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export const feeStructureSchema = z.object({
  name: z.string().min(1, "Name required").max(200),
  code: z.string().min(1, "Code required").max(20),
  description: z.string().optional().or(z.literal("")),
  academic_year_id: z.string().uuid().optional().or(z.literal("")),
  program_id: z.string().uuid().optional().or(z.literal("")),
  amount: z.coerce.number().min(0),
  fee_type: z.string().min(1, "Fee type required"),
  is_mandatory: z.boolean().default(true),
  is_active: z.boolean().default(true),
  due_days: z.coerce.number().min(0).default(30),
  late_fee_amount: z.coerce.number().min(0).default(0),
});

export type FeeStructureFormData = z.infer<typeof feeStructureSchema>;

export const scholarshipSchema = z.object({
  name: z.string().min(1, "Name required").max(200),
  code: z.string().min(1, "Code required").max(20),
  description: z.string().optional().or(z.literal("")),
  type: z.string().min(1, "Type required"),
  value: z.coerce.number().min(0),
  value_type: z.string().min(1, "Value type required"),
  max_recipients: z.coerce.number().min(0).optional(),
  is_active: z.boolean().default(true),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
});

export type ScholarshipFormData = z.infer<typeof scholarshipSchema>;

// CRM validators
export const leadSchema = z.object({
  name: z.string().min(1, "Name required").max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  source: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost", "dormant"]),
  notes: z.string().optional().or(z.literal("")),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// Marketing validators
export const campaignSchema = z.object({
  name: z.string().min(1, "Name required").max(200),
  type: z.enum(["email", "sms", "social_media", "event", "referral", "advertisement", "other"]),
  status: z.enum(["draft", "scheduled", "active", "paused", "completed", "cancelled"]),
  description: z.string().optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().min(0).optional(),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

// Library validators
export const bookSchema = z.object({
  title: z.string().min(1, "Title required").max(500),
  author: z.string().min(1, "Author required").max(200),
  isbn: z.string().max(20).optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  publisher: z.string().max(200).optional().or(z.literal("")),
  publish_year: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().min(0).default(1),
  available: z.coerce.number().min(0).default(1),
  location: z.string().max(200).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type BookFormData = z.infer<typeof bookSchema>;

// Task validators
export const taskSchema = z.object({
  title: z.string().min(1, "Title required").max(500),
  description: z.string().optional().or(z.literal("")),
  assigned_to: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["todo", "in_progress", "review", "completed", "cancelled", "on_hold"]),
  priority: z.enum(["low", "medium", "high", "urgent", "critical"]),
  due_date: z.string().optional().or(z.literal("")),
  estimated_hours: z.coerce.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// Document validators
export const documentSchema = z.object({
  name: z.string().min(1, "Name required").max(500),
  type: z.enum(["contract", "agreement", "certificate", "receipt", "invoice", "id_document", "academic_record", "medical", "other"]),
  description: z.string().optional().or(z.literal("")),
  is_public: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

// Calendar validators
export const calendarEventSchema = z.object({
  title: z.string().min(1, "Title required").max(500),
  description: z.string().optional().or(z.literal("")),
  type: z.enum(["class", "exam", "meeting", "holiday", "workshop", "seminar", "deadline", "other"]),
  start_time: z.string().min(1, "Start time required"),
  end_time: z.string().min(1, "End time required"),
  location: z.string().max(500).optional().or(z.literal("")),
  all_day: z.boolean().default(false),
  is_public: z.boolean().default(true),
  color: z.string().max(7).optional().or(z.literal("")),
});

export type CalendarEventFormData = z.infer<typeof calendarEventSchema>;
