"use client";

import React, { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudent, useUpdateStudent, useUpdateStudentStatus, useDeleteStudent } from "@/lib/hooks/use-students";
import { studentFormSchema, type StudentFormValues } from "@/lib/validators/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Edit, Save, Loader2, User, Shield, Heart, FileText,
  Phone, Mail, MapPin, Calendar, GraduationCap, Trash2, RotateCcw, X
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "@/lib/utils";
import type { Student } from "@/lib/types/student";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  pending: "warning",
  suspended: "destructive",
  graduated: "default",
  withdrawn: "secondary",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  pending: "قيد الانتظار",
  suspended: "معلق",
  graduated: "متخرج",
  withdrawn: "منسحب",
};

function StudentDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";
  const { data: student, isLoading } = useStudent(id);
  const updateStudent = useUpdateStudent();
  const updateStatus = useUpdateStudentStatus();
  const deleteStudent = useDeleteStudent();
  const [editing, setEditing] = useState(isEditing);
  const [activeTab, setActiveTab] = useState("personal");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
  });

  // Set form values when student data loads
  React.useEffect(() => {
    if (student && editing) {
      reset({
        first_name_ar: student.first_name_ar,
        last_name_ar: student.last_name_ar,
        first_name_en: student.first_name_en ?? undefined,
        last_name_en: student.last_name_en ?? undefined,
        national_id: student.national_id ?? undefined,
        registration_number: student.registration_number ?? undefined,
        date_of_birth: student.date_of_birth ?? undefined,
        gender: student.gender ?? undefined,
        nationality: student.nationality ?? undefined,
        mobile: student.mobile ?? undefined,
        alternative_mobile: student.alternative_mobile ?? undefined,
        email: student.email ?? undefined,
        address: student.address ?? undefined,
        city: student.city ?? undefined,
        country: student.country ?? undefined,
        status: student.status,
        guardian_name: student.guardian_name ?? undefined,
        guardian_phone: student.guardian_phone ?? undefined,
        guardian_whatsapp: student.guardian_whatsapp ?? undefined,
        guardian_email: student.guardian_email ?? undefined,
        guardian_relationship: student.guardian_relationship ?? undefined,
        guardian_address: student.guardian_address ?? undefined,
        emergency_contact_name: student.emergency_contact_name ?? undefined,
        emergency_contact_phone: student.emergency_contact_phone ?? undefined,
        medical_conditions: student.medical_conditions ?? undefined,
        allergies: student.allergies ?? undefined,
        blood_group: student.blood_group ?? undefined,
        notes: student.notes ?? undefined,
      });
    }
  }, [student, editing, reset]);

  const onSubmit = async (data: StudentFormValues) => {
    try {
      await updateStudent.mutateAsync({ id, data });
      setEditing(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleStatusChange = async (status: Student['status']) => {
    await updateStatus.mutateAsync({ id, status });
  };

  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
      await deleteStudent.mutateAsync(id);
      router.push("/students");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">الطالبة غير موجودة</h2>
        <Button className="mt-4" asChild>
          <Link href="/students">العودة للقائمة</Link>
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: "personal", label: "المعلومات الشخصية", icon: User },
    { id: "guardian", label: "ولي الأمر", icon: Shield },
    { id: "medical", label: "المعلومات الطبية", icon: Heart },
    { id: "notes", label: "ملاحظات", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/students">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {student.first_name_ar} {student.last_name_ar}
          </h1>
          <p className="text-muted-foreground">{student.student_number}</p>
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

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {student.first_name_ar?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {student.first_name_ar} {student.last_name_ar}
              </h2>
              {student.first_name_en && (
                <p className="text-muted-foreground">
                  {student.first_name_en} {student.last_name_en}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusColors[student.status]}>
                  {statusLabels[student.status]}
                </Badge>
                <span className="text-sm text-muted-foreground">{student.student_number}</span>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {student.registration_date && (
                <p>تسجيل: {formatDate(student.registration_date)}</p>
              )}
              <p>إنشاء: {formatDate(student.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Actions */}
      {!editing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium mr-2">تغيير الحالة:</span>
              {Object.entries(statusLabels).map(([value, label]) => (
                <Button
                  key={value}
                  variant={student.status === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(value as Student['status'])}
                  disabled={student.status === value}
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className="flex items-center gap-2"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Personal Tab */}
          {activeTab === "personal" && (
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الشخصية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">الاسم الأول (عربي) *</label>
                    <Input {...register("first_name_ar")} className={`mt-1 ${errors.first_name_ar ? "border-destructive" : ""}`} />
                    {errors.first_name_ar && <p className="text-xs text-destructive mt-1">{errors.first_name_ar.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">اسم العائلة (عربي) *</label>
                    <Input {...register("last_name_ar")} className={`mt-1 ${errors.last_name_ar ? "border-destructive" : ""}`} />
                    {errors.last_name_ar && <p className="text-xs text-destructive mt-1">{errors.last_name_ar.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">رقم الطالبة</label>
                    <Input {...register("registration_number")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">رقم الهوية</label>
                    <Input {...register("national_id")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">الاسم الأول (إنجليزي)</label>
                    <Input {...register("first_name_en")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">اسم العائلة (إنجليزي)</label>
                    <Input {...register("last_name_en")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">تاريخ الميلاد</label>
                    <Input type="date" {...register("date_of_birth")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">الجنس</label>
                    <select {...register("gender")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                      <option value="">اختر</option>
                      <option value="female">أنثى</option>
                      <option value="male">ذكر</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">الجنسية</label>
                    <Input {...register("nationality")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">الهاتف</label>
                    <Input {...register("mobile")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">البريد الإلكتروني</label>
                    <Input type="email" {...register("email")} className={`mt-1 ${errors.email ? "border-destructive" : ""}`} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">المدينة</label>
                    <Input {...register("city")} className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">العنوان</label>
                    <Input {...register("address")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">الحالة</label>
                    <select {...register("status")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                      <option value="pending">قيد الانتظار</option>
                      <option value="active">نشط</option>
                      <option value="suspended">معلق</option>
                      <option value="graduated">متخرج</option>
                      <option value="withdrawn">منسحب</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guardian Tab */}
          {activeTab === "guardian" && (
            <Card>
              <CardHeader>
                <CardTitle>معلومات ولي الأمر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">اسم ولي الأمر</label>
                    <Input {...register("guardian_name")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">العلاقة</label>
                    <Input {...register("guardian_relationship")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">هاتف ولي الأمر</label>
                    <Input {...register("guardian_phone")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">واتساب</label>
                    <Input {...register("guardian_whatsapp")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">بريد ولي الأمر</label>
                    <Input type="email" {...register("guardian_email")} className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">عنوان ولي الأمر</label>
                    <Input {...register("guardian_address")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">جهة الطوارئ</label>
                    <Input {...register("emergency_contact_name")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">هاتف الطوارئ</label>
                    <Input {...register("emergency_contact_phone")} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical Tab */}
          {activeTab === "medical" && (
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الطبية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">فصيلة الدم</label>
                    <Input {...register("blood_group")} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">الحساسيات</label>
                    <Input {...register("allergies")} className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">الحالات الطبية</label>
                    <textarea
                      {...register("medical_conditions")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <Card>
              <CardHeader>
                <CardTitle>ملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium">ملاحظات</label>
                  <textarea
                    {...register("notes")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[150px] mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
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
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "رقم الطالبة", value: student.student_number },
                { label: "رقم التسجيل", value: student.registration_number },
                { label: "رقم الهوية", value: student.national_id },
                { label: "تاريخ الميلاد", value: student.date_of_birth ? formatDate(student.date_of_birth) : null },
                { label: "العمر", value: student.age ? `${student.age} سنة` : null },
                { label: "الجنس", value: student.gender === "male" ? "ذكر" : student.gender === "female" ? "أنثى" : null },
                { label: "الجنسية", value: student.nationality },
                { label: "المدينة", value: student.city },
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

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" /> معلومات الاتصال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.mobile && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.mobile}</span>
                </div>
              )}
              {student.alternative_mobile && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.alternative_mobile}</span>
                </div>
              )}
              {student.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.email}</span>
                </div>
              )}
              {student.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.address}</span>
                </div>
              )}
              {!student.mobile && !student.email && (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد معلومات اتصال</p>
              )}
            </CardContent>
          </Card>

          {/* Guardian Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> ولي الأمر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.guardian_name && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">الاسم</span>
                  <span className="text-sm font-medium">{student.guardian_name}</span>
                </div>
              )}
              {student.guardian_relationship && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">العلاقة</span>
                  <span className="text-sm font-medium">{student.guardian_relationship}</span>
                </div>
              )}
              {student.guardian_phone && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">الهاتف</span>
                  <span className="text-sm font-medium">{student.guardian_phone}</span>
                </div>
              )}
              {student.guardian_whatsapp && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">واتساب</span>
                  <span className="text-sm font-medium">{student.guardian_whatsapp}</span>
                </div>
              )}
              {!student.guardian_name && (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد معلومات ولي الأمر</p>
              )}
            </CardContent>
          </Card>

          {/* Medical Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" /> المعلومات الطبية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.blood_group && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">فصيلة الدم</span>
                  <span className="text-sm font-medium">{student.blood_group}</span>
                </div>
              )}
              {student.allergies && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">الحساسيات</span>
                  <span className="text-sm font-medium">{student.allergies}</span>
                </div>
              )}
              {student.medical_conditions && (
                <div>
                  <span className="text-sm text-muted-foreground">الحالات الطبية</span>
                  <p className="text-sm mt-1">{student.medical_conditions}</p>
                </div>
              )}
              {!student.blood_group && !student.medical_conditions && (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد معلومات طبية</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {student.notes && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> ملاحظات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{student.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <StudentDetailContent id={id} />
    </Suspense>
  );
}
