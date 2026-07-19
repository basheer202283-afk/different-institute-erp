"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, CalendarCheck, Award, CreditCard, Bell, MessageSquare, Loader2, GraduationCap, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function GuardianPortalPage() {
  const { user, profile, isLoading: authLoading } = useAuth();

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">بوابة ولي الأمر</h1>
            <p className="text-muted-foreground mb-6">تابع أداء ابنتك الأكاديمي</p>
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
              {(profile?.first_name ?? profile?.display_name ?? "و").charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">مرحباً {profile?.display_name || profile?.first_name || "ولي الأمر"}</h1>
              <p className="text-muted-foreground">بوابة ولي الأمر - متابعة أداء ابنتك</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Overview Card */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> بيانات الطالبة</CardTitle></CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">ط</div>
              <div>
                <p className="text-lg font-semibold">الطالبة</p>
                <p className="text-sm text-muted-foreground">ستظهر بيانات ابنتك هنا بعد ربط الحساب</p>
              </div>
              <Badge variant="success" className="mr-auto">نشطة</Badge>
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
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">—%</p><p className="text-xs text-muted-foreground">نسبة الحضور</p></div>
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
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><CreditCard className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold">—</p><p className="text-xs text-muted-foreground">المستحق</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList className="flex-wrap">
          <TabsTrigger value="attendance"><CalendarCheck className="ml-1 h-4 w-4" /> الحضور</TabsTrigger>
          <TabsTrigger value="grades"><Award className="ml-1 h-4 w-4" /> الدرجات</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="ml-1 h-4 w-4" /> المدفوعات</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="ml-1 h-4 w-4" /> الإشعارات</TabsTrigger>
          <TabsTrigger value="communication"><MessageSquare className="ml-1 h-4 w-4" /> التواصل</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card><CardHeader><CardTitle>سجل الحضور</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>سيظهر سجل حضور ابنتك هنا</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card><CardHeader><CardTitle>الدرجات والنتائج</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ستظهر درجات ابنتك هنا</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card><CardHeader><CardTitle>المدفوعات والرسوم</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ستظهر المدفوعات والرسوم هنا</p>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card><CardHeader><CardTitle>الإشعارات</CardTitle></CardHeader><CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ستظهر الإشعارات هنا</p>
            </div>
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
