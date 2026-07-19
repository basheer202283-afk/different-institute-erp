"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAttendanceRecords, useUpdateAttendance, useDeleteAttendance } from "@/lib/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Edit, Save, Loader2, CalendarCheck, Clock, Users, Trash2, X
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attendanceFormSchema, type AttendanceFormValues } from "@/lib/validators/attendance";
import { formatDate } from "@/lib/utils";
import type { AttendanceRecord } from "@/lib/types/attendance";

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

function AttendanceDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { data: records, isLoading } = useAttendanceRecords({});
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();
  const [editing, setEditing] = useState(false);

  const record = records?.data.find((r) => r.id === id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
  });

  React.useEffect(() => {
    if (record && editing) {
      reset({
        student_id: record.student_id,
        class_id: record.class_id,
        attendance_date: record.attendance_date,
        status: record.status,
        check_in_time: record.check_in_time ?? undefined,
        check_out_time: record.check_out_time ?? undefined,
        late_minutes: record.late_minutes ?? undefined,
        reason: record.reason ?? undefined,
        notes: record.notes ?? undefined,
      });
    }
  }, [record, editing, reset]);

  const onSubmit = async (data: AttendanceFormValues) => {
    try {
      await updateAttendance.mutateAsync({ id, data });
      setEditing(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      await deleteAttendance.mutateAsync(id);
      router.push("/attendance");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">سجل الحضور غير موجود</h2>
        <Button className="mt-4" asChild>
          <Link href="/attendance">العودة للقائمة</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">تفاصيل الحضور</h1>
          <p className="text-muted-foreground">{formatDate(record.attendance_date)}</p>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit className="ml-2 h-4 w-4" /> تعديل
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="ml-2 h-4 w-4" /> حذف
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Record Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {record.student_id?.slice(0, 2)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">سجل حضور</h2>
              <p className="text-muted-foreground">الطالبة: {record.student_id?.slice(0, 8)}</p>
              <p className="text-muted-foreground">الفصل: {record.class_id?.slice(0, 8)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusColors[record.status]}>
                  {statusLabels[record.status]}
                </Badge>
                <span className="text-sm text-muted-foreground">{formatDate(record.attendance_date)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تعديل سجل الحضور</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">التاريخ</label>
                  <Input type="date" {...register("attendance_date")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">الحالة</label>
                  <select {...register("status")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                    <option value="present">حاضر</option>
                    <option value="absent">غائب</option>
                    <option value="late">متأخر</option>
                    <option value="excused">معذور</option>
                    <option value="left_early">غادر مبكراً</option>
                    <option value="holiday">عطلة</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">وقت الدخول</label>
                  <Input type="time" {...register("check_in_time")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">وقت الخروج</label>
                  <Input type="time" {...register("check_out_time")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">دقائق التأخر</label>
                  <Input type="number" {...register("late_minutes")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">السبب</label>
                  <Input {...register("reason")} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">ملاحظات</label>
                  <textarea
                    {...register("notes")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setEditing(false)}>
              <X className="ml-2 h-4 w-4" /> إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" /> حفظ التعديلات
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5" /> معلومات الحضور
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "التاريخ", value: formatDate(record.attendance_date) },
                { label: "الحالة", value: statusLabels[record.status] },
                { label: "وقت الدخول", value: record.check_in_time ?? "—" },
                { label: "وقت الخروج", value: record.check_out_time ?? "—" },
                { label: "دقائق التأخر", value: record.late_minutes ? `${record.late_minutes} دقيقة` : "—" },
                { label: "السبب", value: record.reason ?? "—" },
              ]
                .filter((f) => f.value)
                .map((f) => (
                  <div key={f.label} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{f.label}</span>
                    <span className="text-sm font-medium">{f.value}</span>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> معلومات الطالبة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">معرف الطالبة</span>
                <span className="text-sm font-mono">{record.student_id?.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">معرف الفصل</span>
                <span className="text-sm font-mono">{record.class_id?.slice(0, 8)}</span>
              </div>
            </CardContent>
          </Card>

          {record.notes && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>ملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{record.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function AttendanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AttendanceDetailContent id={id} />
    </Suspense>
  );
}
