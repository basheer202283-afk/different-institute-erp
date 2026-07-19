"use client";

import { useState, useMemo } from "react";
import { useStudents, useStudentStats, useDeleteStudent } from "@/lib/hooks/use-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/use-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Users, Plus, Search, Download, Filter, ChevronLeft, ChevronRight,
  Loader2, MoreHorizontal, Eye, Edit, Trash2, UserPlus, GraduationCap,
  Clock, AlertCircle, CheckCircle2, XCircle, ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import type { StudentStatus } from "@/lib/types/student";

const statusConfig: Record<StudentStatus, { label: string; labelAr: string; color: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "outline" }> = {
  active: { label: "Active", labelAr: "نشط", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", variant: "success" },
  pending: { label: "Pending", labelAr: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", variant: "warning" },
  suspended: { label: "Suspended", labelAr: "معلق", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", variant: "destructive" },
  graduated: { label: "Graduated", labelAr: "متخرج", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", variant: "default" },
  withdrawn: { label: "Withdrawn", labelAr: "منسحب", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", variant: "secondary" },
};

export default function StudentsPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StudentStatus | "all">("all");
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const pageSize = 20;

  const { data: studentsData, isLoading } = useStudents({ search, status: status, page, pageSize, sortBy, sortOrder });
  const { data: stats } = useStudentStats();
  const deleteStudent = useDeleteStudent();

  const students = studentsData?.data ?? [];
  const totalCount = studentsData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Student Number", "Name (AR)", "Name (EN)", "Status", "Mobile", "Email", "Registration Date"];
    const rows = students.map((s) => [
      s.student_number,
      `${s.first_name_ar ?? ""} ${s.last_name_ar ?? ""}`.trim(),
      `${s.first_name_en ?? ""} ${s.last_name_en ?? ""}`.trim(),
      s.status,
      s.mobile ?? "",
      s.email ?? "",
      s.registration_date ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">الطالبات</h1>
          <p className="text-muted-foreground">إدارة بيانات الطالبات</p>
        </div>
        <div className="flex gap-2">
          {can(PERMISSIONS.STUDENTS_EXPORT) && (
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="ml-2 h-4 w-4" /> تصدير
            </Button>
          )}
          {can(PERMISSIONS.STUDENTS_CREATE) && (
            <Button size="sm" asChild>
              <Link href="/students/new"><Plus className="ml-2 h-4 w-4" /> إضافة طالبة</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "إجمالي الطالبات", value: stats?.total ?? 0, icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "النشطة", value: stats?.active ?? 0, icon: CheckCircle2, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
          { label: "قيد الانتظار", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" },
          { label: "المتخرجات", value: stats?.graduated ?? 0, icon: GraduationCap, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "المنسحبات", value: stats?.withdrawn ?? 0, icon: XCircle, color: "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.color}`}><s.icon className="h-5 w-5" /></div>
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
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم، الرقم، الهاتف، الهوية..."
                className="pr-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "active", "pending", "graduated", "suspended", "withdrawn"] as const).map((s) => (
                <Button
                  key={s}
                  variant={status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setStatus(s); setPage(0); }}
                >
                  {s === "all" ? "الكل" : statusConfig[s]?.labelAr ?? s}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">قائمة الطالبات ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : students.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {[
                        { key: "student_number", label: "رقم الطالبة" },
                        { key: "first_name_ar", label: "الاسم (عربي)" },
                        { key: "first_name_en", label: "الاسم (إنجليزي)" },
                        { key: "status", label: "الحالة" },
                        { key: "mobile", label: "الهاتف" },
                        { key: "registration_date", label: "تاريخ التسجيل" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground"
                          onClick={() => handleSort(col.key)}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                      ))}
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {student.first_name_ar?.charAt(0) ?? student.student_number?.charAt(0) ?? "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{student.student_number}</p>
                              {student.registration_number && (
                                <p className="text-xs text-muted-foreground">{student.registration_number}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {student.first_name_ar} {student.last_name_ar}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {student.first_name_en} {student.last_name_en}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusConfig[student.status]?.variant ?? "secondary"}>
                            {statusConfig[student.status]?.labelAr ?? student.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{student.mobile ?? "—"}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {student.registration_date ? formatDate(student.registration_date) : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {can(PERMISSIONS.STUDENTS_VIEW) && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href={`/students/${student.id}`}><Eye className="h-4 w-4" /></Link>
                              </Button>
                            )}
                            {can(PERMISSIONS.STUDENTS_EDIT) && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href={`/students/${student.id}?edit=true`}><Edit className="h-4 w-4" /></Link>
                              </Button>
                            )}
                            {can(PERMISSIONS.STUDENTS_DELETE) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  if (confirm("هل أنت متأكد من حذف هذه الطالبة؟")) {
                                    deleteStudent.mutate(student.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  عرض {page * pageSize + 1} إلى {Math.min((page + 1) * pageSize, totalCount)} من {totalCount} طالبة
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{page + 1} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold">لا توجد طالبات</h3>
              <p className="text-muted-foreground mt-1">
                {search ? "جربي تعديل البحث" : "ابدأي بإضافة أول طالبة"}
              </p>
              {!search && can(PERMISSIONS.STUDENTS_CREATE) && (
                <Button className="mt-4" asChild>
                  <Link href="/students/new"><Plus className="mr-2 h-4 w-4" /> إضافة طالبة</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
