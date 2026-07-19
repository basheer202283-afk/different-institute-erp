"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCourse } from "@/lib/hooks/use-courses";
import { courseFormSchema, type CourseFormValues } from "@/lib/validators/course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, BookOpen, Users, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const [activeTab, setActiveTab] = useState("basic");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      status: "draft",
      academic_level: "beginner",
      credits: 0,
      min_students: 1,
      price: 0,
      currency: "YER",
      is_online: false,
    },
  });

  const onSubmit = async (data: CourseFormValues) => {
    try {
      await createCourse.mutateAsync(data);
      router.push("/courses");
    } catch (error) {
      // Error handled by hook
    }
  };

  const tabs = [
    { id: "basic", label: "المعلومات الأساسية", icon: BookOpen },
    { id: "details", label: "التفاصيل", icon: Clock },
    { id: "settings", label: "الإعدادات", icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">إضافة دورة جديدة</h1>
          <p className="text-muted-foreground">أدخل بيانات الدورة</p>
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

        {/* Basic Information */}
        {activeTab === "basic" && (
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">اسم الدورة *</label>
                  <Input {...register("name")} className={`mt-1 ${errors.name ? "border-destructive" : ""}`} />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">رمز الدورة *</label>
                  <Input {...register("code")} className={`mt-1 ${errors.code ? "border-destructive" : ""}`} />
                  {errors.code && <p className="text-xs text-destructive mt-1">{errors.code.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">المستوى الأكاديمي</label>
                  <select {...register("academic_level")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                    <option value="beginner">مبتدئ</option>
                    <option value="elementary">أساسي</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                    <option value="professional">احترافي</option>
                    <option value="expert">خبير</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">الحالة</label>
                  <select {...register("status")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                    <option value="draft">مسودة</option>
                    <option value="published">منشور</option>
                    <option value="active">نشط</option>
                    <option value="completed">مكتمل</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">الوصف</label>
                  <textarea
                    {...register("description")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] mt-1"
                    placeholder="وصف الدورة..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details */}
        {activeTab === "details" && (
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الدورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">الساعات</label>
                  <Input type="number" {...register("duration_hours")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">السعر</label>
                  <Input type="number" {...register("price")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">الحد الأقصى للطلاب</label>
                  <Input type="number" {...register("max_students")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">تاريخ البدء</label>
                  <Input type="date" {...register("start_date")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">تاريخ الانتهاء</label>
                  <Input type="date" {...register("end_date")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">الموقع</label>
                  <Input {...register("location")} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">المتطلبات السابقة</label>
                  <textarea
                    {...register("prerequisites")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] mt-1"
                    placeholder="المتطلبات السابقة للدورة..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الدورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">المواد التعليمية</label>
                  <textarea
                    {...register("materials")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] mt-1"
                    placeholder="المواد التعليمية..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">الأهداف</label>
                  <textarea
                    {...register("objectives")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] mt-1"
                    placeholder="أهداف الدورة..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">المنهج</label>
                  <textarea
                    {...register("syllabus")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] mt-1"
                    placeholder="منهج الدورة..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("is_online")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">دورة عبر الإنترنت</label>
                </div>
                {watch("is_online") && (
                  <div>
                    <label className="text-sm font-medium">رابط الدورة</label>
                    <Input {...register("online_link")} className="mt-1" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/courses">إلغاء</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" /> حفظ الدورة
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
