"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePayment, useStudents } from "@/lib/hooks/use-finance";
import { paymentFormSchema, type PaymentFormValues } from "@/lib/validators/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, Receipt } from "lucide-react";
import Link from "next/link";

export default function NewPaymentPage() {
  const router = useRouter();
  const createPayment = useCreatePayment();
  const { data: students } = useStudents();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      status: "paid",
      currency: "YER",
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      await createPayment.mutateAsync(data);
      router.push("/finance");
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/finance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">تسجيل دفعة جديدة</h1>
          <p className="text-muted-foreground">أدخل بيانات الدفعة</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" /> بيانات الدفعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium">الطالبة *</label>
                <select {...register("student_id")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="">اختر الطالبة</option>
                  {(students as any[])?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name_ar} {s.last_name_ar} ({s.student_number})
                    </option>
                  ))}
                </select>
                {errors.student_id && <p className="text-xs text-destructive mt-1">{errors.student_id.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">رقم الدفعة *</label>
                <Input {...register("payment_number")} className={`mt-1 ${errors.payment_number ? "border-destructive" : ""}`} placeholder="PAY-001" />
                {errors.payment_number && <p className="text-xs text-destructive mt-1">{errors.payment_number.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">المبلغ *</label>
                <Input type="number" {...register("amount")} className={`mt-1 ${errors.amount ? "border-destructive" : ""}`} />
                {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">طريقة الدفع *</label>
                <select {...register("payment_method")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="cash">نقدي</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="credit_card">بطاقة ائتمان</option>
                  <option value="debit_card">بطاقة خصم</option>
                  <option value="online">دفع إلكتروني</option>
                  <option value="mobile_payment">دفع عبر الهاتف</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">تاريخ الدفع *</label>
                <Input type="date" {...register("payment_date")} className={`mt-1 ${errors.payment_date ? "border-destructive" : ""}`} />
                {errors.payment_date && <p className="text-xs text-destructive mt-1">{errors.payment_date.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">الحالة</label>
                <select {...register("status")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="paid">مدفوع</option>
                  <option value="pending">قيد الانتظار</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">رقم المرجع</label>
                <Input {...register("reference_number")} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">العملة</label>
                <Input {...register("currency")} className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">ملاحظات</label>
                <textarea {...register("notes")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] mt-1" placeholder="ملاحظات..." />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/finance">إلغاء</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...</> : <><Save className="ml-2 h-4 w-4" /> تسجيل الدفعة</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
