import { z } from "zod";

export const certificateFormSchema = z.object({
  student_id: z.string().uuid("الرجاء اختيار الطالبة"),
  course_id: z.string().uuid().optional().or(z.literal("")),
  enrollment_id: z.string().uuid().optional().or(z.literal("")),
  template_id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(1, "عنوان الشهادة مطلوب").max(300),
  title_ar: z.string().max(300).optional(),
  description: z.string().optional(),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
  status: z.enum(["draft", "active"]).default("draft"),
  grade: z.string().max(10).optional(),
  score: z.coerce.number().min(0).max(100).optional(),
  hours_completed: z.coerce.number().min(0).optional(),
});

export type CertificateFormValues = z.infer<typeof certificateFormSchema>;

export const certificateRevokeSchema = z.object({
  reason: z.string().min(1, "سبب الإلغاء مطلوب"),
});

export type CertificateRevokeValues = z.infer<typeof certificateRevokeSchema>;

export const certificateTemplateSchema = z.object({
  name: z.string().min(1, "اسم القالب مطلوب").max(200),
  name_ar: z.string().max(200).optional(),
  description: z.string().optional(),
  template_type: z.enum(["course_completion", "achievement", "participation", "custom"]).default("course_completion"),
  layout_html: z.string().optional(),
  is_default: z.boolean().default(false),
});

export type CertificateTemplateValues = z.infer<typeof certificateTemplateSchema>;
