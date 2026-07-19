"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/student"><ArrowRight className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">إضافة طالبة جديدة</h1>
          <p className="text-muted-foreground">أدخل بيانات الطالبة</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>بيانات الطالبة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="text-sm font-medium">الاسم الأول *</label><Input placeholder="الاسم" className="mt-1" /></div>
            <div><label className="text-sm font-medium">اسم العائلة *</label><Input placeholder="العائلة" className="mt-1" /></div>
            <div><label className="text-sm font-medium">رقم الطالبة *</label><Input placeholder="STU-001" className="mt-1" /></div>
            <div><label className="text-sm font-medium">البريد الإلكتروني</label><Input type="email" placeholder="name@example.com" className="mt-1" /></div>
            <div><label className="text-sm font-medium">رقم الهاتف</label><Input placeholder="+967" className="mt-1" /></div>
            <div><label className="text-sm font-medium">تاريخ الميلاد</label><Input type="date" className="mt-1" /></div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" asChild><Link href="/student">إلغاء</Link></Button>
            <Button><Save className="ml-2 h-4 w-4" /> حفظ</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
