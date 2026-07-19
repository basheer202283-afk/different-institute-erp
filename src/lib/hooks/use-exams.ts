"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type {
  Exam, ExamWithRelations, ExamFormData, ExamFilters, ExamStats,
  ExamQuestion, QuestionFormData, ExamSubmission, ExamSubmissionWithRelations,
  ExamAnswer, TranscriptEntry, PaginatedResponse,
} from "@/lib/types/exam";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// EXAM CRUD
// ============================================================

export function useExams(filters: ExamFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { search, status, exam_type, course_id, page = 1, pageSize = 10 } = filters;

  return useQuery({
    queryKey: ["exams", organization?.id, search, status, exam_type, course_id, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Exam>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };
      let query = supabase.from("exams").select("*", { count: "exact" })
        .eq("organization_id", organization.id).is("deleted_at", null)
        .order("exam_date", { ascending: false, nullsFirst: true });
      if (search) query = query.or(`title.ilike.%${search}%,title_ar.ilike.%${search}%,description.ilike.%${search}%`);
      if (status) query = query.eq("status", status);
      if (exam_type) query = query.eq("exam_type", exam_type);
      if (course_id) query = query.eq("course_id", course_id);
      const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;
      return { data: (data ?? []) as Exam[], count: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) };
    },
    enabled: !!organization,
  });
}

export function useExam(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["exams", id],
    queryFn: async (): Promise<ExamWithRelations | null> => {
      const { data, error } = await supabase.from("exams").select("*").eq("id", id).single();
      if (error) throw error;
      if (!data) return null;
      const exam = data as unknown as Exam;
      const result: ExamWithRelations = { ...exam };
      if (exam.course_id) {
        const { data: c } = await supabase.from("courses").select("id, name, code").eq("id", exam.course_id).single();
        if (c) result.course = c as any;
      }
      if (exam.class_id) {
        const { data: cl } = await supabase.from("classes").select("id, name, code").eq("id", exam.class_id).single();
        if (cl) result.class = cl as any;
      }
      // Get question count
      const { count: qCount } = await supabase.from("exam_questions").select("id", { count: "exact", head: true }).eq("exam_id", id).is("deleted_at", null);
      result.question_count = qCount ?? 0;
      // Get submission count & avg
      const { data: subs } = await supabase.from("exam_submissions").select("score, status").eq("exam_id", id).is("deleted_at", null);
      const subRows = (subs ?? []) as Array<{ score: number | null; status: string }>;
      result.submission_count = subRows.length;
      const graded = subRows.filter(s => s.score !== null);
      result.average_score = graded.length > 0 ? graded.reduce((sum, s) => sum + (Number(s.score) || 0), 0) / graded.length : 0;
      return result;
    },
    enabled: !!id,
  });
}

export function useCreateExam() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ExamFormData) => {
      if (!organization) throw new Error("No organization");
      const { data: exam, error } = await (supabase.from("exams") as any).insert({
        ...data, organization_id: organization.id,
        course_id: data.course_id || null, class_id: data.class_id || null, trainer_id: data.trainer_id || null,
        title_ar: data.title_ar || null, description: data.description || null,
        exam_date: data.exam_date || null, start_time: data.start_time || null, end_time: data.end_time || null,
        location: data.location || null, instructions: data.instructions || null,
      }).select().single();
      if (error) throw error;
      return exam as Exam;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["exams"] }); queryClient.invalidateQueries({ queryKey: ["exam-stats"] }); toast.success("تم إنشاء الاختبار بنجاح"); },
    onError: (e: Error) => { toast.error(`خطأ: ${e.message}`); },
  });
}

export function useUpdateExam() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ExamFormData> }) => {
      const { data: exam, error } = await (supabase.from("exams") as any).update(data).eq("id", id).select().single();
      if (error) throw error;
      return exam as Exam;
    },
    onSuccess: (_, v) => { queryClient.invalidateQueries({ queryKey: ["exams"] }); queryClient.invalidateQueries({ queryKey: ["exams", v.id] }); toast.success("تم تحديث الاختبار بنجاح"); },
  });
}

export function useDeleteExam() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("exams") as any).update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["exams"] }); toast.success("تم حذف الاختبار"); },
  });
}

export function useExamStats() {
  const { organization } = useTenant();
  const supabase = createClient();
  return useQuery({
    queryKey: ["exam-stats", organization?.id],
    queryFn: async (): Promise<ExamStats> => {
      if (!organization) return { total: 0, scheduled: 0, completed: 0, average_score: 0, pass_rate: 0, total_submissions: 0 };
      const { data: exams } = await supabase.from("exams").select("id, status, total_marks, passing_marks").eq("organization_id", organization.id).is("deleted_at", null);
      const examRows = (exams ?? []) as Array<{ id: string; status: string; total_marks: number; passing_marks: number }>;
      const stats: ExamStats = { total: examRows.length, scheduled: 0, completed: 0, average_score: 0, pass_rate: 0, total_submissions: 0 };
      for (const e of examRows) {
        if (e.status === "scheduled") stats.scheduled++;
        if (e.status === "completed") stats.completed++;
      }
      const examIds = examRows.map(e => e.id);
      if (examIds.length > 0) {
        const { data: subs } = await supabase.from("exam_submissions").select("score, status, exam_id").in("exam_id", examIds).is("deleted_at", null);
        const subRows = (subs ?? []) as Array<{ score: number | null; status: string; exam_id: string }>;
        stats.total_submissions = subRows.length;
        const graded = subRows.filter(s => s.score !== null);
        if (graded.length > 0) {
          stats.average_score = Math.round(graded.reduce((sum, s) => sum + (Number(s.score) || 0), 0) / graded.length);
          const passingMap = new Map(examRows.map(e => [e.id, e.passing_marks]));
          const passed = graded.filter(s => (Number(s.score) || 0) >= (passingMap.get(s.exam_id) || 0));
          stats.pass_rate = Math.round((passed.length / graded.length) * 100);
        }
      }
      return stats;
    },
    enabled: !!organization,
  });
}

// ============================================================
// EXAM QUESTIONS
// ============================================================

export function useExamQuestions(examId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["exam-questions", examId],
    queryFn: async (): Promise<ExamQuestion[]> => {
      const { data, error } = await supabase.from("exam_questions").select("*").eq("exam_id", examId).is("deleted_at", null).order("order_index");
      if (error) throw error;
      return (data ?? []) as ExamQuestion[];
    },
    enabled: !!examId,
  });
}

export function useCreateQuestion() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, data }: { examId: string; data: QuestionFormData }) => {
      // Get next order_index
      const { data: existing } = await supabase.from("exam_questions").select("order_index").eq("exam_id", examId).is("deleted_at", null).order("order_index", { ascending: false }).limit(1);
      const nextOrder = existing && (existing as any).length > 0 ? ((existing as any)[0].order_index || 0) + 1 : 1;
      const options = data.question_type === "multiple_choice" ? (data.options ?? null) : data.question_type === "true_false" ? [{ label: "صحيح", value: "true" }, { label: "خطأ", value: "false" }] : null;
      const { data: q, error } = await (supabase.from("exam_questions") as any).insert({
        exam_id: examId, question_text: data.question_text, question_type: data.question_type,
        marks: data.marks, order_index: data.order_index ?? nextOrder,
        options, correct_answer: data.correct_answer || null, explanation: data.explanation || null,
        is_required: data.is_required ?? true,
      }).select().single();
      if (error) throw error;
      return q as ExamQuestion;
    },
    onSuccess: (_, v) => { queryClient.invalidateQueries({ queryKey: ["exam-questions", v.examId] }); toast.success("تمت إضافة السؤال"); },
  });
}

export function useDeleteQuestion() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, examId }: { id: string; examId: string }) => {
      const { error } = await (supabase.from("exam_questions") as any).update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return { id, examId };
    },
    onSuccess: (_, v) => { queryClient.invalidateQueries({ queryKey: ["exam-questions", v.examId] }); toast.success("تم حذف السؤال"); },
  });
}

// ============================================================
// EXAM SUBMISSIONS
// ============================================================

export function useExamSubmissions(examId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["exam-submissions", examId],
    queryFn: async (): Promise<ExamSubmissionWithRelations[]> => {
      const { data, error } = await supabase.from("exam_submissions").select("*").eq("exam_id", examId).is("deleted_at", null).order("submitted_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      const subs = (data ?? []) as ExamSubmission[];
      const results: ExamSubmissionWithRelations[] = [];
      for (const sub of subs) {
        const result: ExamSubmissionWithRelations = { ...sub };
        const { data: student } = await supabase.from("students").select("id, student_number, first_name_ar, last_name_ar").eq("id", sub.student_id).single();
        if (student) result.student = student as any;
        results.push(result);
      }
      return results;
    },
    enabled: !!examId,
  });
}

export function useSubmitExam() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, studentId, answers, timeTaken }: {
      examId: string; studentId: string;
      answers: Array<{ question_id: string; answer_text?: string; selected_option?: string }>;
      timeTaken?: number;
    }) => {
      const { data: sub, error: subErr } = await (supabase.from("exam_submissions") as any).insert({
        exam_id: examId, student_id: studentId, status: "submitted",
        submitted_at: new Date().toISOString(), time_taken_minutes: timeTaken || null,
      }).select().single();
      if (subErr) throw subErr;
      const submission = sub as ExamSubmission;
      // Insert answers
      for (const ans of answers) {
        await (supabase.from("exam_answers") as any).insert({
          submission_id: submission.id, question_id: ans.question_id,
          answer_text: ans.answer_text || null, selected_option: ans.selected_option || null,
        });
      }
      return submission;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["exam-submissions"] }); toast.success("تم تسليم الاختبار بنجاح"); },
    onError: (e: Error) => { toast.error(`خطأ: ${e.message}`); },
  });
}

export function useGradeSubmission() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ submissionId, examId, grades }: {
      submissionId: string; examId: string;
      grades: Array<{ answer_id: string; marks_awarded: number; feedback?: string; is_correct?: boolean }>;
    }) => {
      let totalScore = 0;
      for (const g of grades) {
        totalScore += g.marks_awarded;
        await (supabase.from("exam_answers") as any).update({
          marks_awarded: g.marks_awarded, feedback: g.feedback || null, is_correct: g.is_correct ?? (g.marks_awarded > 0),
        }).eq("id", g.answer_id);
      }
      // Get exam total marks
      const { data: exam } = await supabase.from("exams").select("total_marks, passing_marks").eq("id", examId).single();
      const examData = exam as any;
      const totalMarks = examData?.total_marks || 100;
      const passingMarks = examData?.passing_marks || 50;
      const percentage = Math.round((totalScore / totalMarks) * 100);
      const grade = percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : percentage >= 60 ? "D" : "F";
      const gpa = percentage >= 90 ? 4.0 : percentage >= 80 ? 3.0 : percentage >= 70 ? 2.0 : percentage >= 60 ? 1.0 : 0;
      await (supabase.from("exam_submissions") as any).update({
        score: totalScore, percentage, grade, gpa, status: "graded",
        graded_at: new Date().toISOString(),
      }).eq("id", submissionId);
      return { submissionId, score: totalScore, percentage, grade };
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ["exam-submissions", v.examId] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("تم تصحيح الاختبار بنجاح");
    },
  });
}

// ============================================================
// STUDENT RESULTS & TRANSCRIPT
// ============================================================

export function useStudentExamResults(studentId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["student-exam-results", studentId],
    queryFn: async (): Promise<ExamSubmission[]> => {
      const { data, error } = await supabase.from("exam_submissions").select("*").eq("student_id", studentId).is("deleted_at", null).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ExamSubmission[];
    },
    enabled: !!studentId,
  });
}

export function useStudentTranscript(studentId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["student-transcript", studentId],
    queryFn: async (): Promise<TranscriptEntry[]> => {
      const { data: subs } = await supabase.from("exam_submissions").select("exam_id, score, percentage, grade, gpa, created_at").eq("student_id", studentId).eq("status", "graded").is("deleted_at", null);
      const subRows = (subs ?? []) as Array<{ exam_id: string; score: number; percentage: number; grade: string; gpa: number; created_at: string }>;
      const entries: TranscriptEntry[] = [];
      for (const s of subRows) {
        const { data: exam } = await supabase.from("exams").select("title, exam_type, total_marks, course_id").eq("id", s.exam_id).single();
        const examData = exam as any;
        let courseName = "—", courseCode = "—";
        if (examData?.course_id) {
          const { data: course } = await supabase.from("courses").select("name, code").eq("id", examData.course_id).single();
          if (course) { courseName = (course as any).name; courseCode = (course as any).code; }
        }
        entries.push({
          course_name: courseName, course_code: courseCode,
          exam_title: examData?.title ?? "—", exam_type: examData?.exam_type ?? "quiz",
          score: s.score, total_marks: examData?.total_marks ?? 100,
          percentage: s.percentage, grade: s.grade, gpa: s.gpa, date: s.created_at,
        });
      }
      return entries;
    },
    enabled: !!studentId,
  });
}

export function useExamAnswers(submissionId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["exam-answers", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("exam_answers").select("*").eq("submission_id", submissionId).order("created_at");
      if (error) throw error;
      return (data ?? []) as ExamAnswer[];
    },
    enabled: !!submissionId,
  });
}
