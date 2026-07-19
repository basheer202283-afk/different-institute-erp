"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/lib/hooks/use-tenant";
import { useAuth } from "@/lib/hooks/use-auth";
import { useDashboardStats } from "@/lib/hooks/use-dashboard";
import { formatDate, formatCurrency } from "@/lib/utils";
import { 
  Users, GraduationCap, BookOpen, CreditCard, CalendarCheck, 
  BarChart3, Building2, MapPin, Loader2, Clock, TrendingUp 
} from "lucide-react";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  pending: "warning",
  suspended: "destructive",
  graduated: "default",
  withdrawn: "secondary",
};

export default function DashboardPage() {
  const { organization, branch } = useTenant();
  const { profile } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsCards = [
    { 
      title: "الطالبات", 
      titleEn: "Students", 
      value: stats?.totalStudents ?? 0, 
      icon: Users, 
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" 
    },
    { 
      title: "المدربات", 
      titleEn: "Trainers", 
      value: stats?.totalTrainers ?? 0, 
      icon: GraduationCap, 
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
    },
    { 
      title: "الدورات", 
      titleEn: "Courses", 
      value: stats?.totalCourses ?? 0, 
      icon: BookOpen, 
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
    },
    { 
      title: "الإيرادات", 
      titleEn: "Revenue", 
      value: formatCurrency(stats?.totalRevenue ?? 0), 
      icon: CreditCard, 
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
    },
    { 
      title: "الحضور اليوم", 
      titleEn: "Today Attendance", 
      value: stats?.totalAttendance ?? 0, 
      icon: CalendarCheck, 
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
    },
    { 
      title: "التقارير", 
      titleEn: "Reports", 
      value: "—", 
      icon: BarChart3, 
      color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">
          مرحباً بك {profile?.display_name ? `، ${profile.display_name}` : ''} في نظام إدارة معهد المختلفة
        </p>
      </div>

      {/* Organization & Branch Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {organization && (
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div 
                className="h-12 w-12 rounded-xl flex items-center justify-center" 
                style={{ backgroundColor: organization.brand_color || "#3B82F6" }}
              >
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المنظمة</p>
                <p className="font-semibold">{organization.name}</p>
                <p className="text-xs text-muted-foreground">
                  {organization.city || organization.country}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {branch && (
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الفرع</p>
                <p className="font-semibold">{branch.name}</p>
                <p className="text-xs text-muted-foreground">{branch.code}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((s) => (
          <Card key={s.titleEn} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.titleEn}</p>
                </div>
                <div className={`rounded-xl p-3 ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              آخر الطالبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentStudents && stats.recentStudents.length > 0 ? (
              <div className="space-y-3">
                {stats.recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {student.first_name_ar?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {student.first_name_ar} {student.last_name_ar}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.student_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColors[student.status] ?? "secondary"}>
                        {student.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(student.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                لا توجد طالبات بعد
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              آخر المدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentPayments && stats.recentPayments.length > 0 ? (
              <div className="space-y-3">
                {stats.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.payment_date)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={payment.status === "paid" ? "success" : "warning"}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                لا توجد مدفوعات بعد
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
