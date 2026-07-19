"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { certificateFormSchema, type CertificateFormValues } from "@/lib/validators/certificate";
import { useCreateCertificate, useCertificateTemplates } from "@/lib/hooks/use-certificates";
import { useStudents } from "@/lib/hooks/use-students";
import { useCourses } from "@/lib/hooks/use-courses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Save, Award, User, BookOpen, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NewCertificatePage() {
  const router = useRouter();
  const createCert = useCreateCertificate();
  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string; number: string } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; name: string; code: string } | null>(null);

  const { data: studentsData } = useStudents({ search: studentSearch, pageSize: 20 });
  const { data: coursesData } = useCourses({ search: courseSearch, pageSize: 20 });
  const { data: templates } = useCertificateTemplates();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: { status: "draft", issue_date: new Date().toISOString().split("T")[0] },
  });

  const handleSelectStudent = (s: { id: string; first_name_ar: string | null; last_name_ar: string | null; student_number: string }) => {
    setValue("student_id", s.id, { shouldValidate: true });
    setSelectedStudent({ id: s.id, name: `${s.first_name_ar ?? ""} ${s.last_name_ar ?? ""}`.trim(), number: s.student_number });
    setStudentSearch("");
  };

  const handleSelectCourse = (c: { id: string; name: string; code: string }) => {
    setValue("course_id", c.id, { shouldValidate: true });
    setSelectedCourse(c);
    setCourseSearch("");
    if (!watch("title")) setValue("title", `شهادة إتمام - ${c.name}`);
  };

  const onSubmit = async (data: CertificateFormValues) => {
    try {
      await createCert.mutateAsync(data);
      router.push("/certificates");
    } catch { /* handled by mutation */ }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/certificates"><ArrowRight className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-3xl font-bold tracking-tight">إصدار شهادة</h1><p className="text-muted-foreground">إنشاء شهادة جديدة لطالبة</p></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Student Selection */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> اختيار الطالبة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="بحث عن الطالبة..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
            {errors.student_id && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-4 w-4" />{errors.student_id.message}</p>}
            <input type="hidden" {...register("student_id")} />
            {selectedStudent ? (
              <div className="p-4 rounded-lg border bg-muted/50 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">{selectedStudent.name.charAt(0)}</div>
                <div><p className="font-medium">{selectedStudent.name}</p><p className="text-sm text-muted-foreground">{selectedStudent.number}</p></div>
                <Button type="button" variant="ghost" size="sm" className="mr-auto" onClick={() => { setValue("student_id", ""); setSelectedStudent(null); }}>تغيير</Button>
              </div>
            ) : studentsData && studentsData.data.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {studentsData.data.map(s => (
                  <button key={s.id} type="button" className="w-full p-3 rounded-lg border text-right hover:bg-accent flex items-center gap-3" onClick={() => handleSelectStudent(s)}>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{(s.first_name_ar ?? "?").charAt(0)}</div>
                    <div><p className="text-sm font-medium">{s.first_name_ar} {s.last_name_ar}</p><p className="text-xs text-muted-foreground">{s.student_number}</p></div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Selection */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> الدورة (اختياري)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="بحث عن الدورة..." value={courseSearch} onChange={e => setCourseSearch(e.target.value)} />
            <input type="hidden" {...register("course_id")} />
            {selectedCourse ? (
              <div className="p-4 rounded-lg border bg-muted/50 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><BookOpen className="h-5 w-5 text-blue-600" /></div>
                <div><p className="font-medium">{selectedCourse.name}</p><p className="text-sm text-muted-foreground">{selectedCourse.code}</p></div>
                <Button type="button" variant="ghost" size="sm" className="mr-auto" onClick={() => { setValue("course_id", ""); setSelectedCourse(null); }}>تغيير</Button>
              </div>
            ) : coursesData && coursesData.data.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {coursesData.data.map(c => (
                  <button key={c.id} type="button" className="w-full p-3 rounded-lg border text-right hover:bg-accent flex items-center gap-3" onClick={() => handleSelectCourse(c)}>
                    <BookOpen className="h-4 w-4 text-blue-600" /><div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.code}</p></div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificate Details */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> تفاصيل الشهادة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">عنوان الشهادة *</label>
                <Input {...register("title")} placeholder="شهادة إتمام دورة..." />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div><label className="text-sm font-medium mb-2 block">العنوان بالعربية</label><Input {...register("title_ar")} placeholder="شهادة إتمام..." /></div>
            </div>
            <div><label className="text-sm font-medium mb-2 block">الوصف</label><textarea className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("description")} placeholder="وصف الشهادة..." /></div>
            <div className="grid gap-4 md:grid-cols-3">
              <div><label className="text-sm font-medium mb-2 block">تاريخ الإصدار</label><Input type="date" {...register("issue_date")} /></div>
              <div><label className="text-sm font-medium mb-2 block">تاريخ الانتهاء</label><Input type="date" {...register("expiry_date")} /></div>
              <div><label className="text-sm font-medium mb-2 block">القالب</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("template_id")}>
                  <option value="">اختر القالب (اختياري)</option>
                  {(templates ?? []).map(t => <option key={t.id} value={t.id}>{t.name_ar || t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div><label className="text-sm font-medium mb-2 block">الدرجة</label><Input {...register("grade")} placeholder="ممتاز، جيد جداً..." /></div>
              <div><label className="text-sm font-medium mb-2 block">النتيجة</label><Input type="number" {...register("score")} placeholder="0-100" /></div>
              <div><label className="text-sm font-medium mb-2 block">الساعات المكتملة</label><Input type="number" {...register("hours_completed")} placeholder="عدد الساعات" /></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">الحالة</label>
              <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm md:w-1/2" {...register("status")}>
                <option value="draft">مسودة</option><option value="active">صادرة فوراً</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" asChild><Link href="/certificates">إلغاء</Link></Button>
          <Button type="submit" disabled={isSubmitting || createCert.isPending}>
            {isSubmitting || createCert.isPending ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري الحفظ...</> : <><Save className="ml-2 h-4 w-4" />إنشاء الشهادة</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
