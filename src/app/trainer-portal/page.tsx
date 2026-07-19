"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap, Users, CalendarCheck, BookOpen, FileText, BarChart3, Bell, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function TrainerPortalPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  // Find trainer record linked to this user
  const { data: trainerRecord, isLoading: trainerLoading } = useQuery({
    queryKey: ["portal-trainer", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("trainers").select("id, first_name, last_name, email, phone, specialization, status").eq("user_id", user.id).is("deleted_at", null).single();
      return data as any;
    },
    enabled: !!user,
  });

  const trainerId = trainerRecord?.id;

  // Fetch trainer's courses
  const { data: trainerCourses } = useQuery({
    queryKey: ["portal-trainer-courses", trainerId],
    queryFn: async () => {
      if (!trainerId) return [];
      const { data } = await supabase.from("courses").select("id, name, code, status, max_students, price, duration_hours").eq("instructor_id", trainerId).is("deleted_at", null).order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: !!trainerId,
  });

  // Fetch trainer's classes
  const { data: trainerClasses } = useQuery({
    queryKey: ["portal-trainer-classes", trainerId],
    queryFn: async () => {
      if (!trainerId) return [];
      const { data } = await supabase.from("classes").select("id, name, code, status, max_students, current_students, course_id, start_date, end_date").eq("instructor_id", trainerId).is("deleted_at", null).order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: !!trainerId,
  });

  // Fetch today's classes
  const today = new Date().toISOString().split("T")[0];
  const { data: todaySessions } = useQuery({
    queryKey: ["portal-trainer-sessions", trainerId, today],
    queryFn: async () => {
      if (!trainerId) return [];
      const { data } = await supabase.from("class_sessions").select("id, title, session_date, start_time, end_time, room, class_id, status").eq("instructor_id", trainerId).eq("session_date", today).is("deleted_at", null).order("start_time");
      return (data ?? []) as any[];
    },
    enabled: !!trainerId,
  });

  const activeCourses = (trainerCourses ?? []).filter(c => c.status === "active");
  const totalStudents = (trainerClasses ?? []).reduce((sum, c) => sum + (c.current_students || 0), 0);

  if (authLoading || trainerLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="max-w-md w-full mx-4"><CardContent className="p-8 text-center">
        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" /><h1 className="text-2xl font-bold mb-2">بوابة المدربة</h1>
        <p className="text-muted-foreground mb-6">سجلي دخولك لعرض جدولك وطالباتك</p>
        <Button asChild className="w-full"><Link href="/login">تسجيل الدخول</Link></Button>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card><CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {(trainerRecord?.first_name ?? profile?.first_name ?? "م").charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">مرحباً {trainerRecord ? `${trainerRecord.first_name} ${trainerRecord.last_name}` : profile?.display_name || "المدربة"}</h1>
            <p className="text-muted-foreground">بوابة المدربة {trainerRecord?.specialization ? `• ${trainerRecord.specialization}` : ""}</p>
          </div>
        </div>
      </CardContent></Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><BookOpen className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{activeCourses.length}</p><p className="text-xs text-muted-foreground">الدورات النشطة</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Users className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{totalStudents}</p><p className="text-xs text-muted-foreground">الطالبات</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><CalendarCheck className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{(todaySessions ?? []).length}</p><p className="text-xs text-muted-foreground">حصص اليوم</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold">{(trainerClasses ?? []).length}</p><p className="text-xs text-muted-foreground">الفصول</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="flex-wrap">
          <TabsTrigger value="schedule"><Clock className="ml-1 h-4 w-4" /> جدول اليوم</TabsTrigger>
          <TabsTrigger value="courses"><BookOpen className="ml-1 h-4 w-4" /> دوراتي</TabsTrigger>
          <TabsTrigger value="students"><Users className="ml-1 h-4 w-4" /> فصولي</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card><CardHeader><CardTitle>جدول اليوم - {formatDate(today)}</CardTitle></CardHeader><CardContent>
            {(todaySessions ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><Clock className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لا توجد حصص مجدولة اليوم</p></div>
            ) : (
              <div className="space-y-3">
                {(todaySessions ?? []).map(session => (
                  <div key={session.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="font-medium">{session.title ?? "حصة"}</p>
                        <p className="text-sm text-muted-foreground">{session.start_time} - {session.end_time} {session.room ? `• ${session.room}` : ""}</p>
                      </div>
                    </div>
                    <Badge variant={session.status === "completed" ? "success" : session.status === "cancelled" ? "destructive" : "default"}>{session.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card><CardHeader><CardTitle>دوراتي</CardTitle></CardHeader><CardContent>
            {(trainerCourses ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لا توجد دورات مسندة إليك</p></div>
            ) : (
              <div className="space-y-3">
                {(trainerCourses ?? []).map(course => (
                  <div key={course.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="font-medium">{course.name}</p>
                      <p className="text-sm text-muted-foreground">{course.code} {course.duration_hours ? `• ${course.duration_hours} ساعة` : ""}</p>
                    </div>
                    <Badge variant={course.status === "active" ? "success" : "secondary"}>{course.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="students">
          <Card><CardHeader><CardTitle>فصولي</CardTitle></CardHeader><CardContent>
            {(trainerClasses ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لا توجد فصول مسندة إليك</p></div>
            ) : (
              <div className="space-y-3">
                {(trainerClasses ?? []).map(cls => (
                  <div key={cls.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">{cls.code} • {cls.current_students}/{cls.max_students ?? "∞"} طالبة</p>
                    </div>
                    <Badge variant={cls.status === "active" ? "success" : "secondary"}>{cls.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
