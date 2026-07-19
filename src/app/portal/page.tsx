"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useStudentEnrollments } from "@/lib/hooks/use-enrollments";
import { useStudentCertificates } from "@/lib/hooks/use-certificates";
import { useStudentExamResults } from "@/lib/hooks/use-exams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, CalendarCheck, Award, CreditCard, Bell, User, Loader2, Clock, CheckCircle2, AlertCircle, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const enrollmentStatusLabels: Record<string, string> = {
  pending: "قيد الانتظار", approved: "معتمد", active: "نشط", completed: "مكتمل", cancelled: "ملغي", rejected: "مرفوض", transferred: "منقول", deferred: "مؤجل", expelled: "مفصول",
};
const enrollmentStatusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning", approved: "default", active: "success", completed: "default", cancelled: "destructive", rejected: "destructive", transferred: "secondary", deferred: "secondary", expelled: "destructive",
};
const certStatusLabels: Record<string, string> = { draft: "مسودة", active: "صادرة", revoked: "ملغاة", expired: "منتهية" };
const certStatusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = { draft: "secondary", active: "success", revoked: "destructive", expired: "warning" };
const examGradeColors: Record<string, string> = { A: "text-green-600", B: "text-blue-600", C: "text-yellow-600", D: "text-orange-600", F: "text-red-600" };

export default function StudentPortalPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  // Find the student record linked to this user
  const { data: studentRecord, isLoading: studentLoading } = useQuery({
    queryKey: ["portal-student", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("students").select("id, student_number, first_name_ar, last_name_ar, status, academic_level, mobile, email, guardian_name, guardian_phone").eq("user_id", user.id).is("deleted_at", null).single();
      return data as any;
    },
    enabled: !!user,
  });

  const studentId = studentRecord?.id;
  const { data: enrollments } = useStudentEnrollments(studentId ?? "");
  const { data: certificates } = useStudentCertificates(studentId ?? "");
  const { data: examResults } = useStudentExamResults(studentId ?? "");

  const activeEnrollments = (enrollments ?? []).filter(e => e.status === "active");
  const activeCerts = (certificates ?? []).filter(c => c.status === "active");
  const gradedExams = (examResults ?? []).filter(r => r.status === "graded");
  const avgScore = gradedExams.length > 0 ? Math.round(gradedExams.reduce((sum, r) => sum + (r.percentage || 0), 0) / gradedExams.length) : 0;

  if (authLoading || studentLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="max-w-md w-full mx-4"><CardContent className="p-8 text-center">
        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" /><h1 className="text-2xl font-bold mb-2">بوابة الطالبة</h1>
        <p className="text-muted-foreground mb-6">سجلي دخولك لعرض بياناتك الأكاديمية</p>
        <Button asChild className="w-full"><Link href="/login">تسجيل الدخول</Link></Button>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card><CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {(studentRecord?.first_name_ar ?? profile?.first_name ?? "ط").charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">مرحباً {studentRecord ? `${studentRecord.first_name_ar} ${studentRecord.last_name_ar}` : profile?.display_name || "الطالبة"}</h1>
            <p className="text-muted-foreground">بوابة الطالبة {studentRecord?.student_number ? `• رقم: ${studentRecord.student_number}` : ""}</p>
            {studentRecord?.status && <Badge variant={studentRecord.status === "active" ? "success" : "warning"} className="mt-1">{enrollmentStatusLabels[studentRecord.status] ?? studentRecord.status}</Badge>}
          </div>
        </div>
      </CardContent></Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><BookOpen className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{activeEnrollments.length}</p><p className="text-xs text-muted-foreground">الدورات النشطة</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Award className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{activeCerts.length}</p><p className="text-xs text-muted-foreground">الشهادات</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{avgScore}%</p><p className="text-xs text-muted-foreground">المعدل</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><FileText className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold">{gradedExams.length}</p><p className="text-xs text-muted-foreground">الاختبارات</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="flex-wrap">
          <TabsTrigger value="courses"><BookOpen className="ml-1 h-4 w-4" /> دوراتي</TabsTrigger>
          <TabsTrigger value="exams"><FileText className="ml-1 h-4 w-4" /> الاختبارات</TabsTrigger>
          <TabsTrigger value="certificates"><Award className="ml-1 h-4 w-4" /> الشهادات</TabsTrigger>
          <TabsTrigger value="profile"><User className="ml-1 h-4 w-4" /> الملف الشخصي</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card><CardHeader><CardTitle>دوراتي</CardTitle></CardHeader><CardContent>
            {(enrollments ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لم تسجلي في أي دورة بعد</p></div>
            ) : (
              <div className="space-y-3">
                {(enrollments ?? []).map(enr => (
                  <div key={enr.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="font-medium">الدورة: {enr.course_id?.substring(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">تاريخ التسجيل: {formatDate(enr.enrollment_date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={enrollmentStatusColors[enr.status]}>{enrollmentStatusLabels[enr.status] ?? enr.status}</Badge>
                      {enr.total_fees > 0 && <span className="text-sm font-medium">{formatCurrency(enr.total_fees)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card><CardHeader><CardTitle>نتائج الاختبارات</CardTitle></CardHeader><CardContent>
            {gradedExams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لا توجد نتائج اختبارات</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b">
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الاختبار</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدرجة</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">النسبة</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التقدير</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التاريخ</th>
                  </tr></thead>
                  <tbody>
                    {gradedExams.map(r => (
                      <tr key={r.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">{r.exam_id?.substring(0, 8)}</td>
                        <td className="py-3 px-4 text-sm font-medium">{r.score ?? "—"}</td>
                        <td className="py-3 px-4 text-sm">{r.percentage !== null ? `${r.percentage}%` : "—"}</td>
                        <td className="py-3 px-4"><span className={`font-bold ${examGradeColors[r.grade ?? ""] ?? ""}`}>{r.grade ?? "—"}</span></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{r.created_at ? formatDate(r.created_at) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card><CardHeader><CardTitle>شهاداتي</CardTitle></CardHeader><CardContent>
            {(certificates ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><Award className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لا توجد شهادات</p></div>
            ) : (
              <div className="space-y-3">
                {(certificates ?? []).map(cert => (
                  <div key={cert.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="font-medium">{cert.title}</p>
                      <p className="text-sm text-muted-foreground font-mono">{cert.certificate_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={certStatusColors[cert.status]}>{certStatusLabels[cert.status]}</Badge>
                      {cert.issue_date && <span className="text-xs text-muted-foreground">{formatDate(cert.issue_date)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card><CardHeader><CardTitle>الملف الشخصي</CardTitle></CardHeader><CardContent>
            {studentRecord ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border"><p className="text-sm text-muted-foreground">الاسم</p><p className="font-medium">{studentRecord.first_name_ar} {studentRecord.last_name_ar}</p></div>
                <div className="p-4 rounded-lg border"><p className="text-sm text-muted-foreground">رقم الطالبة</p><p className="font-medium">{studentRecord.student_number}</p></div>
                <div className="p-4 rounded-lg border"><p className="text-sm text-muted-foreground">المستوى الأكاديمي</p><p className="font-medium">{studentRecord.academic_level ?? "—"}</p></div>
                <div className="p-4 rounded-lg border"><p className="text-sm text-muted-foreground">الحالة</p><Badge variant={studentRecord.status === "active" ? "success" : "warning"}>{enrollmentStatusLabels[studentRecord.status] ?? studentRecord.status}</Badge></div>
                <div className="p-4 rounded-lg border"><p className="text-sm text-muted-foreground">الهاتف</p><p className="font-medium">{studentRecord.mobile ?? "—"}</p></div>
                <div className="p-4 rounded-lg border"><p className="text-sm text-muted-foreground">البريد</p><p className="font-medium">{studentRecord.email ?? "—"}</p></div>
                <div className="p-4 rounded-lg border"><p className="text-sm text-muted-foreground">ولي الأمر</p><p className="font-medium">{studentRecord.guardian_name ?? "—"}</p></div>
                <div className="p-4 rounded-lg border"><p className="text-sm text-muted-foreground">هاتف ولي الأمر</p><p className="font-medium">{studentRecord.guardian_phone ?? "—"}</p></div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground"><User className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لم يتم ربط حسابك بسجل طالبة</p></div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
