"use client";

import { useState, useCallback } from "react";
import { useEmployees, useDeleteEmployee, useEmployeeStats } from "@/lib/hooks/use-employees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Search, Loader2, ChevronLeft, ChevronRight, Eye, Trash2, Users, AlertCircle, Briefcase, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Employee, EmployeeFilters, EmployeeStatus } from "@/lib/types/employee";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  active: "success", inactive: "secondary", suspended: "destructive", terminated: "destructive", on_leave: "warning",
};
const statusLabels: Record<string, string> = {
  active: "نشط", inactive: "غير نشط", suspended: "معلق", terminated: "منتهي", on_leave: "في إجازة",
};
const contractLabels: Record<string, string> = {
  full_time: "دوام كامل", part_time: "دوام جزئي", temporary: "مؤقت", internship: "تدريب",
};

export default function EmployeesPage() {
  const [filters, setFilters] = useState<EmployeeFilters>({ page: 1, pageSize: 10, search: "" });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useEmployees(filters);
  const { data: stats } = useEmployeeStats();
  const deleteEmp = useDeleteEmployee();

  const handleSearch = useCallback(() => setFilters(p => ({ ...p, search: searchInput, page: 1 })), [searchInput]);
  const handlePageChange = useCallback((p: number) => setFilters(prev => ({ ...prev, page: p })), []);
  const handleDelete = useCallback(async (id: string) => { if (window.confirm("هل أنت متأكد من حذف هذا الموظف؟")) await deleteEmp.mutateAsync(id); }, [deleteEmp]);

  const employees = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الموظفين</h1>
          <p className="text-muted-foreground">إدارة الموظفين والموارد البشرية</p>
        </div>
        <Button asChild><Link href="/employees/new"><Plus className="ml-2 h-4 w-4" /> إضافة موظف</Link></Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Users className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.total ?? 0}</p><p className="text-xs text-muted-foreground">إجمالي الموظفين</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Briefcase className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.active ?? 0}</p><p className="text-xs text-muted-foreground">نشط</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><Calendar className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.on_leave ?? 0}</p><p className="text-xs text-muted-foreground">في إجازة</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><DollarSign className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{formatCurrency(stats?.total_salary ?? 0)}</p><p className="text-xs text-muted-foreground">إجمالي الرواتب</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم، الرقم، البريد..." className="pr-9" value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
          </div>
          <Button variant="outline" onClick={handleSearch}><Search className="ml-2 h-4 w-4" /> بحث</Button>
        </div>
      </CardContent></Card>

      {isLoading ? (
        <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>
      ) : employees.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-semibold">لا يوجد موظفين</h3>
          <Button className="mt-4" asChild><Link href="/employees/new"><Plus className="ml-2 h-4 w-4" /> إضافة موظف</Link></Button>
        </CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>قائمة الموظفين ({data?.count ?? 0})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b">
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الموظف</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الرقم</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">نوع العقد</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الراتب</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">تاريخ التعيين</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
                </tr></thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{(emp.first_name_ar ?? "?").charAt(0)}</div>
                          <div><p className="text-sm font-medium">{emp.first_name_ar} {emp.last_name_ar}</p><p className="text-xs text-muted-foreground">{emp.email ?? emp.phone ?? "—"}</p></div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono">{emp.employee_number}</td>
                      <td className="py-3 px-4"><Badge variant={statusColors[emp.status]}>{statusLabels[emp.status]}</Badge></td>
                      <td className="py-3 px-4 text-sm">{contractLabels[emp.contract_type] ?? emp.contract_type}</td>
                      <td className="py-3 px-4 text-sm font-medium">{formatCurrency(emp.salary)}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{emp.hire_date ? formatDate(emp.hire_date) : "—"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href={`/employees/${emp.id}`}><Eye className="h-4 w-4" /></Link></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(emp.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">عرض {(currentPage - 1) * 10 + 1} إلى {Math.min(currentPage * 10, data?.count ?? 0)} من {data?.count ?? 0}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-sm">{currentPage} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
