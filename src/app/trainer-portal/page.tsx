"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap, Users, CalendarCheck, BookOpen, FileText, BarChart3, Bell, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TrainerPortalPage() {
  const { user, profile, isLoading: authLoading } = useAuth();

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">بوابة المدربة</h1>
            <p className="text-muted-foreground mb-6">سجلي دخولك لعرض جدولك وطالباتك</p>
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
              {(profile?.first_name ?? profile?.display_name ?? "م").charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">مرحباً {profile?.display_name || profile?.first_name || "المدربة"}</h1>
              <p className="text-muted-foreground">بوابة المدربة - إدارة دوراتك وطالباتك</p>
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
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Users className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">—</p><p className="text-xs text-muted-foreground">الطالبات</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><CalendarCheck className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">—</p><p className="text-xs text-muted-foreground">الحصص اليوم</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><Bell className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold">—</p><p className="text-xs text-muted-foreground">إشعارات</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="flex-wrap">
          <TabsTrigger value="schedule"><Clock className="ml-1 h-4 w-4" /> الجدول</TabsTrigger>
          <TabsTrigger value="courses"><BookOpen className="ml-1 h-4 w-4" /> دوراتي</TabsTrigger>
          <TabsTrigger value="students"><Users className="ml-1 h-4 w-4" /> طالباتي</TabsTrigger>
          <TabsTrigger value="attendance"><CalendarCheck className="ml-1 h-4 w-4" /> الحضور</TabsTrigger>
          <TabsTrigger value="grades"><FileText className="ml-1 h-4 w-4" /> الدرجات</TabsTrigger>
          <TabsTrigger value="materials"><FileText className="ml-1 h-4 w-4" /> المواد</TabsTrigger>
          <TabsTrigger value="reports"><BarChart3 className="ml-1 h-4 w-4" /> التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card><CardHeader><CardTitle>جدول اليوم</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد حصص مجدولة اليوم</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card><CardHeader><CardTitle>دوراتي</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>ستظهر دوراتك هنا</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="students">
          <Card><CardHeader><CardTitle>طالباتي</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>ستظهر قائمة طالباتك هنا</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card><CardHeader><CardTitle>تسجيل الحضور</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>اختر دورة لتسجيل الحضور</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card><CardHeader><CardTitle>الدرجات</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>إدارة درجات الطالبات</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card><CardHeader><CardTitle>المواد التعليمية</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>رفع وإدارة المواد التعليمية</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card><CardHeader><CardTitle>التقارير</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>تقارير أداء الطالبات</p>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
