"use client";

import { useState } from "react";
import { useEnrollments, useCreateEnrollment } from "@/lib/hooks/use-academics";
import { useStudents } from "@/lib/hooks/use-students";
import { useCourses } from "@/lib/hooks/use-academics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Users, Loader2, Plus, Save, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function EnrollmentPage() {
  const { data: enrollmentsRaw, isLoading } = useEnrollments();
  const { data: studentsData } = useStudents({ pageSize: 500 });
  const { data: coursesRaw } = useCourses();
  const courses = (coursesRaw ?? []) as Array<{ id: string; name: string; code: string }>;
  const enrollments = (enrollmentsRaw ?? []) as Array<{ id: string; student_id: string; course_id: string; enrollment_date: string; status: string; payment_status: string; total_fees: number | null }>;
  const createEnrollment = useCreateEnrollment();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: "", course_id: "", enrollment_date: new Date().toISOString().split("T")[0], total_fees: 0 });

  const handleCreate = () => {
    if (!form.student_id || !form.course_id) { toast.error("Select student and course"); return; }
    createEnrollment.mutate(form, { onSuccess: () => { setShowForm(false); setForm({ student_id: "", course_id: "", enrollment_date: new Date().toISOString().split("T")[0], total_fees: 0 }); } });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Enrollments</h1><p className="text-muted-foreground">Manage student course enrollments</p></div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> New Enrollment</>}</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2 text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"><GraduationCap className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{enrollments.length}</p><p className="text-xs text-muted-foreground">Total Enrollments</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2 text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"><BookOpen className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{enrollments.filter((e) => e.status === "active").length}</p><p className="text-xs text-muted-foreground">Active</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2 text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"><Users className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{enrollments.filter((e) => e.payment_status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending Payment</p></div></CardContent></Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">New Enrollment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium">Student *</label>
                <select value={form.student_id} onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="">Select student</option>
                  {((studentsData?.data ?? []) as Array<{ id: string; student_number: string }>).map((s) => <option key={s.id} value={s.id}>{s.student_number}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Course *</label>
                <select value={form.course_id} onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="">Select course</option>
                  {(courses).map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium">Enrollment Date</label><Input type="date" value={form.enrollment_date} onChange={(e) => setForm((f) => ({ ...f, enrollment_date: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-sm font-medium">Total Fees</label><Input type="number" value={form.total_fees} onChange={(e) => setForm((f) => ({ ...f, total_fees: Number(e.target.value) }))} className="mt-1" /></div>
            </div>
            <div className="flex justify-end"><Button onClick={handleCreate} disabled={createEnrollment.isPending}>{createEnrollment.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Create Enrollment</Button></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">All Enrollments</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : enrollments.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead><tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Student</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Course</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Payment</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Fees</th>
                </tr></thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-mono">{e.student_id?.slice(0, 8)}</td>
                      <td className="py-3 px-4 text-sm font-mono">{e.course_id?.slice(0, 8)}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(e.enrollment_date)}</td>
                      <td className="py-3 px-4"><Badge variant={e.status === "active" ? "success" : "secondary"}>{e.status}</Badge></td>
                      <td className="py-3 px-4"><Badge variant={e.payment_status === "paid" ? "success" : e.payment_status === "pending" ? "warning" : "destructive"}>{e.payment_status}</Badge></td>
                      <td className="py-3 px-4 text-sm">${e.total_fees?.toFixed(2) ?? "0.00"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12"><GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-semibold">No enrollments yet</h3><p className="text-muted-foreground mt-1">Create your first enrollment to get started</p></div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
