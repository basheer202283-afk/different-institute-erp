import { z } from 'zod';

export const studentFormSchema = z.object({
  first_name_ar: z.string().min(1, 'الاسم الأول بالعربي مطلوب').max(100),
  last_name_ar: z.string().min(1, 'اسم العائلة بالعربي مrequired').max(100),
  first_name_en: z.string().max(100).optional(),
  last_name_en: z.string().max(100).optional(),
  national_id: z.string().max(50).optional(),
  registration_number: z.string().max(50).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  nationality: z.string().max(100).optional(),
  mobile: z.string().max(50).optional(),
  alternative_mobile: z.string().max(50).optional(),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  status: z.enum(['active', 'pending', 'suspended', 'graduated', 'withdrawn']).default('pending'),
  guardian_name: z.string().max(200).optional(),
  guardian_phone: z.string().max(50).optional(),
  guardian_whatsapp: z.string().max(50).optional(),
  guardian_email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  guardian_relationship: z.string().max(100).optional(),
  guardian_address: z.string().optional(),
  emergency_contact_name: z.string().max(200).optional(),
  emergency_contact_phone: z.string().max(50).optional(),
  medical_conditions: z.string().optional(),
  allergies: z.string().optional(),
  blood_group: z.string().max(10).optional(),
  notes: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
