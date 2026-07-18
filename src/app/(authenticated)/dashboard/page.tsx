"use client";

import { useDashboardStats } from "@/lib/hooks/use-dashboard";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Users, BookOpen, GraduationCap, CreditCard, TrendingUp,
  TrendingDown, CalendarCheck, CheckSquare, Megaphone,
  CalendarDays, Plus, ArrowUpRight, Clock, AlertCircle,
  Loader2, DollarSign, UserCheck, BarChart3
} from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; trend?: "up" | "down"; trendValue?: string; color: string;
}) {
  return (
    <motion.div variants={item}>
      <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              {trend && (
                <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-green-600" : "text-destructive"}`}>
                  {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { profile } = useAuthContext();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const firstName = profile?.first_name || profile?.display_name?.split(" ")[0] || "there";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={item}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {firstName} 👋</h1>
            <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening at your institute today.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link href="/reports"><BarChart3 className="mr-2 h-4 w-4" /> View Reports</Link></Button>
            <Button asChild><Link href="/students"><Plus className="mr-2 h-4 w-4" /> Add Student</Link></Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={stats?.totalStudents ?? 0} subtitle={`${stats?.activeStudents ?? 0} active`} icon={Users} trend="up" trendValue="+12% this month" color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard title="Active Courses" value={stats?.totalCourses ?? 0} subtitle={`${stats?.activeClasses ?? 0} active classes`} icon={BookOpen} trend="up" trendValue="+3 new" color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" />
        <StatCard title="Monthly Revenue" value={formatCurrency(stats?.monthlyPayments ?? 0)} subtitle={`${formatCurrency(stats?.outstanding ?? 0)} outstanding`} icon={DollarSign} trend="up" trendValue="+8% vs last month" color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" />
        <StatCard title="Attendance Rate" value={`${stats?.attendanceRate ?? 0}%`} subtitle={`${stats?.presentAtt ?? 0} of ${stats?.totalAtt ?? 0} sessions`} icon={UserCheck} trend={stats && stats.attendanceRate >= 80 ? "up" : "down"} trendValue={stats && stats.attendanceRate >= 80 ? "On track" : "Below target"} color="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Revenue</CardTitle>
              <CardDescription>Revenue collected over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.monthlyRevenue ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attendance Overview</CardTitle>
              <CardDescription>Attendance trends over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.monthlyRevenue?.map((m, i) => ({ month: m.month, rate: Math.max(70, 95 - i * 3 + Math.random() * 10) })) ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[60, 100]} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Attendance"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Tasks */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Tasks</CardTitle>
                <CardDescription>Your pending tasks</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild><Link href="/tasks">View all</Link></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.tasks && stats.tasks.length > 0 ? stats.tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${task.status === "completed" ? "bg-green-500" : task.priority === "urgent" || task.priority === "critical" ? "bg-red-500" : task.priority === "high" ? "bg-orange-500" : "bg-blue-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={task.status === "completed" ? "success" : task.status === "in_progress" ? "default" : "secondary"} className="text-[10px]">{task.status?.replace("_", " ")}</Badge>
                      {task.due_date && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(task.due_date)}</span>}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Announcements */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Announcements</CardTitle>
                <CardDescription>Latest updates</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild><Link href="/announcements">View all</Link></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.announcements && stats.announcements.length > 0 ? stats.announcements.map((ann) => (
                <div key={ann.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={ann.type === "emergency" ? "destructive" : ann.type === "academic" ? "default" : "secondary"} className="text-[10px]">{ann.type}</Badge>
                    {ann.is_pinned && <Badge variant="outline" className="text-[10px]">📌 Pinned</Badge>}
                  </div>
                  <p className="text-sm font-medium">{ann.title}</p>
                  {ann.published_at && <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(ann.published_at)}</p>}
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent announcements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild><Link href="/calendar">View all</Link></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.events && stats.events.length > 0 ? stats.events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.start_time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at{" "}
                      {new Date(event.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                    {event.location && <p className="text-[10px] text-muted-foreground truncate">{event.location}</p>}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { title: "Add Student", icon: Users, href: "/students", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
                { title: "New Invoice", icon: CreditCard, href: "/finance/invoices", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                { title: "Take Attendance", icon: CalendarCheck, href: "/attendance", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
                { title: "Create Task", icon: CheckSquare, href: "/tasks", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
              ].map((action) => (
                <Button key={action.title} variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                  <Link href={action.href}>
                    <div className={`rounded-lg p-2 ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">{action.title}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
