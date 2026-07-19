import { z } from 'zod';

export const courseFormSchema = z.object({
  name: z.string().min(1, 'اسم الدورة مطلوب').max(200),
  code: z.string().min(1, 'رمز الدورة مطلوب').max(20),
  description: z.string().optional(),
  program_id: z.string().uuid().optional().or(z.literal('')),
  department_id: z.string().uuid().optional().or(z.literal('')),
  instructor_id: z.string().uuid().optional().or(z.literal('')),
  academic_level: z.enum(['beginner', 'elementary', 'intermediate', 'advanced', 'professional', 'expert']).default('beginner'),
  status: z.enum(['draft', 'published', 'active', 'completed', 'cancelled', 'archived']).default('draft'),
  credits: z.coerce.number().min(0).optional(),
  duration_hours: z.coerce.number().min(0).optional(),
  max_students: z.coerce.number().min(0).optional(),
  min_students: z.coerce.number().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  currency: z.string().max(3).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  syllabus: z.string().optional(),
  objectives: z.string().optional(),
  materials: z.string().optional(),
  is_online: z.boolean().optional(),
  online_link: z.string().optional(),
  location: z.string().optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
