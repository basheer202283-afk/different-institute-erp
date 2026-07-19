"use client";

import { useState } from "react";
import { useAttendanceRecords, useAttendanceStats, useDeleteAttendance } from "@/lib/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CalendarCheck, Users, CheckCircle2, XCircle, Clock, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Eye, Edit, Trash2, Plus, Filter
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { AttendanceRecord, AttendanceFilters } from "@/lib/types/attendance";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  present: "success",
  absent: "destructive",
  late: "warning",
  excused: "secondary",
  left_early: "warning",
  holiday: "default",
};

const statusLabels: Record<string, string> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "معذور",
  left_early: "غادر مبكراً",
  holiday: "عطلة",
};

export default function AttendancePage() {
  const [filters, setFilters] = useState<AttendanceFilters>({
    page: 1,
    pageSize: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading, error } = useAttendanceRecords(filters);
  const { data: stats } = useAttendanceStats({ date_from: filters.date_from, date_to: filters.date_to });
  const deleteAttendance = useDeleteAttendance();

  const handleFilter = () => {
    setFilters((prev) => ({
      ...prev,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      await deleteAttendance.mutateAsync(id);
    }
  };

  const records = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الحضور</h1>
          <p className="text-muted-foreground">إدارة حضور الطالبات</p>
        </div>
        <Button asChild>
          <Link href="/attendance/take">
            <Plus className="ml-2 h-4 w-4" /> تسجيل الحضور
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "إجمالي", value: stats?.total ?? 0, icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "حاضر", value: stats?.present ?? 0, icon: CheckCircle2, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
          { label: "غائب", value: stats?.absent ?? 0, icon: XCircle, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
          { label: "متأخر", value: stats?.late ?? 0, icon: Clock, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" },
          { label: "نسبة الحضور", value: `${stats?.attendance_rate ?? 0}%`, icon: CalendarCheck, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex gap-2 flex-1">
              <Input
                type="date"
                placeholder="من تاريخ"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                type="date"
                placeholder="إلى تاريخ"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <Button variant="outline" onClick={handleFilter}>
                <Filter className="ml-2 h-4 w-4" /> تصفية
              </Button>
            </div>
            <div className="flex gap-2">
              {Object.entries(statusLabels).map(([value, label]) => (
                <Button
                  key={value}
                  variant={filters.status === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters((prev) => ({ ...prev, status: prev.status === value ? undefined : value as AttendanceRecord['status'], page: 1 }))}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>سجلات الحضور ({data?.count ?? 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>خطأ في تحميل البيانات</span>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarCheck className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">لا توجد سجلات حضور</h3>
              <p className="mt-1">ابدأ بتسجيل الحضور</p>
              <Button className="mt-4" asChild>
                <Link href="/attendance/take">
                  <Plus className="ml-2 h-4 w-4" /> تسجيل الحضور
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الطالبة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الفصل</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التاريخ</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">وقت الدخول</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">ملاحظات</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {record.student_id?.slice(0, 2)}
                            </div>
                            <span className="text-sm font-mono">{record.student_id?.slice(0, 8)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-mono">{record.class_id?.slice(0, 8)}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(record.attendance_date)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={statusColors[record.status]}>
                            {statusLabels[record.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{record.check_in_time ?? "—"}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground truncate max-w-[200px]">
                          {record.notes ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/attendance/${record.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    عرض {((currentPage - 1) * filters.pageSize!) + 1} إلى{" "}
                    {Math.min(currentPage * filters.pageSize!, data?.count ?? 0)} من{" "}
                    {data?.count ?? 0} سجل
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
