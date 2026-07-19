"use client";

import { useState } from "react";
import { useStudentReport, useFinancialReport, useAttendanceReport, useEnrollmentReport, useTrainerReport } from "@/lib/hooks/use-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BarChart3, Users, CreditCard, CalendarCheck, ClipboardList, GraduationCap, TrendingUp, Download, Printer, Filter, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const [tab, setTab] = useState("students");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const filters = { date_from: dateFrom || undefined, date_to: dateTo || undefined };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">التقارير</h1>
          <p className="text-muted-foreground">تقارير وإحصائيات المعهد</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="ml-2 h-4 w-4" /> طباعة</Button>
        </div>
      </div>

      {/* Date Filter */}
      <Card><CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2 items-center">
            <span className="text-sm">من:</span>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-auto" />
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm">إلى:</span>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-auto" />
          </div>
          {(dateFrom || dateTo) && <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); }}>مسح الفلتر</Button>}
        </div>
      </CardContent></Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="students"><Users className="ml-1 h-4 w-4" /> الطالبات</TabsTrigger>
          <TabsTrigger value="finance"><CreditCard className="ml-1 h-4 w-4" /> المالية</TabsTrigger>
          <TabsTrigger value="attendance"><CalendarCheck className="ml-1 h-4 w-4" /> الحضور</TabsTrigger>
          <TabsTrigger value="enrollment"><ClipboardList className="ml-1 h-4 w-4" /> التسجيلات</TabsTrigger>
          <TabsTrigger value="trainers"><GraduationCap className="ml-1 h-4 w-4" /> المدربات</TabsTrigger>
        </TabsList>

        <TabsContent value="students"><StudentReportTab filters={filters} /></TabsContent>
        <TabsContent value="finance"><FinanceReportTab filters={filters} /></TabsContent>
        <TabsContent value="attendance"><AttendanceReportTab filters={filters} /></TabsContent>
        <TabsContent value="enrollment"><EnrollmentReportTab filters={filters} /></TabsContent>
        <TabsContent value="trainers"><TrainerReportTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}><Icon className="h-5 w-5" /></div>
        <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{title}</p></div>
      </div>
    </CardContent></Card>
  );
}

function BarDisplay({ data, title, color = "bg-primary" }: { data: Record<string, number>; title: string; color?: string }) {
  const entries = Object.entries(data).slice(0, 12);
  if (entries.length === 0) return null;
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <Card><CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
    <CardContent>
      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-20 truncate">{key}</span>
            <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <span className="text-sm font-medium w-12 text-left">{value}</span>
          </div>
        ))}
      </div>
    </CardContent></Card>
  );
}

function StudentReportTab({ filters }: { filters: { date_from?: string; date_to?: string } }) {
  const { data, isLoading } = useStudentReport(filters);
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KPICard title="إجمالي الطالبات" value={data.total_students} icon={Users} color="bg-blue-100 dark:bg-blue-900/30" />
        <KPICard title="نشط" value={data.active} icon={Users} color="bg-green-100 dark:bg-green-900/30" />
        <KPICard title="قيد الانتظار" value={data.pending} icon={Users} color="bg-yellow-100 dark:bg-yellow-900/30" />
        <KPICard title="متخرج" value={data.graduated} icon={GraduationCap} color="bg-purple-100 dark:bg-purple-900/30" />
        <KPICard title="منسحب" value={data.withdrawn} icon={Users} color="bg-red-100 dark:bg-red-900/30" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <BarDisplay data={data.by_gender} title="حسب الجنس" />
        <BarDisplay data={data.by_nationality} title="حسب الجنسية" color="bg-blue-500" />
      </div>
      <BarDisplay data={data.by_month} title="التسجيلات الشهرية" color="bg-green-500" />
    </div>
  );
}

function FinanceReportTab({ filters }: { filters: { date_from?: string; date_to?: string } }) {
  const { data, isLoading } = useFinancialReport(filters);
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data) return null;

  const monthlyData: Record<string, number> = {};
  for (const [k, v] of Object.entries(data.by_month)) monthlyData[k] = v.revenue;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard title="إجمالي الإيرادات" value={formatCurrency(data.total_revenue)} icon={CreditCard} color="bg-green-100 dark:bg-green-900/30" />
        <KPICard title="المحصّل" value={formatCurrency(data.collected)} icon={CreditCard} color="bg-blue-100 dark:bg-blue-900/30" />
        <KPICard title="المستحق" value={formatCurrency(data.outstanding)} icon={CreditCard} color="bg-red-100 dark:bg-red-900/30" />
        <KPICard title="الخصومات" value={formatCurrency(data.discounts)} icon={CreditCard} color="bg-yellow-100 dark:bg-yellow-900/30" />
      </div>
      <BarDisplay data={monthlyData} title="الإيرادات الشهرية" color="bg-green-500" />
    </div>
  );
}

function AttendanceReportTab({ filters }: { filters: { date_from?: string; date_to?: string } }) {
  const { data, isLoading } = useAttendanceReport(filters);
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data) return null;

  const monthlyRates: Record<string, number> = {};
  for (const [k, v] of Object.entries(data.by_month)) monthlyRates[k] = v.rate;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KPICard title="إجمالي السجلات" value={data.total_records} icon={CalendarCheck} color="bg-blue-100 dark:bg-blue-900/30" />
        <KPICard title="حاضر" value={data.present} icon={CalendarCheck} color="bg-green-100 dark:bg-green-900/30" />
        <KPICard title="غائب" value={data.absent} icon={CalendarCheck} color="bg-red-100 dark:bg-red-900/30" />
        <KPICard title="متأخر" value={data.late} icon={CalendarCheck} color="bg-yellow-100 dark:bg-yellow-900/30" />
        <KPICard title="نسبة الحضور" value={`${data.attendance_rate}%`} icon={TrendingUp} color="bg-purple-100 dark:bg-purple-900/30" />
      </div>
      <BarDisplay data={monthlyRates} title="نسبة الحضور الشهرية %" color="bg-green-500" />
    </div>
  );
}

function EnrollmentReportTab({ filters }: { filters: { date_from?: string; date_to?: string } }) {
  const { data, isLoading } = useEnrollmentReport(filters);
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard title="إجمالي التسجيلات" value={data.total_enrollments} icon={ClipboardList} color="bg-blue-100 dark:bg-blue-900/30" />
        <KPICard title="نشط" value={data.active} icon={ClipboardList} color="bg-green-100 dark:bg-green-900/30" />
        <KPICard title="مكتمل" value={data.completed} icon={ClipboardList} color="bg-purple-100 dark:bg-purple-900/30" />
        <KPICard title="ملغي" value={data.cancelled} icon={ClipboardList} color="bg-red-100 dark:bg-red-900/30" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <BarDisplay data={data.by_status} title="حسب الحالة" />
        <BarDisplay data={data.by_month} title="التسجيلات الشهرية" color="bg-blue-500" />
      </div>
    </div>
  );
}

function TrainerReportTab() {
  const { data, isLoading } = useTrainerReport();
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <KPICard title="إجمالي المدربات" value={data.total_trainers} icon={GraduationCap} color="bg-blue-100 dark:bg-blue-900/30" />
        <KPICard title="نشط" value={data.active} icon={GraduationCap} color="bg-green-100 dark:bg-green-900/30" />
      </div>
      <BarDisplay data={data.by_specialization} title="حسب التخصص" color="bg-indigo-500" />
    </div>
  );
}
