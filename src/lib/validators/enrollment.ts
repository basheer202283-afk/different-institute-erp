import { z } from "zod";

// ============================================================
// Enrollment Form Schema
// ============================================================

export const enrollmentFormSchema = z.object({
  student_id: z.string().uuid("الرجاء اختيار الطالبة"),
  course_id: z.string().uuid("الرجاء اختيار الدورة"),
  class_id: z.string().uuid().optional().or(z.literal("")),
  semester_id: z.string().uuid().optional().or(z.literal("")),
  enrollment_date: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z
    .enum([
      "pending",
      "approved",
      "active",
      "completed",
      "cancelled",
      "rejected",
      "transferred",
      "deferred",
      "expelled",
    ])
    .default("pending"),
  payment_status: z
    .enum(["pending", "partial", "paid", "refunded", "waived"])
    .default("pending"),
  total_fees: z.coerce.number().min(0, "الرسوم يجب أن تكون أكبر من أو تساوي صفر").optional(),
  paid_amount: z.coerce.number().min(0).optional(),
  discount_amount: z.coerce.number().min(0).optional(),
  discount_reason: z.string().optional(),
  notes: z.string().optional(),
});

export type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

// ============================================================
// Enrollment Transfer Schema
// ============================================================

export const enrollmentTransferSchema = z.object({
  target_class_id: z.string().uuid("الرجاء اختيار الفصل المستهدف"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type EnrollmentTransferValues = z.infer<typeof enrollmentTransferSchema>;

// ============================================================
// Enrollment Cancellation Schema
// ============================================================

export const enrollmentCancellationSchema = z.object({
  reason: z.string().min(1, "سبب الإلغاء مطلوب"),
  refund_amount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

export type EnrollmentCancellationValues = z.infer<typeof enrollmentCancellationSchema>;

// ============================================================
// Waiting List Schema
// ============================================================

export const waitingListFormSchema = z.object({
  student_id: z.string().uuid("الرجاء اختيار الطالبة"),
  course_id: z.string().uuid("الرجاء اختيار الدورة"),
  priority: z.coerce.number().min(1).max(10).default(5),
  notes: z.string().optional(),
});

export type WaitingListFormValues = z.infer<typeof waitingListFormSchema>;

// ============================================================
// Batch Form Schema
// ============================================================

export const batchFormSchema = z.object({
  course_id: z.string().uuid("الرجاء اختيار الدورة"),
  class_id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(1, "اسم الدفعة مطلوب").max(200),
  code: z.string().min(1, "رمز الدفعة مطلوب").max(20),
  description: z.string().optional(),
  max_students: z.coerce.number().min(1, "الحد الأقصى للطالبات يجب أن يكون على الأقل 1").optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z
    .enum(["planned", "active", "completed", "cancelled"])
    .default("planned"),
  location: z.string().optional(),
  instructor_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type BatchFormValues = z.infer<typeof batchFormSchema>;

// ============================================================
// Approval Schema
// ============================================================

export const approvalSchema = z.object({
  action: z.enum(["approve", "reject"]),
  review_notes: z.string().optional(),
});

export type ApprovalValues = z.infer<typeof approvalSchema>;
