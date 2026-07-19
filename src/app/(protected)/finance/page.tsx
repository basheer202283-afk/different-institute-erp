"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">المالية</h1>
        <p className="text-muted-foreground">إدارة المالية والفواتير</p>
      </div>
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">قيد التطوير</h3>
            <p className="text-muted-foreground mt-1">سيتم إضافة هذا القسم قريباً</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
