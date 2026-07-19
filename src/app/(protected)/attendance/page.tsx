"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الحضور</h1>
        <p className="text-muted-foreground">تسجيل ومتابعة الحضور</p>
      </div>
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <CalendarCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">قيد التطوير</h3>
            <p className="text-muted-foreground mt-1">سيتم إضافة هذا القسم قريباً</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
