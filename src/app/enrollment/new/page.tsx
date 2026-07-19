"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enrollmentFormSchema, type EnrollmentFormValues } from "@/lib/validators/enrollment";
import { useCreateEnrollment, useAvailableClasses, useSemesters } from "@/lib/hooks/use-enrollments";
import { useStudents } from "@/lib/hooks/use-students";
import { useCourses } from "@/lib/hooks/use-courses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, Loader2, Save, UserPlus, BookOpen, CalendarCheck,
  CreditCard, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function NewEnrollmentPage() {
  const router = useRouter();
  const createEnrollment = useCreateEnrollment();
  const [searchStudent, setSearchStudent] = useState("");
  const [searchCourse, setSearchCourse] = useState("");

  const { data: studentsData } = useStudents({ search: searchStudent, pageSize: 20 });
  const { data: coursesData } = useCourses({ search: searchCourse, pageSize: 20, status: "active" });
  const { data: classes } = useAvailableClasses();
  const { data: semesters } = useSemesters();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentFormSchema),
    defaultValues: {
      status: "pending",
      payment_status: "pending",
      total_fees: 0,
      paid_amount: 0,
      discount_amount: 0,
      enrollment_date: new Date().toISOString().split("T")[0],
    },
  });

  const selectedStudentId = watch("student_id");
  const selectedCourseId = watch("course_id");
  const selectedClassId = watch("class_id");
  const totalFees = watch("total_fees") || 0;
  const discountAmount = watch("discount_amount") || 0;

  const selectedStudent = studentsData?.data.find((s) => s.id === selectedStudentId);
  const selectedCourse = coursesData?.data.find((c) => c.id === selectedCourseId);

  const filteredClasses = (classes ?? []).filter(
    (c) => !selectedCourseId || c.course_id === selectedCourseId
  );

  const onSubmit = async (data: EnrollmentFormValues) => {
    try {
      await createEnrollment.mutateAsync(data);
      router.push("/enrollment");
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/enrollment">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تسجيل جديد</h1>
          <p className="text-muted-foreground">تسجيل طالبة في دورة تدريبية</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              اختيار الطالبة
            </CardTitle>
            <CardDescription>ابحث عن الطالبة المراد تسجيلها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="بحث بالاسم أو رقم الطالبة..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>

            {errors.student_id && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.student_id.message}
              </p>
            )}

            <input type="hidden" {...register("student_id")} />

            {selectedStudent ? (
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {selectedStudent.first_name_ar?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedStudent.first_name_ar} {selectedStudent.last_name_ar}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      رقم: {selectedStudent.student_number}
                      {selectedStudent.mobile && ` • ${selectedStudent.mobile}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mr-auto"
                    onClick={() => setValue("student_id", "")}
                  >
                    تغيير
                  </Button>
                </div>
              </div>
            ) : (
              studentsData && studentsData.data.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {studentsData.data.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      className="w-full p-3 rounded-lg border text-right hover:bg-accent transition-colors flex items-center gap-3"
                      onClick={() => setValue("student_id", student.id, { shouldValidate: true })}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {student.first_name_ar?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {student.first_name_ar} {student.last_name_ar}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.student_number}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              اختيار الدورة
            </CardTitle>
            <CardDescription>اختر الدورة التدريبية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="بحث بالاسم أو الرمز..."
                value={searchCourse}
                onChange={(e) => setSearchCourse(e.target.value)}
              />
            </div>

            {errors.course_id && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.course_id.message}
              </p>
            )}

            <input type="hidden" {...register("course_id")} />

            {selectedCourse ? (
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedCourse.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCourse.code} • {formatCurrency(selectedCourse.price)}
                      {selectedCourse.duration_hours && ` • ${selectedCourse.duration_hours} ساعة`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mr-auto"
                    onClick={() => setValue("course_id", "")}
                  >
                    تغيير
                  </Button>
                </div>
              </div>
            ) : (
              coursesData && coursesData.data.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {coursesData.data.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      className="w-full p-3 rounded-lg border text-right hover:bg-accent transition-colors flex items-center gap-3"
                      onClick={() => {
                        setValue("course_id", course.id, { shouldValidate: true });
                        setValue("total_fees", course.price || 0);
                      }}
                    >
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{course.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.code} • {formatCurrency(course.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Class/Batch & Semester Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              الدفعة والفصل الدراسي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">الفصل الدراسي</label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  {...register("semester_id")}
                >
                  <option value="">اختر الفصل الدراسي (اختياري)</option>
                  {(semesters ?? []).map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name} ({semester.code})
                      {semester.is_current && " - الحالي"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الفصل / الدفعة</label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  {...register("class_id")}
                >
                  <option value="">اختر الفصل (اختياري)</option>
                  {filteredClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.code})
                      {cls.max_students &&
                        ` [${cls.current_students}/${cls.max_students}]`}
                    </option>
                  ))}
                </select>
                {selectedClassId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {(() => {
                      const c = filteredClasses.find((cl) => cl.id === selectedClassId);
                      if (!c) return "";
                      return c.max_students
                        ? c.current_students >= c.max_students
                          ? "⚠️ الفصل ممتلئ"
                          : `${c.current_students}/${c.max_students} طالبة`
                        : `${c.current_students} طالبة`;
                    })()}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">تاريخ التسجيل</label>
                <Input type="date" {...register("enrollment_date")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">تاريخ البداية</label>
                <Input type="date" {...register("start_date")} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">تاريخ النهاية</label>
              <Input type="date" {...register("end_date")} className="md:w-1/2" />
            </div>
          </CardContent>
        </Card>

        {/* Fees & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              الرسوم والدفع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">إجمالي الرسوم</label>
                <Input type="number" {...register("total_fees")} />
                {errors.total_fees && (
                  <p className="text-sm text-destructive mt-1">{errors.total_fees.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">المبلغ المدفوع</label>
                <Input type="number" {...register("paid_amount")} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">الخصم</label>
                <Input type="number" {...register("discount_amount")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">سبب الخصم</label>
                <Input {...register("discount_reason")} placeholder="سبب الخصم (اختياري)" />
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span>إجمالي الرسوم:</span>
                <span className="font-medium">{formatCurrency(totalFees)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>الخصم:</span>
                <span className="text-green-600">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2">
                <span>المستحق:</span>
                <span>{formatCurrency(totalFees - discountAmount)}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">حالة التسجيل</label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  {...register("status")}
                >
                  <option value="pending">قيد المراجعة</option>
                  <option value="approved">معتمد</option>
                  <option value="active">نشط</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">حالة الدفع</label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  {...register("payment_status")}
                >
                  <option value="pending">غير مدفوع</option>
                  <option value="partial">مدفوع جزئياً</option>
                  <option value="paid">مدفوع بالكامل</option>
                  <option value="waived">معفي</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>ملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="ملاحظات إضافية..."
              {...register("notes")}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/enrollment">إلغاء</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || createEnrollment.isPending}>
            {isSubmitting || createEnrollment.isPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                إنشاء التسجيل
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
