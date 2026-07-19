import { z } from "zod";

export const examFormSchema = z.object({
  course_id: z.string().uuid().optional().or(z.literal("")),
  class_id: z.string().uuid().optional().or(z.literal("")),
  trainer_id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(1, "عنوان الاختبار مطلوب").max(300),
  title_ar: z.string().max(300).optional(),
  description: z.string().optional(),
  exam_type: z.enum(["quiz", "midterm", "final", "assignment", "practical", "oral"]).default("quiz"),
  status: z.enum(["draft", "scheduled", "in_progress", "completed", "cancelled"]).default("draft"),
  total_marks: z.coerce.number().min(1, "الدرجة الكلية يجب أن تكون أكبر من صفر"),
  passing_marks: z.coerce.number().min(0, "درجة النجاح يجب أن تكون أكبر من أو تساوي صفر"),
  duration_minutes: z.coerce.number().min(1, "المدة يجب أن تكون دقيقة واحدة على الأقل"),
  exam_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().optional(),
  is_online: z.boolean().default(false),
  instructions: z.string().optional(),
  allow_retake: z.boolean().default(false),
  shuffle_questions: z.boolean().default(false),
  show_results: z.boolean().default(true),
}).refine((data) => data.passing_marks <= data.total_marks, {
  message: "درجة النجاح يجب أن تكون أقل من أو تساوي الدرجة الكلية",
  path: ["passing_marks"],
});

export type ExamFormValues = z.infer<typeof examFormSchema>;

export const questionFormSchema = z.object({
  question_text: z.string().min(1, "نص السؤال مطلوب"),
  question_type: z.enum(["multiple_choice", "true_false", "short_answer", "essay", "fill_blank"]).default("multiple_choice"),
  marks: z.coerce.number().min(0.5, "الدرجة يجب أن تكون 0.5 على الأقل"),
  order_index: z.coerce.number().optional(),
  correct_answer: z.string().optional(),
  explanation: z.string().optional(),
  is_required: z.boolean().default(true),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

export const gradingSchema = z.object({
  score: z.coerce.number().min(0),
  feedback: z.string().optional(),
});

export type GradingValues = z.infer<typeof gradingSchema>;
