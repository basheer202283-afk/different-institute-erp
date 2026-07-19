"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الشهادات</h1>
        <p className="text-muted-foreground">إدارة الشهادات</p>
      </div>
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">الشهادات</h3>
            <p className="text-muted-foreground mt-1">إنشاء وإدارة شهادات الطالبات</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
