"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useExam, useExamQuestions, useCreateQuestion, useDeleteQuestion, useExamSubmissions, useGradeSubmission } from "@/lib/hooks/use-exams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowRight, Loader2, FileCheck, BookOpen, Clock, Users, BarChart3,
  Plus, Trash2, CheckCircle2, XCircle, AlertCircle, Eye, Edit, Save
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { QuestionFormData } from "@/lib/types/exam";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary", scheduled: "default", in_progress: "warning", completed: "success", cancelled: "destructive",
};
const statusLabels: Record<string, string> = {
  draft: "مسودة", scheduled: "مجدول", in_progress: "جاري", completed: "مكتمل", cancelled: "ملغي",
};
const typeLabels: Record<string, string> = {
  quiz: "اختبار قصير", midterm: "اختبار نصف فصلي", final: "اختبار نهائي",
  assignment: "واجب", practical: "عملي", oral: "شفهي",
};
const questionTypeLabels: Record<string, string> = {
  multiple_choice: "اختيار من متعدد", true_false: "صحيح/خطأ", short_answer: "إجابة قصيرة", essay: "مقالي", fill_blank: "ملء الفراغ",
};
const submissionStatusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  in_progress: "warning", submitted: "default", graded: "success", reviewed: "success",
};
const submissionStatusLabels: Record<string, string> = {
  in_progress: "جاري", submitted: "مُسلّم", graded: "مُصحّح", reviewed: "مُراجَع",
};

export default function ExamDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: exam, isLoading, error } = useExam(id);
  const { data: questions } = useExamQuestions(id);
  const { data: submissions } = useExamSubmissions(id);
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const gradeSubmission = useGradeSubmission();

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<string>("multiple_choice");
  const [qMarks, setQMarks] = useState(5);
  const [qCorrect, setQCorrect] = useState("");
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState("");

  const handleAddQuestion = useCallback(async () => {
    if (!qText.trim()) return;
    const data: QuestionFormData = { question_text: qText, question_type: qType as any, marks: qMarks, correct_answer: qCorrect || undefined };
    await createQuestion.mutateAsync({ examId: id, data });
    setQText(""); setQCorrect(""); setShowAddQuestion(false);
  }, [id, qText, qType, qMarks, qCorrect, createQuestion]);

  const handleDeleteQuestion = useCallback(async (qId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السؤال؟")) await deleteQuestion.mutateAsync({ id: qId, examId: id });
  }, [id, deleteQuestion]);

  const handleGrade = useCallback(async (submissionId: string) => {
    await gradeSubmission.mutateAsync({ submissionId, examId: id, grades: [{ answer_id: submissionId, marks_awarded: gradeScore, feedback: gradeFeedback || undefined }] });
    setGradingId(null); setGradeScore(0); setGradeFeedback("");
  }, [id, gradeScore, gradeFeedback, gradeSubmission]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error || !exam) return <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive"><AlertCircle className="h-12 w-12 mb-4" /><Button variant="outline" asChild><Link href="/exams">العودة</Link></Button></div>;

  const passRate = exam.total_marks > 0 ? Math.round((exam.passing_marks / exam.total_marks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/exams"><ArrowRight className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>{exam.title_ar && <p className="text-muted-foreground">{exam.title_ar}</p>}</div>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={statusColors[exam.status]} className="text-sm px-3 py-1">{statusLabels[exam.status]}</Badge>
          <Badge variant="secondary">{typeLabels[exam.exam_type]}</Badge>
          {exam.is_online && <Badge variant="default">إلكتروني</Badge>}
        </div>
      </CardContent></Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{exam.total_marks}</p><p className="text-xs text-muted-foreground">الدرجة الكلية</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{exam.passing_marks}</p><p className="text-xs text-muted-foreground">درجة النجاح ({passRate}%)</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{exam.duration_minutes} د</p><p className="text-xs text-muted-foreground">المدة</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{exam.question_count ?? 0}</p><p className="text-xs text-muted-foreground">الأسئلة</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{exam.submission_count ?? 0}</p><p className="text-xs text-muted-foreground">التسليمات</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="questions">الأسئلة ({(questions ?? []).length})</TabsTrigger>
          <TabsTrigger value="submissions">التسليمات ({(submissions ?? []).length})</TabsTrigger>
          <TabsTrigger value="results">النتائج</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5" /> بيانات الاختبار</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">العنوان:</span><span className="font-medium">{exam.title}</span></div>
              {exam.title_ar && <div className="flex justify-between"><span className="text-muted-foreground">العنوان بالعربية:</span><span>{exam.title_ar}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">النوع:</span><Badge variant="secondary">{typeLabels[exam.exam_type]}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الحالة:</span><Badge variant={statusColors[exam.status]}>{statusLabels[exam.status]}</Badge></div>
              {exam.course && <div className="flex justify-between"><span className="text-muted-foreground">الدورة:</span><span>{exam.course.name} ({exam.course.code})</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">الدرجة الكلية:</span><span>{exam.total_marks}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">درجة النجاح:</span><span>{exam.passing_marks}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">المدة:</span><span>{exam.duration_minutes} دقيقة</span></div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> الجدولة والإعدادات</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">التاريخ:</span><span>{exam.exam_date ? formatDate(exam.exam_date) : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الوقت:</span><span>{exam.start_time && exam.end_time ? `${exam.start_time} - ${exam.end_time}` : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">المكان:</span><span>{exam.location ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">إلكتروني:</span><span>{exam.is_online ? "نعم" : "لا"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">إعادة محاولة:</span><span>{exam.allow_retake ? "مسموح" : "غير مسموح"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">.shuffle أسئلة:</span><span>{exam.shuffle_questions ? "نعم" : "لا"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">عرض النتائج:</span><span>{exam.show_results ? "نعم" : "لا"}</span></div>
              {exam.instructions && <div className="pt-2"><p className="text-muted-foreground mb-1">التعليمات:</p><p>{exam.instructions}</p></div>}
            </CardContent></Card>
          </div>
          {exam.description && <Card className="mt-6"><CardHeader><CardTitle>الوصف</CardTitle></CardHeader><CardContent><p className="text-sm">{exam.description}</p></CardContent></Card>}
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">بنك الأسئلة</h3>
              <Button onClick={() => setShowAddQuestion(!showAddQuestion)}><Plus className="ml-2 h-4 w-4" /> إضافة سؤال</Button>
            </div>

            {showAddQuestion && (
              <Card className="border-primary/30"><CardContent className="p-4 space-y-4">
                <div><label className="text-sm font-medium mb-2 block">نص السؤال *</label>
                  <textarea className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" value={qText} onChange={e => setQText(e.target.value)} placeholder="اكتب السؤال..." />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div><label className="text-sm font-medium mb-2 block">نوع السؤال</label>
                    <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" value={qType} onChange={e => setQType(e.target.value)}>
                      {Object.entries(questionTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div><label className="text-sm font-medium mb-2 block">الدرجة</label><Input type="number" value={qMarks} onChange={e => setQMarks(Number(e.target.value))} /></div>
                  <div><label className="text-sm font-medium mb-2 block">الإجابة الصحيحة</label><Input value={qCorrect} onChange={e => setQCorrect(e.target.value)} placeholder="الإجابة النموذجية" /></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddQuestion} disabled={!qText.trim() || createQuestion.isPending}>{createQuestion.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Plus className="ml-2 h-4 w-4" />} إضافة</Button>
                  <Button variant="ghost" onClick={() => setShowAddQuestion(false)}>إلغاء</Button>
                </div>
              </CardContent></Card>
            )}

            {(questions ?? []).length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-semibold">لا توجد أسئلة</h3><p className="mt-1">أضف أسئلة للاختبار</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {(questions ?? []).map((q, i) => (
                  <Card key={q.id}><CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                          <Badge variant="secondary">{questionTypeLabels[q.question_type] ?? q.question_type}</Badge>
                          <span className="text-sm text-muted-foreground">{q.marks} درجة</span>
                        </div>
                        <p className="text-sm">{q.question_text}</p>
                        {q.correct_answer && <p className="text-xs text-green-600 mt-1">الإجابة: {q.correct_answer}</p>}
                        {q.explanation && <p className="text-xs text-muted-foreground mt-1">شرح: {q.explanation}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleDeleteQuestion(q.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions">
          {(submissions ?? []).length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-semibold">لا توجد تسليمات</h3></CardContent></Card>
          ) : (
            <Card><CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b">
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الطالبة</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدرجة</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">النسبة</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدرجة</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التاريخ</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
                  </tr></thead>
                  <tbody>
                    {(submissions ?? []).map(sub => (
                      <tr key={sub.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium">{sub.student?.first_name_ar} {sub.student?.last_name_ar}</p>
                          <p className="text-xs text-muted-foreground">{sub.student?.student_number}</p>
                        </td>
                        <td className="py-3 px-4"><Badge variant={submissionStatusColors[sub.status]}>{submissionStatusLabels[sub.status]}</Badge></td>
                        <td className="py-3 px-4 text-sm font-medium">{sub.score !== null ? `${sub.score}/${exam.total_marks}` : "—"}</td>
                        <td className="py-3 px-4 text-sm">{sub.percentage !== null ? `${sub.percentage}%` : "—"}</td>
                        <td className="py-3 px-4"><Badge variant={sub.grade === "F" ? "destructive" : "success"}>{sub.grade ?? "—"}</Badge></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{sub.submitted_at ? formatDate(sub.submitted_at) : "—"}</td>
                        <td className="py-3 px-4">
                          {sub.status === "submitted" && (
                            <Button variant="outline" size="sm" onClick={() => { setGradingId(sub.id); setGradeScore(sub.score ?? 0); }}>
                              <Edit className="ml-1 h-3 w-3" /> تصحيح
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent></Card>
          )}

          {/* Grading Panel */}
          {gradingId && (
            <Card className="mt-4 border-primary/30"><CardHeader><CardTitle>تصحيح التسليم</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="text-sm font-medium mb-2 block">الدرجة (من {exam.total_marks})</label>
                  <Input type="number" value={gradeScore} onChange={e => setGradeScore(Number(e.target.value))} max={exam.total_marks} min={0} />
                </div>
                <div><label className="text-sm font-medium mb-2 block">ملاحظات</label>
                  <Input value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)} placeholder="ملاحظات للطالبة..." />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleGrade(gradingId)} disabled={gradeSubmission.isPending}>{gradeSubmission.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ الدرجة</Button>
                <Button variant="ghost" onClick={() => setGradingId(null)}>إلغاء</Button>
              </div>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> تحليل النتائج</CardTitle></CardHeader><CardContent>
            {(submissions ?? []).filter(s => s.score !== null).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد نتائج مصححة بعد</p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg border text-center">
                    <p className="text-3xl font-bold">{exam.average_score ?? 0}</p>
                    <p className="text-sm text-muted-foreground">المعدل</p>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <p className="text-3xl font-bold">{(submissions ?? []).filter(s => (s.score ?? 0) >= exam.passing_marks).length}</p>
                    <p className="text-sm text-muted-foreground">ناجح</p>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <p className="text-3xl font-bold">{(submissions ?? []).filter(s => s.score !== null && (s.score ?? 0) < exam.passing_marks).length}</p>
                    <p className="text-sm text-muted-foreground">راسب</p>
                  </div>
                </div>
                {/* Grade distribution */}
                <div>
                  <h4 className="text-sm font-medium mb-3">توزيع الدرجات</h4>
                  {["A", "B", "C", "D", "F"].map(grade => {
                    const count = (submissions ?? []).filter(s => s.grade === grade).length;
                    const total = (submissions ?? []).filter(s => s.score !== null).length;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={grade} className="flex items-center gap-3 mb-2">
                        <span className="w-8 text-sm font-bold">{grade}</span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${grade === "F" ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm w-12 text-left">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
