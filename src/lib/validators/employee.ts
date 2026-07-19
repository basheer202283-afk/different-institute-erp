import { z } from "zod";

export const employeeFormSchema = z.object({
  first_name_ar: z.string().min(1, "الاسم بالعربية مطلوب").max(100),
  last_name_ar: z.string().min(1, "اسم العائلة بالعربية مطلوب").max(100),
  first_name_en: z.string().max(100).optional(),
  last_name_en: z.string().max(100).optional(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  national_id: z.string().max(30).optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().max(100).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  department_id: z.string().uuid().optional().or(z.literal("")),
  position_id: z.string().uuid().optional().or(z.literal("")),
  hire_date: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended", "terminated", "on_leave"]).default("active"),
  contract_type: z.enum(["full_time", "part_time", "temporary", "internship"]).default("full_time"),
  salary: z.coerce.number().min(0).optional(),
  emergency_contact_name: z.string().max(200).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  notes: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const departmentFormSchema = z.object({
  name: z.string().min(1, "اسم القسم مطلوب").max(200),
  name_ar: z.string().max(200).optional(),
  code: z.string().min(1, "رمز القسم مطلوب").max(20),
  description: z.string().optional(),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export const leaveRequestSchema = z.object({
  leave_type: z.string().min(1, "نوع الإجازة مطلوب"),
  start_date: z.string().min(1, "تاريخ البداية مطلوب"),
  end_date: z.string().min(1, "تاريخ النهاية مطلوب"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type LeaveRequestValues = z.infer<typeof leaveRequestSchema>;
