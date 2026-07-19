"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/lib/hooks/use-tenant";
import { useAuth } from "@/lib/hooks/use-auth";
import { Users, GraduationCap, BookOpen, CreditCard, CalendarCheck, BarChart3, Building2, MapPin } from "lucide-react";

const stats = [
  { title: "الطالبات", titleEn: "Students", value: "—", icon: Users, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
  { title: "المدربات", titleEn: "Trainers", value: "—", icon: GraduationCap, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { title: "الدورات", titleEn: "Courses", value: "—", icon: BookOpen, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { title: "الإيرادات", titleEn: "Revenue", value: "—", icon: CreditCard, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  { title: "الحضور", titleEn: "Attendance", value: "—", icon: CalendarCheck, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  { title: "التقارير", titleEn: "Reports", value: "—", icon: BarChart3, color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" },
];

export default function DashboardPage() {
  const { organization, branch } = useTenant();
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">مرحباً بك في نظام إدارة معهد المختلفة</p>
      </div>

      {/* Organization & Branch Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {organization && (
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: organization.brand_color || "#3B82F6" }}>
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المنظمة</p>
                <p className="font-semibold">{organization.name}</p>
                <p className="text-xs text-muted-foreground">{organization.city || organization.country}</p>
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
        {stats.map((s) => (
          <Card key={s.titleEn} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.titleEn}</p>
                </div>
                <div className={`rounded-xl p-3 ${s.color}`}><s.icon className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>آخر النشاطات</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground text-center py-8">لا توجد نشاطات بعد</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>المهام القادمة</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground text-center py-8">لا توجد مهام قادمة</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
