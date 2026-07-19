"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, CalendarCheck, Award, CreditCard, Bell, Download, User, Loader2, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useStudentEnrollments } from "@/lib/hooks/use-enrollments";
import { useStudentCertificates } from "@/lib/hooks/use-certificates";

export default function StudentPortalPage() {
  const { user, profile, isLoading: authLoading } = useAuth();

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">بوابة الطالبة</h1>
            <p className="text-muted-foreground mb-6">سجلي دخولك لعرض بياناتك الأكاديمية</p>
            <Button asChild className="w-full"><Link href="/login">تسجيل الدخول</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {(profile?.first_name ?? profile?.display_name ?? "ط").charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">مرحباً {profile?.display_name || profile?.first_name || "الطالبة"}</h1>
              <p className="text-muted-foreground">بوابة الطالبة - عرض بياناتك الأكاديمية</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><BookOpen className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">—</p><p className="text-xs text-muted-foreground">الدورات</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><CalendarCheck className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">—</p><p className="text-xs text-muted-foreground">الحضور</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Award className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">—</p><p className="text-xs text-muted-foreground">الشهادات</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><CreditCard className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold">—</p><p className="text-xs text-muted-foreground">المالية</p></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="courses">
        <TabsList className="flex-wrap">
          <TabsTrigger value="courses"><BookOpen className="ml-1 h-4 w-4" /> دوراتي</TabsTrigger>
          <TabsTrigger value="attendance"><CalendarCheck className="ml-1 h-4 w-4" /> الحضور</TabsTrigger>
          <TabsTrigger value="certificates"><Award className="ml-1 h-4 w-4" /> الشهادات</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="ml-1 h-4 w-4" /> المدفوعات</TabsTrigger>
          <TabsTrigger value="profile"><User className="ml-1 h-4 w-4" /> الملف الشخصي</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card>
            <CardHeader><CardTitle>دوراتي</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ستظهر دوراتك هنا بعد تسجيلك</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader><CardTitle>سجل الحضور</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>سيظهر سجل حضورك هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader><CardTitle>شهاداتي</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ستظهر شهاداتك هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader><CardTitle>المدفوعات</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ستظهر مدفوعاتك هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>الملف الشخصي</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-medium">{profile?.display_name || `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`}</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">{user.email ?? "—"}</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">الهاتف</p>
                  <p className="font-medium">{profile?.phone ?? "—"}</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">الدور</p>
                  <Badge>{profile?.role ?? "—"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
