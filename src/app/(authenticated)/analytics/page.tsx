"use client";

import { useFinanceStats } from "@/lib/hooks/use-finance";
import { useStudentStats } from "@/lib/hooks/use-students";
import { useAttendanceStats } from "@/lib/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, DollarSign, CalendarCheck, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const { data: finance, isLoading: loadingFinance } = useFinanceStats();
  const { data: students, isLoading: loadingStudents } = useStudentStats();
  const { data: attendance, isLoading: loadingAttendance } = useAttendanceStats();
  const isLoading = loadingFinance || loadingStudents || loadingAttendance;

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const kpis = [
    { label: "Total Students", value: String(students?.total ?? 0), change: "+12%", positive: true, icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
    { label: "Active Students", value: String(students?.active ?? 0), change: "+8%", positive: true, icon: Users, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
    { label: "Total Revenue", value: formatCurrency(finance?.totalRevenue ?? 0), change: "+15%", positive: true, icon: DollarSign, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { label: "Outstanding", value: formatCurrency(finance?.outstanding ?? 0), change: "-5%", positive: true, icon: DollarSign, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
    { label: "This Month Collections", value: formatCurrency(finance?.thisMonth ?? 0), change: "+22%", positive: true, icon: TrendingUp, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
    { label: "Attendance Rate", value: `${attendance?.rate ?? 0}%`, change: attendance && attendance.rate >= 80 ? "On track" : "Below target", positive: attendance ? attendance.rate >= 80 : false, icon: CalendarCheck, color: "text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400" },
    { label: "Overdue Invoices", value: String(finance?.overdueCount ?? 0), change: finance && finance.overdueCount === 0 ? "None" : "Needs attention", positive: finance ? finance.overdueCount === 0 : true, icon: BarChart3, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
    { label: "Today's Attendance", value: String(attendance?.total ?? 0), change: `${attendance?.present ?? 0} present`, positive: true, icon: CalendarCheck, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Analytics</h1><p className="text-muted-foreground">Key performance indicators and analytics</p></div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`rounded-lg p-2 ${kpi.color}`}><kpi.icon className="h-5 w-5" /></div>
                <span className={`text-xs font-medium ${kpi.positive ? "text-green-600" : "text-red-600"}`}>{kpi.change}</span>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Financial Summary</CardTitle><CardDescription>Revenue and collections overview</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Total Revenue", value: formatCurrency(finance?.totalRevenue ?? 0), bar: 100 },
              { label: "Collected", value: formatCurrency(finance?.totalPaid ?? 0), bar: finance?.totalRevenue ? Math.round((finance.totalPaid / finance.totalRevenue) * 100) : 0 },
              { label: "Outstanding", value: formatCurrency(finance?.outstanding ?? 0), bar: finance?.totalRevenue ? Math.round((finance.outstanding / finance.totalRevenue) * 100) : 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(item.bar, 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Student Distribution</CardTitle><CardDescription>Student status breakdown</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Active", value: students?.active ?? 0, total: students?.total ?? 1, color: "bg-green-500" },
              { label: "Pending", value: students?.pending ?? 0, total: students?.total ?? 1, color: "bg-yellow-500" },
              { label: "On Leave", value: students?.onLeave ?? 0, total: students?.total ?? 1, color: "bg-orange-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium">{item.value} students</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Attendance Overview</CardTitle><CardDescription>Today&apos;s attendance statistics</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Present", value: attendance?.present ?? 0, total: attendance?.total ?? 1, color: "bg-green-500" },
              { label: "Absent", value: attendance?.absent ?? 0, total: attendance?.total ?? 1, color: "bg-red-500" },
              { label: "Late", value: attendance?.late ?? 0, total: attendance?.total ?? 1, color: "bg-yellow-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Stats</CardTitle><CardDescription>Key metrics at a glance</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Total Invoices", value: String(finance?.invoiceCount ?? 0) },
              { label: "Total Payments", value: String(finance?.paymentCount ?? 0) },
              { label: "Collection Rate", value: finance?.totalRevenue ? `${Math.round((finance.totalPaid / finance.totalRevenue) * 100)}%` : "0%" },
              { label: "Attendance Rate", value: `${attendance?.rate ?? 0}%` },
              { label: "Student Count", value: String(students?.total ?? 0) },
              { label: "Active Rate", value: students?.total ? `${Math.round((students.active / students.total) * 100)}%` : "0%" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
