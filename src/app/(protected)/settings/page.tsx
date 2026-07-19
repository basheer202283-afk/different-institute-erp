"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground">إعدادات النظام</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>إعدادات عامة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">سيتم إضافة الإعدادات قريباً</p>
        </CardContent>
      </Card>
    </div>
  );
}
