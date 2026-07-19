"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateStudent } from "@/lib/hooks/use-students";
import { studentFormSchema, type StudentFormValues } from "@/lib/validators/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, User, Shield, Heart, FileText } from "lucide-react";
import Link from "next/link";

export default function NewStudentPage() {
  const router = useRouter();
  const createStudent = useCreateStudent();
  const [activeTab, setActiveTab] = useState("personal");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      status: "pending",
      country: "اليمن",
    },
  });

  const onSubmit = async (data: StudentFormValues) => {
    try {
      await createStudent.mutateAsync(data);
      router.push("/students");
    } catch (error) {
      // Error handled by hook
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold">إضافة طالبة جديدة</h1>
          <p className="text-muted-foreground">أدخل بيانات الطالبة</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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

        {/* Personal Information */}
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
                  <label className="text-sm font-medium">هاتف بديل</label>
                  <Input {...register("alternative_mobile")} className="mt-1" />
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
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guardian Information */}
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
                  <Input type="email" {...register("guardian_email")} className={`mt-1 ${errors.guardian_email ? "border-destructive" : ""}`} />
                  {errors.guardian_email && <p className="text-xs text-destructive mt-1">{errors.guardian_email.message}</p>}
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

        {/* Medical Information */}
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
                    placeholder="أي حالات مرضية..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {activeTab === "notes" && (
          <Card>
            <CardHeader>
              <CardTitle>ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium">ملاحظات إضافية</label>
                <textarea
                  {...register("notes")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[150px] mt-1"
                  placeholder="أضف ملاحظات..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/students">إلغاء</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" /> حفظ الطالبة
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
