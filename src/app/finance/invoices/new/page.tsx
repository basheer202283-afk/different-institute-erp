"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateInvoice, useStudents } from "@/lib/hooks/use-finance";
import { invoiceFormSchema, type InvoiceFormValues } from "@/lib/validators/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, FileText } from "lucide-react";
import Link from "next/link";

export default function NewInvoicePage() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const { data: students } = useStudents();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      status: "draft",
      currency: "YER",
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
    },
  });

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      await createInvoice.mutateAsync(data);
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
          <h1 className="text-2xl font-bold">إنشاء فاتورة جديدة</h1>
          <p className="text-muted-foreground">أدخل بيانات الفاتورة</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> بيانات الفاتورة
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
                <label className="text-sm font-medium">رقم الفاتورة *</label>
                <Input {...register("invoice_number")} className={`mt-1 ${errors.invoice_number ? "border-destructive" : ""}`} placeholder="INV-001" />
                {errors.invoice_number && <p className="text-xs text-destructive mt-1">{errors.invoice_number.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">الحالة</label>
                <select {...register("status")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="draft">مسودة</option>
                  <option value="sent">مرسل</option>
                  <option value="paid">مدفوع</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">تاريخ الإصدار *</label>
                <Input type="date" {...register("issue_date")} className={`mt-1 ${errors.issue_date ? "border-destructive" : ""}`} />
                {errors.issue_date && <p className="text-xs text-destructive mt-1">{errors.issue_date.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">تاريخ الاستحقاق *</label>
                <Input type="date" {...register("due_date")} className={`mt-1 ${errors.due_date ? "border-destructive" : ""}`} />
                {errors.due_date && <p className="text-xs text-destructive mt-1">{errors.due_date.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">العملة</label>
                <Input {...register("currency")} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">المبلغ الفرعي</label>
                <Input type="number" {...register("subtotal")} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">الضريبة</label>
                <Input type="number" {...register("tax_amount")} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">الخصم</label>
                <Input type="number" {...register("discount_amount")} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">المبلغ الإجمالي</label>
                <Input type="number" {...register("total_amount")} className="mt-1" />
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
            {isSubmitting ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...</> : <><Save className="ml-2 h-4 w-4" /> إنشاء الفاتورة</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
