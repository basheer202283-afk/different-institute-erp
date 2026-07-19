import { z } from 'zod';

export const trainerFormSchema = z.object({
  first_name: z.string().min(1, 'الاسم الأول مطلوب').max(100),
  last_name: z.string().min(1, 'اسم العائلة مطلوب').max(100),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  employee_number: z.string().max(50).optional(),
  specialization: z.string().max(200).optional(),
  qualifications: z.string().optional(),
  experience_years: z.coerce.number().min(0).optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
  bio: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

export type TrainerFormValues = z.infer<typeof trainerFormSchema>;
