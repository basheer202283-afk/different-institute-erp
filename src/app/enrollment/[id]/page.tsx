"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useEnrollmentDetail,
  useUpdateEnrollmentStatus,
  useApproveEnrollment,
  useCancelEnrollment,
  useTransferEnrollment,
  useAvailableClasses,
} from "@/lib/hooks/use-enrollments";
import { useStudents } from "@/lib/hooks/use-students";
import { useCourses } from "@/lib/hooks/use-courses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowRight, Loader2, CheckCircle2, XCircle, Trash2, ArrowRightLeft,
  AlertCircle, User, BookOpen, CalendarCheck, CreditCard, Clock,
  FileText, History, Ban, UserCheck, UserX, Send, GraduationCap
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  approved: "default",
  active: "success",
  completed: "default",
  cancelled: "destructive",
  rejected: "destructive",
  transferred: "secondary",
  deferred: "secondary",
  expelled: "destructive",
};

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  active: "نشط",
  completed: "مكتمل",
  cancelled: "ملغي",
  rejected: "مرفوض",
  transferred: "منقول",
  deferred: "مؤجل",
  expelled: "مفصول",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "غير مدفوع",
  partial: "مدفوع جزئياً",
  paid: "مدفوع بالكامل",
  refunded: "مسترد",
  waived: "معفي",
};

const paymentStatusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "destructive",
  partial: "warning",
  paid: "success",
  refunded: "secondary",
  waived: "default",
};

export default function EnrollmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: enrollment, isLoading, error } = useEnrollmentDetail(id);
  const updateStatus = useUpdateEnrollmentStatus();
  const approveEnrollment = useApproveEnrollment();
  const cancelEnrollment = useCancelEnrollment();
  const transferEnrollment = useTransferEnrollment();
  const { data: classes } = useAvailableClasses(enrollment?.course_id);

  const [showTransfer, setShowTransfer] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [transferClassId, setTransferClassId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const handleApprove = useCallback(async () => {
    if (!enrollment) return;
    await approveEnrollment.mutateAsync({ id: enrollment.id, action: "approve" });
  }, [enrollment, approveEnrollment]);

  const handleReject = useCallback(async () => {
    if (!enrollment) return;
    await approveEnrollment.mutateAsync({ id: enrollment.id, action: "reject" });
  }, [enrollment, approveEnrollment]);

  const handleComplete = useCallback(async () => {
    if (!enrollment) return;
    if (window.confirm("هل تريد وضع علامة مكتمل على هذا التسجيل؟")) {
      await updateStatus.mutateAsync({ id: enrollment.id, status: "completed" });
    }
  }, [enrollment, updateStatus]);

  const handleTransfer = useCallback(async () => {
    if (!enrollment || !transferClassId) return;
    if (window.confirm("هل أنت متأكد من نقل هذه الطالبة؟")) {
      await transferEnrollment.mutateAsync({
        enrollment_id: enrollment.id,
        target_class_id: transferClassId,
        reason: transferReason,
      });
      setShowTransfer(false);
      setTransferClassId("");
      setTransferReason("");
    }
  }, [enrollment, transferClassId, transferReason, transferEnrollment]);

  const handleCancel = useCallback(async () => {
    if (!enrollment || !cancelReason) return;
    if (window.confirm("هل أنت متأكد من إلغاء هذا التسجيل؟")) {
      await cancelEnrollment.mutateAsync({
        id: enrollment.id,
        reason: cancelReason,
      });
      setShowCancel(false);
      setCancelReason("");
    }
  }, [enrollment, cancelReason, cancelEnrollment]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
        <AlertCircle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">خطأ في تحميل البيانات</h2>
        <Button variant="outline" asChild>
          <Link href="/enrollment">العودة</Link>
        </Button>
      </div>
    );
  }

  const canApprove = enrollment.approval_status === "pending";
  const canCancel = enrollment.status !== "cancelled" && enrollment.status !== "completed";
  const canTransfer = enrollment.status === "active" || enrollment.status === "approved";
  const canComplete = enrollment.status === "active";

  const remainingBalance = (enrollment.total_fees - enrollment.discount_amount) - enrollment.paid_amount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/enrollment">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              تفاصيل التسجيل
            </h1>
            <p className="text-muted-foreground font-mono">
              #{enrollment.id.substring(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canApprove && (
            <>
              <Button
                variant="outline"
                className="text-green-600 border-green-600"
                onClick={handleApprove}
                disabled={approveEnrollment.isPending}
              >
                <UserCheck className="ml-2 h-4 w-4" /> موافقة
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600"
                onClick={handleReject}
                disabled={approveEnrollment.isPending}
              >
                <UserX className="ml-2 h-4 w-4" /> رفض
              </Button>
            </>
          )}
          {canComplete && (
            <Button variant="outline" onClick={handleComplete} disabled={updateStatus.isPending}>
              <CheckCircle2 className="ml-2 h-4 w-4" /> إكمال
            </Button>
          )}
          {canTransfer && (
            <Button variant="outline" onClick={() => setShowTransfer(!showTransfer)}>
              <ArrowRightLeft className="ml-2 h-4 w-4" /> نقل
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => setShowCancel(!showCancel)}
            >
              <Ban className="ml-2 h-4 w-4" /> إلغاء
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Badge variant={statusColors[enrollment.status]} className="text-sm px-3 py-1">
                {statusLabels[enrollment.status] ?? enrollment.status}
              </Badge>
              <Badge variant={paymentStatusColors[enrollment.payment_status]} className="text-sm px-3 py-1">
                {paymentStatusLabels[enrollment.payment_status] ?? enrollment.payment_status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              تاريخ التسجيل: {formatDate(enrollment.enrollment_date)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Panel */}
      {showTransfer && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <ArrowRightLeft className="h-5 w-5" />
              نقل الطالبة إلى فصل آخر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">الفصل المستهدف</label>
              <select
                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={transferClassId}
                onChange={(e) => setTransferClassId(e.target.value)}
              >
                <option value="">اختر الفصل</option>
                {(classes ?? [])
                  .filter((c) => c.id !== enrollment.class_id)
                  .map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.code})
                      {cls.max_students
                        ? ` [${cls.current_students}/${cls.max_students}]`
                        : ` [${cls.current_students}]`}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">سبب النقل</label>
              <Input
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="سبب النقل..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleTransfer}
                disabled={!transferClassId || transferEnrollment.isPending}
              >
                {transferEnrollment.isPending ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="ml-2 h-4 w-4" />
                )}
                تأكيد النقل
              </Button>
              <Button variant="ghost" onClick={() => setShowTransfer(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Panel */}
      {showCancel && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              إلغاء التسجيل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">سبب الإلغاء *</label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="سبب الإلغاء..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={!cancelReason || cancelEnrollment.isPending}
              >
                {cancelEnrollment.isPending ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="ml-2 h-4 w-4" />
                )}
                تأكيد الإلغاء
              </Button>
              <Button variant="ghost" onClick={() => setShowCancel(false)}>
                تراجع
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="financial">المالية</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  بيانات الطالبة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                    {enrollment.student?.first_name_ar?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="font-medium">
                      {enrollment.student?.first_name_ar} {enrollment.student?.last_name_ar}
                    </p>
                    {enrollment.student?.first_name_en && (
                      <p className="text-sm text-muted-foreground">
                        {enrollment.student.first_name_en} {enrollment.student.last_name_en}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم الطالبة:</span>
                    <span className="font-mono">{enrollment.student?.student_number ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الهاتف:</span>
                    <span>{enrollment.student?.mobile ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">البريد:</span>
                    <span>{enrollment.student?.email ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">حالة الطالبة:</span>
                    <Badge variant={enrollment.student?.status === "active" ? "success" : "warning"}>
                      {enrollment.student?.status ?? "—"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5" />
                  بيانات الدورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{enrollment.course?.name ?? "—"}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {enrollment.course?.code ?? "—"}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">السعر:</span>
                    <span className="font-medium">
                      {formatCurrency(enrollment.course?.price ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المدة:</span>
                    <span>
                      {enrollment.course?.duration_hours
                        ? `${enrollment.course.duration_hours} ساعة`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الحد الأقصى:</span>
                    <span>{enrollment.course?.max_students ?? "غير محدود"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">حالة الدورة:</span>
                    <Badge variant={enrollment.course?.status === "active" ? "success" : "secondary"}>
                      {enrollment.course?.status ?? "—"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarCheck className="h-5 w-5" />
                  الفصل / الدفعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {enrollment.class ? (
                  <>
                    <div>
                      <p className="font-medium">{enrollment.class.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {enrollment.class.code}
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">عدد الطالبات:</span>
                        <span>
                          {enrollment.class.current_students}
                          {enrollment.class.max_students && ` / ${enrollment.class.max_students}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الحالة:</span>
                        <Badge variant={enrollment.class.status === "active" ? "success" : "secondary"}>
                          {enrollment.class.status}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">لم يتم تعيين فصل بعد</p>
                )}
              </CardContent>
            </Card>

            {/* Semester Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  الفصل الدراسي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {enrollment.semester ? (
                  <>
                    <div>
                      <p className="font-medium">{enrollment.semester.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {enrollment.semester.code}
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">البداية:</span>
                        <span>{formatDate(enrollment.semester.start_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">النهاية:</span>
                        <span>{formatDate(enrollment.semester.end_date)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">لم يتم تعيين فصل دراسي</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {enrollment.notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  ملاحظات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{enrollment.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                التفاصيل المالية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border text-center">
                  <p className="text-sm text-muted-foreground">إجمالي الرسوم</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(enrollment.total_fees)}
                  </p>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <p className="text-sm text-muted-foreground">الخصم</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    {formatCurrency(enrollment.discount_amount)}
                  </p>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <p className="text-sm text-muted-foreground">المدفوع</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">
                    {formatCurrency(enrollment.paid_amount)}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">المتبقي:</span>
                  <span className={`text-2xl font-bold ${remainingBalance > 0 ? "text-destructive" : "text-green-600"}`}>
                    {formatCurrency(Math.max(0, remainingBalance))}
                  </span>
                </div>
                {enrollment.discount_reason && (
                  <p className="text-sm text-muted-foreground mt-2">
                    سبب الخصم: {enrollment.discount_reason}
                  </p>
                )}
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">حالة الدفع:</span>
                <Badge variant={paymentStatusColors[enrollment.payment_status]}>
                  {paymentStatusLabels[enrollment.payment_status] ?? enrollment.payment_status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                سجل التغييرات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">إنشاء التسجيل</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(enrollment.created_at)}
                    </p>
                  </div>
                </div>

                {enrollment.approved_at && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {enrollment.approval_status === "approved" ? "تمت الموافقة" : "تم الرفض"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(enrollment.approved_at)}
                      </p>
                      {enrollment.rejection_reason && (
                        <p className="text-xs text-destructive mt-1">
                          السبب: {enrollment.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {enrollment.cancelled_at && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mt-0.5">
                      <Ban className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">تم الإلغاء</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(enrollment.cancelled_at)}
                      </p>
                      {enrollment.cancellation_reason && (
                        <p className="text-xs text-destructive mt-1">
                          السبب: {enrollment.cancellation_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {enrollment.completion_date && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-0.5">
                      <GraduationCap className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">تم الإتمام</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(enrollment.completion_date)}
                      </p>
                      {enrollment.grade && (
                        <p className="text-xs mt-1">الدرجة: {enrollment.grade}</p>
                      )}
                    </div>
                  </div>
                )}

                {enrollment.transfer_from_enrollment_id && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mt-0.5">
                      <ArrowRightLeft className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">نقل من تسجيل آخر</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        من: {enrollment.transfer_from_enrollment_id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


