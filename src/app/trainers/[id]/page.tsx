"use client";

import React, { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTrainer, useUpdateTrainer, useUpdateTrainerStatus, useDeleteTrainer } from "@/lib/hooks/use-trainers";
import { trainerFormSchema, type TrainerFormValues } from "@/lib/validators/trainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Edit, Save, Loader2, User, BookOpen, Phone, Mail,
  Trash2, X, Clock, DollarSign
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "@/lib/utils";
import type { Trainer } from "@/lib/types/trainer";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  inactive: "secondary",
  suspended: "destructive",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  inactive: "غير نشط",
  suspended: "معلق",
};

function TrainerDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";
  const { data: trainer, isLoading } = useTrainer(id);
  const updateTrainer = useUpdateTrainer();
  const updateStatus = useUpdateTrainerStatus();
  const deleteTrainer = useDeleteTrainer();
  const [editing, setEditing] = useState(isEditing);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerFormSchema),
  });

  // Set form values when trainer data loads
  React.useEffect(() => {
    if (trainer && editing) {
      reset({
        first_name: trainer.first_name,
        last_name: trainer.last_name,
        email: trainer.email ?? undefined,
        phone: trainer.phone ?? undefined,
        employee_number: trainer.employee_number ?? undefined,
        specialization: trainer.specialization ?? undefined,
        qualifications: trainer.qualifications ?? undefined,
        experience_years: trainer.experience_years ?? undefined,
        hourly_rate: trainer.hourly_rate ?? undefined,
        bio: trainer.bio ?? undefined,
        status: trainer.status,
      });
    }
  }, [trainer, editing, reset]);

  const onSubmit = async (data: TrainerFormValues) => {
    try {
      await updateTrainer.mutateAsync({ id, data });
      setEditing(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleStatusChange = async (status: Trainer['status']) => {
    await updateStatus.mutateAsync({ id, status });
  };

  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذا المدرب؟")) {
      await deleteTrainer.mutateAsync(id);
      router.push("/trainers");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">المدرب غير موجود</h2>
        <Button className="mt-4" asChild>
          <Link href="/trainers">العودة للقائمة</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trainers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {trainer.first_name} {trainer.last_name}
          </h1>
          <p className="text-muted-foreground">{trainer.employee_number ?? trainer.specialization ?? "مدرب"}</p>
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
            <div className="h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl font-bold text-purple-600">
              {trainer.first_name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {trainer.first_name} {trainer.last_name}
              </h2>
              {trainer.specialization && (
                <p className="text-muted-foreground">{trainer.specialization}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusColors[trainer.status]}>
                  {statusLabels[trainer.status]}
                </Badge>
                {trainer.employee_number && (
                  <span className="text-sm text-muted-foreground">{trainer.employee_number}</span>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>إنشاء: {formatDate(trainer.created_at)}</p>
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
                  variant={trainer.status === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(value as Trainer['status'])}
                  disabled={trainer.status === value}
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
              <CardTitle>تعديل بيانات المدرب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">الاسم الأول *</label>
                  <Input {...register("first_name")} className={`mt-1 ${errors.first_name ? "border-destructive" : ""}`} />
                  {errors.first_name && <p className="text-xs text-destructive mt-1">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">اسم العائلة *</label>
                  <Input {...register("last_name")} className={`mt-1 ${errors.last_name ? "border-destructive" : ""}`} />
                  {errors.last_name && <p className="text-xs text-destructive mt-1">{errors.last_name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">رقم الموظف</label>
                  <Input {...register("employee_number")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input type="email" {...register("email")} className={`mt-1 ${errors.email ? "border-destructive" : ""}`} />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">الهاتف</label>
                  <Input {...register("phone")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">التخصص</label>
                  <Input {...register("specialization")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">سنوات الخبرة</label>
                  <Input type="number" {...register("experience_years")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">أجر الساعة</label>
                  <Input type="number" {...register("hourly_rate")} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">الحالة</label>
                  <select {...register("status")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">معلق</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">المؤهلات</label>
                  <textarea
                    {...register("qualifications")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] mt-1"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-sm font-medium">نبذة تعريفية</label>
                  <textarea
                    {...register("bio")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                { label: "رقم الموظف", value: trainer.employee_number },
                { label: "التخصص", value: trainer.specialization },
                { label: "سنوات الخبرة", value: trainer.experience_years ? `${trainer.experience_years} سنوات` : null },
                { label: "أجر الساعة", value: trainer.hourly_rate ? `${trainer.hourly_rate} ر.ي` : null },
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
              {trainer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{trainer.phone}</span>
                </div>
              )}
              {trainer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{trainer.email}</span>
                </div>
              )}
              {!trainer.phone && !trainer.email && (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد معلومات اتصال</p>
              )}
            </CardContent>
          </Card>

          {/* Qualifications */}
          {trainer.qualifications && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> المؤهلات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{trainer.qualifications}</p>
              </CardContent>
            </Card>
          )}

          {/* Bio */}
          {trainer.bio && (
            <Card>
              <CardHeader>
                <CardTitle>نبذة تعريفية</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{trainer.bio}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <TrainerDetailContent id={id} />
    </Suspense>
  );
}
