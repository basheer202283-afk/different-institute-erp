import { z } from 'zod';

export const attendanceFormSchema = z.object({
  student_id: z.string().min(1, 'الطالبة مطلوبة'),
  class_id: z.string().min(1, 'الفصل مطلوب'),
  attendance_date: z.string().min(1, 'التاريخ مطلوب'),
  status: z.enum(['present', 'absent', 'late', 'excused', 'left_early', 'holiday']),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  late_minutes: z.coerce.number().min(0).optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

export const bulkAttendanceSchema = z.object({
  class_id: z.string().min(1, 'الفصل مطلوب'),
  attendance_date: z.string().min(1, 'التاريخ مطلوب'),
  records: z.array(z.object({
    student_id: z.string(),
    status: z.enum(['present', 'absent', 'late', 'excused', 'left_early', 'holiday']),
    check_in_time: z.string().optional(),
    notes: z.string().optional(),
  })),
});

export type BulkAttendanceValues = z.infer<typeof bulkAttendanceSchema>;
