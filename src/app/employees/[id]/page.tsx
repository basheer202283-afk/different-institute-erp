"use client";

import { useParams } from "next/navigation";
import { useEmployee, useLeaveRequests, useCreateLeaveRequest, useApproveLeaveRequest, useDepartments } from "@/lib/hooks/use-employees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowRight, Loader2, User, Briefcase, Phone, Calendar, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useState, useCallback } from "react";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  active: "success", inactive: "secondary", suspended: "destructive", terminated: "destructive", on_leave: "warning",
};
const statusLabels: Record<string, string> = {
  active: "نشط", inactive: "غير نشط", suspended: "معلق", terminated: "منتهي", on_leave: "في إجازة",
};
const contractLabels: Record<string, string> = {
  full_time: "دوام كامل", part_time: "دوام جزئي", temporary: "مؤقت", internship: "تدريب",
};
const leaveStatusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning", approved: "success", rejected: "destructive", cancelled: "secondary",
};
const leaveStatusLabels: Record<string, string> = {
  pending: "قيد المراجعة", approved: "معتمدة", rejected: "مرفوضة", cancelled: "ملغاة",
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: emp, isLoading, error } = useEmployee(id);
  const { data: leaveRequests } = useLeaveRequests(id);
  const { data: departments } = useDepartments();
  const createLeave = useCreateLeaveRequest();
  const approveLeave = useApproveLeaveRequest();

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveType, setLeaveType] = useState("annual");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  const handleCreateLeave = useCallback(async () => {
    if (!leaveStart || !leaveEnd) return;
    await createLeave.mutateAsync({ employee_id: id, leave_type: leaveType, start_date: leaveStart, end_date: leaveEnd, reason: leaveReason || undefined });
    setShowLeaveForm(false);
    setLeaveStart(""); setLeaveEnd(""); setLeaveReason("");
  }, [id, leaveType, leaveStart, leaveEnd, leaveReason, createLeave]);

  const handleApproveLeave = useCallback(async (leaveId: string, action: "approve" | "reject") => {
    await approveLeave.mutateAsync({ id: leaveId, action });
  }, [approveLeave]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error || !emp) return <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive"><AlertCircle className="h-12 w-12 mb-4" /><Button variant="outline" asChild><Link href="/employees">العودة</Link></Button></div>;

  const dept = (departments ?? []).find(d => d.id === emp.department_id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/employees"><ArrowRight className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-3xl font-bold">{emp.first_name_ar} {emp.last_name_ar}</h1><p className="text-muted-foreground font-mono">{emp.employee_number}</p></div>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Badge variant={statusColors[emp.status]} className="text-sm px-3 py-1">{statusLabels[emp.status]}</Badge>
          <Badge variant="secondary">{contractLabels[emp.contract_type]}</Badge>
        </div>
      </CardContent></Card>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">المعلومات</TabsTrigger>
          <TabsTrigger value="leave">الإجازات ({(leaveRequests ?? []).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid gap-6 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> البيانات الشخصية</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">الاسم:</span><span>{emp.first_name_ar} {emp.last_name_ar}</span></div>
              {emp.first_name_en && <div className="flex justify-between"><span className="text-muted-foreground">الاسم (EN):</span><span>{emp.first_name_en} {emp.last_name_en}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">رقم الهوية:</span><span>{emp.national_id ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">تاريخ الميلاد:</span><span>{emp.date_of_birth ? formatDate(emp.date_of_birth) : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الجنس:</span><span>{emp.gender === "male" ? "ذكر" : emp.gender === "female" ? "أنثى" : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الجنسية:</span><span>{emp.nationality ?? "—"}</span></div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> بيانات العمل</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">القسم:</span><span>{(dept?.name_ar || dept?.name) ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">تاريخ التعيين:</span><span>{emp.hire_date ? formatDate(emp.hire_date) : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">نوع العقد:</span><span>{contractLabels[emp.contract_type]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الراتب:</span><span className="font-medium">{formatCurrency(emp.salary)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الحالة:</span><Badge variant={statusColors[emp.status]}>{statusLabels[emp.status]}</Badge></div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> معلومات الاتصال</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">البريد:</span><span>{emp.email ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الهاتف:</span><span>{emp.phone ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">المدينة:</span><span>{emp.city ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">العنوان:</span><span>{emp.address ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">جهة اتصال طارئ:</span><span>{emp.emergency_contact_name ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">هاتف الطوارئ:</span><span>{emp.emergency_contact_phone ?? "—"}</span></div>
            </CardContent></Card>

            {emp.notes && <Card><CardHeader><CardTitle>ملاحظات</CardTitle></CardHeader><CardContent><p className="text-sm">{emp.notes}</p></CardContent></Card>}
          </div>
        </TabsContent>

        <TabsContent value="leave">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">طلبات الإجازة</h3>
              <Button onClick={() => setShowLeaveForm(!showLeaveForm)}><Calendar className="ml-2 h-4 w-4" /> طلب إجازة</Button>
            </div>

            {showLeaveForm && (
              <Card className="border-primary/30"><CardContent className="p-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><label className="text-sm font-medium mb-2 block">نوع الإجازة</label>
                    <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                      <option value="annual">سنوية</option><option value="sick">مرضية</option><option value="personal">شخصية</option><option value="maternity">أمومة</option><option value="other">أخرى</option>
                    </select>
                  </div>
                  <div><label className="text-sm font-medium mb-2 block">السبب</label><Input value={leaveReason} onChange={e => setLeaveReason(e.target.value)} placeholder="سبب الإجازة..." /></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div><label className="text-sm font-medium mb-2 block">من</label><Input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} /></div>
                  <div><label className="text-sm font-medium mb-2 block">إلى</label><Input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} /></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateLeave} disabled={!leaveStart || !leaveEnd || createLeave.isPending}>{createLeave.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Calendar className="ml-2 h-4 w-4" />} إرسال</Button>
                  <Button variant="ghost" onClick={() => setShowLeaveForm(false)}>إلغاء</Button>
                </div>
              </CardContent></Card>
            )}

            {(leaveRequests ?? []).length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Calendar className="h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-semibold">لا توجد طلبات إجازة</h3></CardContent></Card>
            ) : (
              <Card><CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b">
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">النوع</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">من</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إلى</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الأيام</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
                    </tr></thead>
                    <tbody>
                      {(leaveRequests ?? []).map(lr => (
                        <tr key={lr.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 text-sm">{lr.leave_type}</td>
                          <td className="py-3 px-4 text-sm">{formatDate(lr.start_date)}</td>
                          <td className="py-3 px-4 text-sm">{formatDate(lr.end_date)}</td>
                          <td className="py-3 px-4 text-sm">{lr.days}</td>
                          <td className="py-3 px-4"><Badge variant={leaveStatusColors[lr.status]}>{leaveStatusLabels[lr.status]}</Badge></td>
                          <td className="py-3 px-4">
                            {lr.status === "pending" && (
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleApproveLeave(lr.id, "approve")}><CheckCircle2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleApproveLeave(lr.id, "reject")}><XCircle className="h-4 w-4" /></Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent></Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
