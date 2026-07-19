"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeFormSchema, type EmployeeFormValues } from "@/lib/validators/employee";
import { useCreateEmployee, useDepartments } from "@/lib/hooks/use-employees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Save, User, Briefcase, Phone } from "lucide-react";
import Link from "next/link";

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmp = useCreateEmployee();
  const { data: departments } = useDepartments();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: { status: "active", contract_type: "full_time", hire_date: new Date().toISOString().split("T")[0], salary: 0 },
  });

  const onSubmit = async (data: EmployeeFormValues) => {
    try { await createEmp.mutateAsync(data); router.push("/employees"); } catch { /* handled */ }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/employees"><ArrowRight className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-3xl font-bold tracking-tight">إضافة موظف</h1><p className="text-muted-foreground">إضافة موظف جديد</p></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> البيانات الشخصية</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">الاسم بالعربية *</label><Input {...register("first_name_ar")} />{errors.first_name_ar && <p className="text-sm text-destructive mt-1">{errors.first_name_ar.message}</p>}</div>
              <div><label className="text-sm font-medium mb-2 block">اسم العائلة بالعربية *</label><Input {...register("last_name_ar")} />{errors.last_name_ar && <p className="text-sm text-destructive mt-1">{errors.last_name_ar.message}</p>}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">الاسم بالإنجليزية</label><Input {...register("first_name_en")} /></div>
              <div><label className="text-sm font-medium mb-2 block">اسم العائلة بالإنجليزية</label><Input {...register("last_name_en")} /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div><label className="text-sm font-medium mb-2 block">رقم الهوية</label><Input {...register("national_id")} /></div>
              <div><label className="text-sm font-medium mb-2 block">تاريخ الميلاد</label><Input type="date" {...register("date_of_birth")} /></div>
              <div><label className="text-sm font-medium mb-2 block">الجنس</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("gender")}>
                  <option value="">اختر</option><option value="male">ذكر</option><option value="female">أنثى</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">الجنسية</label><Input {...register("nationality")} /></div>
              <div><label className="text-sm font-medium mb-2 block">المدينة</label><Input {...register("city")} /></div>
            </div>
            <div><label className="text-sm font-medium mb-2 block">العنوان</label><Input {...register("address")} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> بيانات العمل</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">القسم</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("department_id")}>
                  <option value="">اختر القسم</option>
                  {(departments ?? []).map(d => <option key={d.id} value={d.id}>{d.name_ar || d.name}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium mb-2 block">تاريخ التعيين</label><Input type="date" {...register("hire_date")} /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div><label className="text-sm font-medium mb-2 block">نوع العقد</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("contract_type")}>
                  <option value="full_time">دوام كامل</option><option value="part_time">دوام جزئي</option><option value="temporary">مؤقت</option><option value="internship">تدريب</option>
                </select>
              </div>
              <div><label className="text-sm font-medium mb-2 block">الراتب</label><Input type="number" {...register("salary")} /></div>
              <div><label className="text-sm font-medium mb-2 block">الحالة</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("status")}>
                  <option value="active">نشط</option><option value="inactive">غير نشط</option><option value="on_leave">في إجازة</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> معلومات الاتصال</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">البريد الإلكتروني</label><Input type="email" {...register("email")} />{errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}</div>
              <div><label className="text-sm font-medium mb-2 block">الهاتف</label><Input {...register("phone")} /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">اسم جهة الاتصال الطارئ</label><Input {...register("emergency_contact_name")} /></div>
              <div><label className="text-sm font-medium mb-2 block">هاتف جهة الاتصال الطارئ</label><Input {...register("emergency_contact_phone")} /></div>
            </div>
          </CardContent>
        </Card>

        <Card><CardHeader><CardTitle>ملاحظات</CardTitle></CardHeader><CardContent>
          <textarea className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("notes")} placeholder="ملاحظات..." />
        </CardContent></Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" asChild><Link href="/employees">إلغاء</Link></Button>
          <Button type="submit" disabled={isSubmitting || createEmp.isPending}>
            {isSubmitting || createEmp.isPending ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري الحفظ...</> : <><Save className="ml-2 h-4 w-4" />حفظ</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
