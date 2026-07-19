"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function SharedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">المستندات المشتركة</h1>
        <p className="text-muted-foreground">إدارة المستندات والملفات</p>
      </div>
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">المستندات المشتركة</h3>
            <p className="text-muted-foreground mt-1">مشاركة وإدارة المستندات</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
