"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { examFormSchema, type ExamFormValues } from "@/lib/validators/exam";
import { useCreateExam } from "@/lib/hooks/use-exams";
import { useCourses } from "@/lib/hooks/use-courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Save, FileCheck, BookOpen, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

const examTypes = [
  { value: "quiz", label: "اختبار قصير" },
  { value: "midterm", label: "اختبار نصف فصلي" },
  { value: "final", label: "اختبار نهائي" },
  { value: "assignment", label: "واجب" },
  { value: "practical", label: "عملي" },
  { value: "oral", label: "شفهي" },
];

export default function NewExamPage() {
  const router = useRouter();
  const createExam = useCreateExam();
  const { data: coursesData } = useCourses({ pageSize: 50, status: "active" });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: { exam_type: "quiz", status: "draft", total_marks: 100, passing_marks: 50, duration_minutes: 60, is_online: false, allow_retake: false, shuffle_questions: false, show_results: true },
  });

  const totalMarks = watch("total_marks") || 100;

  const onSubmit = async (data: ExamFormValues) => {
    try { await createExam.mutateAsync(data); router.push("/exams"); } catch { /* handled */ }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/exams"><ArrowRight className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-3xl font-bold tracking-tight">اختبار جديد</h1><p className="text-muted-foreground">إنشاء اختبار أو امتحان جديد</p></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5" /> بيانات الاختبار</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">عنوان الاختبار *</label><Input {...register("title")} placeholder="مثال: اختبار الفصل الأول" />{errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}</div>
              <div><label className="text-sm font-medium mb-2 block">العنوان بالعربية</label><Input {...register("title_ar")} placeholder="عنوان بالعربية" /></div>
            </div>
            <div><label className="text-sm font-medium mb-2 block">الوصف</label><textarea className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("description")} placeholder="وصف الاختبار..." /></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">الدورة</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("course_id")}>
                  <option value="">اختر الدورة (اختياري)</option>
                  {(coursesData?.data ?? []).map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium mb-2 block">نوع الاختبار</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("exam_type")}>
                  {examTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> الدرجات والوقت</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div><label className="text-sm font-medium mb-2 block">الدرجة الكلية *</label><Input type="number" {...register("total_marks")} />{errors.total_marks && <p className="text-sm text-destructive mt-1">{errors.total_marks.message}</p>}</div>
              <div><label className="text-sm font-medium mb-2 block">درجة النجاح *</label><Input type="number" {...register("passing_marks")} />{errors.passing_marks && <p className="text-sm text-destructive mt-1">{errors.passing_marks.message}</p>}</div>
              <div><label className="text-sm font-medium mb-2 block">المدة (دقيقة) *</label><Input type="number" {...register("duration_minutes")} />{errors.duration_minutes && <p className="text-sm text-destructive mt-1">{errors.duration_minutes.message}</p>}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p>درجة النجاح: <span className="font-bold">{watch("passing_marks") || 0}</span> من <span className="font-bold">{totalMarks}</span> ({totalMarks > 0 ? Math.round(((watch("passing_marks") || 0) / totalMarks) * 100) : 0}%)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> الجدولة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div><label className="text-sm font-medium mb-2 block">تاريخ الاختبار</label><Input type="date" {...register("exam_date")} /></div>
              <div><label className="text-sm font-medium mb-2 block">وقت البداية</label><Input type="time" {...register("start_time")} /></div>
              <div><label className="text-sm font-medium mb-2 block">وقت النهاية</label><Input type="time" {...register("end_time")} /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">المكان</label><Input {...register("location")} placeholder="قاعة 101" /></div>
              <div><label className="text-sm font-medium mb-2 block">الحالة</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("status")}>
                  <option value="draft">مسودة</option><option value="scheduled">مجدول</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>الإعدادات</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><p className="text-sm font-medium">اختبار عبر الإنترنت</p><p className="text-xs text-muted-foreground">يقدم الاختبار إلكترونياً</p></div>
              <input type="checkbox" className="h-4 w-4 rounded" {...register("is_online")} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><p className="text-sm font-medium">السماح بإعادة المحاولة</p><p className="text-xs text-muted-foreground">يمكن للطالبة إعادة الاختبار</p></div>
              <input type="checkbox" className="h-4 w-4 rounded" {...register("allow_retake")} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><p className="text-sm font-medium">.shuffle الأسئلة</p><p className="text-xs text-muted-foreground">ترتيب عشوائي للأسئلة</p></div>
              <input type="checkbox" className="h-4 w-4 rounded" {...register("shuffle_questions")} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><p className="text-sm font-medium">عرض النتائج بعد التسليم</p><p className="text-xs text-muted-foreground">تظهر النتيجة فوراً</p></div>
              <input type="checkbox" className="h-4 w-4 rounded" {...register("show_results")} />
            </div>
          </CardContent>
        </Card>

        <Card><CardHeader><CardTitle>التعليمات</CardTitle></CardHeader><CardContent>
          <textarea className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("instructions")} placeholder="تعليمات الاختبار للطالبات..." />
        </CardContent></Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" asChild><Link href="/exams">إلغاء</Link></Button>
          <Button type="submit" disabled={isSubmitting || createExam.isPending}>
            {isSubmitting || createExam.isPending ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري الحفظ...</> : <><Save className="ml-2 h-4 w-4" />إنشاء الاختبار</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
