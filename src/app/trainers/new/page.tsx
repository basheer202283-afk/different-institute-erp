"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTrainer } from "@/lib/hooks/use-trainers";
import { trainerFormSchema, type TrainerFormValues } from "@/lib/validators/trainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import Link from "next/link";

export default function NewTrainerPage() {
  const router = useRouter();
  const createTrainer = useCreateTrainer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerFormSchema),
    defaultValues: {
      status: "active",
      experience_years: 0,
    },
  });

  const onSubmit = async (data: TrainerFormValues) => {
    try {
      await createTrainer.mutateAsync(data);
      router.push("/trainers");
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trainers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">إضافة مدرب جديد</h1>
          <p className="text-muted-foreground">أدخل بيانات المدرب</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> معلومات المدرب
            </CardTitle>
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
                  placeholder="المؤهلات والشهادات..."
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm font-medium">نبذة تعريفية</label>
                <textarea
                  {...register("bio")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] mt-1"
                  placeholder="نبذة عن المدرب..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/trainers">إلغاء</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" /> حفظ المدرب
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
