"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function InstitutePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">المعهد</h1>
        <p className="text-muted-foreground">معلومات المعهد</p>
      </div>
      <Card>
        <CardHeader><CardTitle>معلومات المعهد</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">سيتم إضافة معلومات المعهد قريباً</p>
        </CardContent>
      </Card>
    </div>
  );
}
