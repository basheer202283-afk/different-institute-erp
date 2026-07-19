"use client";

import { use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudent, useUpdateStudent, useStudentAttachments } from "@/lib/hooks/use-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { motion } from "framer-motion";
import {
  ArrowRight, Edit, Save, Loader2, User, Shield, Heart, BookOpen,
  FileText, Phone, Mail, MapPin, Calendar, GraduationCap, Trash2, RotateCcw
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { StudentFormData, StudentStatus } from "@/lib/types/student";
import { useDeleteStudent, useRestoreStudent } from "@/lib/hooks/use-students";

const statusConfig: Record<StudentStatus, { labelAr: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  active: { labelAr: "نشط", variant: "success" },
  pending: { labelAr: "قيد الانتظار", variant: "warning" },
  suspended: { labelAr: "معلق", variant: "destructive" },
  graduated: { labelAr: "متخرج", variant: "default" },
  withdrawn: { labelAr: "منسحب", variant: "secondary" },
};

const schema = z.object({
  first_name_ar: z.string().min(1, "مطلوب"),
  last_name_ar: z.string().min(1, "مطلوب"),
  first_name_en: z.string().optional(),
  last_name_en: z.string().optional(),
  national_id: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  status: z.enum(["active", "pending", "suspended", "graduated", "withdrawn"]),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  notes: z.string().optional(),
});

function StudentDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";
  const { can } = useAuth();
  const { data: student, isLoading } = useStudent(id);
  const { data: attachments } = useStudentAttachments(id);
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const restoreStudent = useRestoreStudent();
  const [editing, setEditing] = useState(isEditing);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<StudentFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (student) {
      reset({
        first_name_ar: student.first_name_ar ?? "",
        last_name_ar: student.last_name_ar ?? "",
        first_name_en: student.first_name_en ?? "",
        last_name_en: student.last_name_en ?? "",
        national_id: student.national_id ?? "",
        mobile: student.mobile ?? "",
        email: student.email ?? "",
        status: student.status,
        guardian_name: student.guardian_name ?? "",
        guardian_phone: student.guardian_phone ?? "",
        notes: student.notes ?? "",
      });
    }
  }, [student, reset]);

  const onSubmit = async (data: StudentFormData) => {
    updateStudent.mutate({ id, data }, { onSuccess: () => setEditing(false) });
  };

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!student) return (
    <div className="text-center py-16">
      <h2 className="text-xl font-semibold">الطالبة غير موجودة</h2>
      <Button className="mt-4" asChild><Link href="/students">العودة للقائمة</Link></Button>
    </div>
  );

  const studentAttachments = attachments ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/students"><ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {student.first_name_ar} {student.last_name_ar}
          </h1>
          <p className="text-muted-foreground">{student.student_number}</p>
        </div>
        <div className="flex gap-2">
          {can(PERMISSIONS.STUDENTS_EDIT) && !editing && (
            <Button onClick={() => setEditing(true)}><Edit className="ml-2 h-4 w-4" /> تعديل</Button>
          )}
          {student.deleted_at && can(PERMISSIONS.STUDENTS_RESTORE) && (
            <Button variant="outline" onClick={() => restoreStudent.mutate(id)}>
              <RotateCcw className="ml-2 h-4 w-4" /> استعادة
            </Button>
          )}
          {!student.deleted_at && can(PERMISSIONS.STUDENTS_DELETE) && (
            <Button variant="destructive" onClick={() => { if (confirm("هل أنت متأكد؟")) deleteStudent.mutate(id); }}>
              <Trash2 className="ml-2 h-4 w-4" /> حذف
            </Button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {student.first_name_ar?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{student.first_name_ar} {student.last_name_ar}</h2>
              {student.first_name_en && <p className="text-muted-foreground">{student.first_name_en} {student.last_name_en}</p>}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusConfig[student.status]?.variant ?? "secondary"}>
                  {statusConfig[student.status]?.labelAr ?? student.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{student.student_number}</span>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {student.registration_date && <p>تسجيل: {formatDate(student.registration_date)}</p>}
              <p>إنشاء: {formatDate(student.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>تعديل البيانات</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div><label className="text-sm font-medium">الاسم الأول (عربي) *</label><Input {...register("first_name_ar")} className={`mt-1 ${errors.first_name_ar ? "border-destructive" : ""}`} />{errors.first_name_ar && <p className="text-xs text-destructive mt-1">{errors.first_name_ar.message}</p>}</div>
              <div><label className="text-sm font-medium">اسم العائلة (عربي) *</label><Input {...register("last_name_ar")} className={`mt-1 ${errors.last_name_ar ? "border-destructive" : ""}`} />{errors.last_name_ar && <p className="text-xs text-destructive mt-1">{errors.last_name_ar.message}</p>}</div>
              <div><label className="text-sm font-medium">الاسم الأول (إنجليزي)</label><Input {...register("first_name_en")} className="mt-1" /></div>
              <div><label className="text-sm font-medium">اسم العائلة (إنجليزي)</label><Input {...register("last_name_en")} className="mt-1" /></div>
              <div><label className="text-sm font-medium">رقم الهوية</label><Input {...register("national_id")} className="mt-1" /></div>
              <div><label className="text-sm font-medium">الهاتف</label><Input {...register("mobile")} className="mt-1" /></div>
              <div><label className="text-sm font-medium">البريد الإلكتروني</label><Input type="email" {...register("email")} className="mt-1" /></div>
              <div><label className="text-sm font-medium">الحالة</label><select {...register("status")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"><option value="pending">قيد الانتظار</option><option value="active">نشط</option><option value="suspended">معلق</option><option value="graduated">متخرج</option><option value="withdrawn">منسحب</option></select></div>
              <div><label className="text-sm font-medium">ولي الأمر</label><Input {...register("guardian_name")} className="mt-1" /></div>
              <div><label className="text-sm font-medium">هاتف ولي الأمر</label><Input {...register("guardian_phone")} className="mt-1" /></div>
              <div className="md:col-span-2"><label className="text-sm font-medium">ملاحظات</label><textarea {...register("notes")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] mt-1" /></div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ</Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal Info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> المعلومات الشخصية</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "رقم الطالبة", value: student.student_number },
                { label: "رقم التسجيل", value: student.registration_number },
                { label: "رقم الهوية", value: student.national_id },
                { label: "تاريخ الميلاد", value: student.date_of_birth ? formatDate(student.date_of_birth) : null },
                { label: "العمر", value: student.age ? `${student.age} سنة` : null },
                { label: "الجنس", value: student.gender },
                { label: "الجنسية", value: student.nationality },
                { label: "المدينة", value: student.city },
              ].filter((f) => f.value).map((f) => (
                <div key={f.label} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{f.label}</span>
                  <span className="text-sm font-medium">{f.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> معلومات الاتصال</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {student.mobile && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{student.mobile}</span></div>}
              {student.alternative_mobile && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{student.alternative_mobile}</span></div>}
              {student.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{student.email}</span></div>}
              {student.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{student.address}</span></div>}
              {!student.mobile && !student.email && <p className="text-sm text-muted-foreground text-center py-4">لا توجد معلومات اتصال</p>}
            </CardContent>
          </Card>

          {/* Guardian Info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> ولي الأمر</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {student.guardian_name && <div className="flex justify-between"><span className="text-sm text-muted-foreground">الاسم</span><span className="text-sm font-medium">{student.guardian_name}</span></div>}
              {student.guardian_relationship && <div className="flex justify-between"><span className="text-sm text-muted-foreground">العلاقة</span><span className="text-sm font-medium">{student.guardian_relationship}</span></div>}
              {student.guardian_phone && <div className="flex justify-between"><span className="text-sm text-muted-foreground">الهاتف</span><span className="text-sm font-medium">{student.guardian_phone}</span></div>}
              {student.guardian_whatsapp && <div className="flex justify-between"><span className="text-sm text-muted-foreground">واتساب</span><span className="text-sm font-medium">{student.guardian_whatsapp}</span></div>}
              {!student.guardian_name && <p className="text-sm text-muted-foreground text-center py-4">لا توجد معلومات ولي الأمر</p>}
            </CardContent>
          </Card>

          {/* Medical Info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" /> المعلومات الطبية</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {student.blood_group && <div className="flex justify-between"><span className="text-sm text-muted-foreground">فصيلة الدم</span><span className="text-sm font-medium">{student.blood_group}</span></div>}
              {student.medical_conditions && <div><span className="text-sm text-muted-foreground">الحالات الطبية</span><p className="text-sm mt-1">{student.medical_conditions}</p></div>}
              {student.allergies && <div><span className="text-sm text-muted-foreground">الحساسيات</span><p className="text-sm mt-1">{student.allergies}</p></div>}
              {!student.blood_group && !student.medical_conditions && <p className="text-sm text-muted-foreground text-center py-4">لا توجد معلومات طبية</p>}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> المرفقات ({studentAttachments.length})</CardTitle></CardHeader>
            <CardContent>
              {studentAttachments.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {studentAttachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{att.file_name}</p>
                        <p className="text-xs text-muted-foreground">{att.attachment_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">لا توجد مرفقات</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {student.notes && (
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>ملاحظات</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{student.notes}</p></CardContent>
            </Card>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <StudentDetailContent id={id} />
    </Suspense>
  );
}
