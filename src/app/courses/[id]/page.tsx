"use client";

import React, { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCourse, useUpdateCourse, useUpdateCourseStatus, useDeleteCourse } from "@/lib/hooks/use-courses";
import { courseFormSchema, type CourseFormValues } from "@/lib/validators/course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Edit, Save, Loader2, BookOpen, Clock, Users, DollarSign,
  MapPin, Calendar, GraduationCap, Trash2, X, FileText, Target, Globe
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Course } from "@/lib/types/course";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary",
  published: "default",
  active: "success",
  completed: "default",
  cancelled: "destructive",
  archived: "secondary",
};

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  published: "منشور",
  active: "نشط",
  completed: "مكتمل",
  cancelled: "ملغي",
  archived: "مؤرشف",
};

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  elementary: "أساسي",
  intermediate: "متوسط",
  advanced: "متقدم",
  professional: "احترافي",
  expert: "خبير",
};

function CourseDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";
  const { data: course, isLoading } = useCourse(id);
  const updateCourse = useUpdateCourse();
  const updateStatus = useUpdateCourseStatus();
  const deleteCourse = useDeleteCourse();
  const [editing, setEditing] = useState(isEditing);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
  });

  // Set form values when course data loads
  React.useEffect(() => {
    if (course && editing) {
      reset({
        name: course.name,
        code: course.code,
        description: course.description ?? undefined,
        academic_level: course.academic_level,
        status: course.status,
        credits: course.credits ?? undefined,
        duration_hours: course.duration_hours ?? undefined,
        max_students: course.max_students ?? undefined,
        min_students: course.min_students ?? undefined,
        price: course.price ?? undefined,
        currency: course.currency ?? undefined,
        start_date: course.start_date ?? undefined,
        end_date: course.end_date ?? undefined,
        syllabus: course.syllabus ?? undefined,
        objectives: course.objectives ?? undefined,
        materials: course.materials ?? undefined,
        is_online: course.is_online ?? false,
        online_link: course.online_link ?? undefined,
        location: course.location ?? undefined,
      });
    }
  }, [course, editing, reset]);

  const onSubmit = async (data: CourseFormValues) => {
    try {
      await updateCourse.mutateAsync({ id, data });
      setEditing(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleStatusChange = async (status: Course['status']) => {
    await updateStatus.mutateAsync({ id, status });
  };

  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذه الدورة؟")) {
      await deleteCourse.mutateAsync(id);
      router.push("/courses");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">الدورة غير موجودة</h2>
        <Button className="mt-4" asChild>
          <Link href="/courses">العودة للقائمة</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <p className="text-muted-foreground">{course.code}</p>
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
            <div className="h-16 w-16 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{course.name}</h2>
              <p className="text-muted-foreground">{course.code}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusColors[course.status]}>
                  {statusLabels[course.status]}
                </Badge>
                <Badge variant="outline">
                  {levelLabels[course.academic_level]}
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>إنشاء: {formatDate(course.created_at)}</p>
              {course.start_date && <p>البدء: {formatDate(course.start_date)}</p>}
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
                  variant={course.status === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(value as Course['status'])}
                  disabled={course.status === value}
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
          <Card>
            <CardHeader>
              <CardTitle>تعديل الدورة</CardTitle>
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
                <div>
                  <label className="text-sm font-medium">السعر</label>
                  <Input type="number" {...register("price")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">الساعات</label>
                  <Input type="number" {...register("duration_hours")} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">الوصف</label>
                  <textarea
                    {...register("description")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] mt-1"
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
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> معلومات الدورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "الرمز", value: course.code },
                { label: "المستوى", value: levelLabels[course.academic_level] },
                { label: "الحالة", value: statusLabels[course.status] },
                { label: "السعر", value: formatCurrency(course.price, course.currency) },
                { label: "الساعات", value: course.duration_hours ? `${course.duration_hours} ساعة` : null },
                { label: "الحد الأقصى", value: course.max_students ? `${course.max_students} طالب` : null },
                { label: "تاريخ البدء", value: course.start_date ? formatDate(course.start_date) : null },
                { label: "تاريخ الانتهاء", value: course.end_date ? formatDate(course.end_date) : null },
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

          {/* Location & Online */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> الموقع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{course.location}</span>
                </div>
              )}
              {course.is_online && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">عبر الإنترنت</span>
                  {course.online_link && (
                    <a href={course.online_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      رابط الدورة
                    </a>
                  )}
                </div>
              )}
              {!course.location && !course.is_online && (
                <p className="text-sm text-muted-foreground text-center py-4">لا يوجد موقع محدد</p>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {course.description && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>الوصف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{course.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Syllabus */}
          {course.syllabus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> المنهج
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{course.syllabus}</p>
              </CardContent>
            </Card>
          )}

          {/* Objectives */}
          {course.objectives && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" /> الأهداف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{course.objectives}</p>
              </CardContent>
            </Card>
          )}

          {/* Materials */}
          {course.materials && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>المواد التعليمية</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{course.materials}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CourseDetailContent id={id} />
    </Suspense>
  );
}
