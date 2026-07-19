"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, Loader2, Users, UserPlus, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

const roleLabels: Record<string, string> = {
  super_admin: "المدير العام", owner: "مالك المعهد", branch_manager: "مدير الفرع",
  finance_manager: "مدير المالية", hr_manager: "مدير الموارد البشرية", academic_manager: "مدير الأكاديمي",
  trainer: "المدرب", reception: "الاستقبال", student: "الطالب", guardian: "ولي الأمر",
};
const roleColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  super_admin: "destructive", owner: "destructive", branch_manager: "default",
  finance_manager: "success", hr_manager: "default", academic_manager: "default",
  trainer: "secondary", reception: "secondary", student: "warning", guardian: "warning",
};
const statusLabels: Record<string, string> = { active: "نشط", inactive: "غير نشط", suspended: "معلق", pending: "قيد الانتظار" };
const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  active: "success", inactive: "secondary", suspended: "destructive", pending: "warning",
};

export default function AdminPage() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", organization?.id, search, page],
    queryFn: async () => {
      if (!organization) return { data: [], count: 0, totalPages: 0 };
      let query = supabase.from("profiles").select("*", { count: "exact" }).eq("organization_id", organization.id).order("created_at", { ascending: false });
      if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,display_name.ilike.%${search}%`);
      const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;
      return { data: (data ?? []) as any[], count: count ?? 0, totalPages: Math.ceil((count ?? 0) / pageSize) };
    },
    enabled: !!organization,
  });

  const updateUserStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from("profiles") as any).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("تم تحديث حالة المستخدم"); },
    onError: (e: Error) => { toast.error(`خطأ: ${e.message}`); },
  });

  const users = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">المستخدمين والأدوار</h1><p className="text-muted-foreground">إدارة المستخدمين وصلاحياتهم</p></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Users className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{data?.count ?? 0}</p><p className="text-xs text-muted-foreground">إجمالي المستخدمين</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Shield className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{users.filter(u => u.status === "active").length}</p><p className="text-xs text-muted-foreground">نشط</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><Shield className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold">{users.filter(u => u.role === "super_admin" || u.role === "owner").length}</p><p className="text-xs text-muted-foreground">مدراء</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><Shield className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold">{users.filter(u => u.status === "suspended").length}</p><p className="text-xs text-muted-foreground">معلق</p></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Search */}
      <Card><CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم..." className="pr-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
      </CardContent></Card>

      {/* Users Table */}
      {isLoading ? (
        <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>
      ) : users.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-semibold">لا يوجد مستخدمين</h3></CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>قائمة المستخدمين ({data?.count ?? 0})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b">
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">المستخدم</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدور</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الهاتف</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">تاريخ الإنشاء</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
                </tr></thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{(user.display_name ?? user.first_name ?? "?").charAt(0)}</div>
                          <div><p className="text-sm font-medium">{user.display_name ?? `${user.first_name ?? ""} ${user.last_name ?? ""}`}</p><p className="text-xs text-muted-foreground font-mono">{user.id.substring(0, 8)}</p></div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><Badge variant={roleColors[user.role] ?? "secondary"}>{roleLabels[user.role] ?? user.role}</Badge></td>
                      <td className="py-3 px-4"><Badge variant={statusColors[user.status] ?? "secondary"}>{statusLabels[user.status] ?? user.status}</Badge></td>
                      <td className="py-3 px-4 text-sm">{user.phone ?? "—"}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{user.created_at ? formatDate(user.created_at) : "—"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {user.status === "active" ? (
                            <Button variant="outline" size="sm" onClick={() => updateUserStatus.mutateAsync({ id: user.id, status: "suspended" })}>تعليق</Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => updateUserStatus.mutateAsync({ id: user.id, status: "active" })}>تفعيل</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">عرض {(page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, data?.count ?? 0)} من {data?.count ?? 0}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-sm">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
