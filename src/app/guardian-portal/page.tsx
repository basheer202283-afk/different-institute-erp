"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, CalendarCheck, Award, CreditCard, Bell, MessageSquare, Loader2, GraduationCap, BookOpen } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  active: "success", pending: "warning", suspended: "destructive", graduated: "default", withdrawn: "secondary",
};
const statusLabels: Record<string, string> = { active: "نشطة", pending: "قيد الانتظار", suspended: "معلقة", graduated: "متخرجة", withdrawn: "منسحبة" };

export default function GuardianPortalPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  // Find students linked to this guardian
  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ["portal-guardian-children", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Find by guardian_phone matching user's phone, or by guardian_email
      const { data: byUser } = await supabase.from("students").select("id, student_number, first_name_ar, last_name_ar, status, academic_level, guardian_name, guardian_phone, mobile, email").eq("user_id", user.id).is("deleted_at", null);
      if (byUser && (byUser as any[]).length > 0) return byUser as any[];
      // Fallback: match by guardian info in profile
      if (profile?.phone) {
        const { data: byPhone } = await supabase.from("students").select("id, student_number, first_name_ar, last_name_ar, status, academic_level, guardian_name, guardian_phone, mobile, email").eq("guardian_phone", profile.phone).is("deleted_at", null);
        if (byPhone && (byPhone as any[]).length > 0) return byPhone as any[];
      }
      return [];
    },
    enabled: !!user,
  });

  const childIds = (children ?? []).map(c => c.id);

  // Fetch enrollments for children
  const { data: enrollments } = useQuery({
    queryKey: ["portal-guardian-enrollments", childIds.join(",")],
    queryFn: async () => {
      if (childIds.length === 0) return [];
      const { data } = await supabase.from("student_enrollments").select("id, student_id, course_id, status, total_fees, paid_amount, enrollment_date").in("student_id", childIds).is("deleted_at", null).order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: childIds.length > 0,
  });

  // Fetch certificates for children
  const { data: certificates } = useQuery({
    queryKey: ["portal-guardian-certificates", childIds.join(",")],
    queryFn: async () => {
      if (childIds.length === 0) return [];
      const { data } = await supabase.from("certificates").select("id, student_id, title, certificate_number, status, issue_date").in("student_id", childIds).is("deleted_at", null).order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: childIds.length > 0,
  });

  const firstChild = (children ?? [])[0];
  const childEnrollments = (enrollments ?? []).filter(e => e.student_id === firstChild?.id);
  const childCerts = (certificates ?? []).filter(c => c.student_id === firstChild?.id);
  const totalFees = childEnrollments.reduce((sum, e) => sum + (Number(e.total_fees) || 0), 0);
  const totalPaid = childEnrollments.reduce((sum, e) => sum + (Number(e.paid_amount) || 0), 0);

  if (authLoading || childrenLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="max-w-md w-full mx-4"><CardContent className="p-8 text-center">
        <Users className="h-16 w-16 mx-auto mb-4 text-primary" /><h1 className="text-2xl font-bold mb-2">بوابة ولي الأمر</h1>
        <p className="text-muted-foreground mb-6">تابع أداء ابنتك الأكاديمي</p>
        <Button asChild className="w-full"><Link href="/login">تسجيل الدخول</Link></Button>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card><CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {(profile?.first_name ?? "و").charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">مرحباً {profile?.display_name || profile?.first_name || "ولي الأمر"}</h1>
            <p className="text-muted-foreground">بوابة ولي الأمر - متابعة أداء ابنتك</p>
          </div>
        </div>
      </CardContent></Card>

      {/* Children */}
      {(children ?? []).length > 0 && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> الأبناء</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">
            {(children ?? []).map(child => (
              <div key={child.id} className="p-4 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">{(child.first_name_ar ?? "?").charAt(0)}</div>
                  <div>
                    <p className="text-lg font-semibold">{child.first_name_ar} {child.last_name_ar}</p>
                    <p className="text-sm text-muted-foreground">رقم: {child.student_number} • المستوى: {child.academic_level ?? "—"}</p>
                  </div>
                </div>
                <Badge variant={statusColors[child.status] ?? "secondary"}>{statusLabels[child.status] ?? child.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}

      {/* Stats for first child */}
      {firstChild && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><BookOpen className="h-5 w-5 text-blue-600" /></div>
              <div><p className="text-2xl font-bold">{childEnrollments.length}</p><p className="text-xs text-muted-foreground">التسجيلات</p></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Award className="h-5 w-5 text-green-600" /></div>
              <div><p className="text-2xl font-bold">{childCerts.length}</p><p className="text-xs text-muted-foreground">الشهادات</p></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><CreditCard className="h-5 w-5 text-purple-600" /></div>
              <div><p className="text-2xl font-bold">{formatCurrency(totalFees)}</p><p className="text-xs text-muted-foreground">الرسوم</p></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><CreditCard className="h-5 w-5 text-red-600" /></div>
              <div><p className="text-2xl font-bold">{formatCurrency(Math.max(0, totalFees - totalPaid))}</p><p className="text-xs text-muted-foreground">المستحق</p></div>
            </div>
          </CardContent></Card>
        </div>
      )}

      <Tabs defaultValue="enrollments">
        <TabsList className="flex-wrap">
          <TabsTrigger value="enrollments"><BookOpen className="ml-1 h-4 w-4" /> التسجيلات</TabsTrigger>
          <TabsTrigger value="certificates"><Award className="ml-1 h-4 w-4" /> الشهادات</TabsTrigger>
          <TabsTrigger value="communication"><MessageSquare className="ml-1 h-4 w-4" /> التواصل</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <Card><CardHeader><CardTitle>تسجيلات {firstChild?.first_name_ar}</CardTitle></CardHeader><CardContent>
            {childEnrollments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لا توجد تسجيلات</p></div>
            ) : (
              <div className="space-y-3">
                {childEnrollments.map(enr => (
                  <div key={enr.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="font-medium">الدورة: {enr.course_id?.substring(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">تاريخ التسجيل: {formatDate(enr.enrollment_date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={enr.status === "active" ? "success" : enr.status === "completed" ? "default" : "warning"}>{enr.status}</Badge>
                      <span className="text-sm">{formatCurrency(enr.total_fees)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card><CardHeader><CardTitle>شهادات {firstChild?.first_name_ar}</CardTitle></CardHeader><CardContent>
            {childCerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><Award className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لا توجد شهادات</p></div>
            ) : (
              <div className="space-y-3">
                {childCerts.map(cert => (
                  <div key={cert.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="font-medium">{cert.title}</p>
                      <p className="text-sm text-muted-foreground font-mono">{cert.certificate_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={cert.status === "active" ? "success" : "secondary"}>{cert.status}</Badge>
                      {cert.issue_date && <span className="text-xs text-muted-foreground">{formatDate(cert.issue_date)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card><CardHeader><CardTitle>التواصل مع المعهد</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium mb-2">إرسال رسالة</p>
              <textarea className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="اكتب رسالتك هنا..." />
              <Button className="mt-2"><MessageSquare className="ml-2 h-4 w-4" /> إرسال</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
