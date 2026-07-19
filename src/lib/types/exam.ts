import type { Json } from "@/lib/types/database";

export type ExamType = "quiz" | "midterm" | "final" | "assignment" | "practical" | "oral";
export type ExamStatus = "draft" | "scheduled" | "in_progress" | "completed" | "cancelled";
export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "essay" | "fill_blank";
export type GradingStatus = "pending" | "graded" | "reviewed" | "finalized";

export interface Exam {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  course_id: string | null;
  class_id: string | null;
  trainer_id: string | null;
  title: string;
  title_ar: string | null;
  description: string | null;
  exam_type: ExamType;
  status: ExamStatus;
  total_marks: number;
  passing_marks: number;
  duration_minutes: number;
  exam_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  is_online: boolean;
  instructions: string | null;
  allow_retake: boolean;
  shuffle_questions: boolean;
  show_results: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface ExamWithRelations extends Exam {
  course?: { id: string; name: string; code: string };
  class?: { id: string; name: string; code: string };
  trainer?: { id: string; first_name: string; last_name: string };
  question_count?: number;
  submission_count?: number;
  average_score?: number;
}

export interface ExamQuestion {
  id: string;
  tenant_id: string;
  exam_id: string;
  question_text: string;
  question_type: QuestionType;
  marks: number;
  order_index: number;
  options: Json | null;
  correct_answer: string | null;
  explanation: string | null;
  is_required: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface ExamSubmission {
  id: string;
  tenant_id: string;
  exam_id: string;
  student_id: string;
  enrollment_id: string | null;
  status: "in_progress" | "submitted" | "graded" | "reviewed";
  score: number | null;
  percentage: number | null;
  grade: string | null;
  gpa: number | null;
  submitted_at: string | null;
  graded_at: string | null;
  graded_by: string | null;
  time_taken_minutes: number | null;
  feedback: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface ExamSubmissionWithRelations extends ExamSubmission {
  student?: { id: string; student_number: string; first_name_ar: string; last_name_ar: string };
  exam?: { id: string; title: string; total_marks: number };
}

export interface ExamAnswer {
  id: string;
  tenant_id: string;
  submission_id: string;
  question_id: string;
  answer_text: string | null;
  selected_option: string | null;
  is_correct: boolean | null;
  marks_awarded: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamFormData {
  course_id?: string;
  class_id?: string;
  trainer_id?: string;
  title: string;
  title_ar?: string;
  description?: string;
  exam_type: ExamType;
  status?: ExamStatus;
  total_marks: number;
  passing_marks: number;
  duration_minutes: number;
  exam_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  is_online?: boolean;
  instructions?: string;
  allow_retake?: boolean;
  shuffle_questions?: boolean;
  show_results?: boolean;
}

export interface QuestionFormData {
  question_text: string;
  question_type: QuestionType;
  marks: number;
  order_index?: number;
  options?: Array<{ label: string; value: string; is_correct?: boolean }>;
  correct_answer?: string;
  explanation?: string;
  is_required?: boolean;
}

export interface ExamFilters {
  search?: string;
  status?: ExamStatus;
  exam_type?: ExamType;
  course_id?: string;
  page?: number;
  pageSize?: number;
}

export interface ExamStats {
  total: number;
  scheduled: number;
  completed: number;
  average_score: number;
  pass_rate: number;
  total_submissions: number;
}

export interface TranscriptEntry {
  course_name: string;
  course_code: string;
  exam_title: string;
  exam_type: ExamType;
  score: number;
  total_marks: number;
  percentage: number;
  grade: string;
  gpa: number;
  date: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
