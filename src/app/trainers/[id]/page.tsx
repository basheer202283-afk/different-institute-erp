"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Edit } from "lucide-react";
import Link from "next/link";

export default function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/trainers"><ArrowRight className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">تفاصيل المدربة</h1>
          <p className="text-muted-foreground">رقم: {id}</p>
        </div>
        <Button><Edit className="ml-2 h-4 w-4" /> تعديل</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>بيانات المدربة</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">سيتم تحميل بيانات المدربة هنا</p>
        </CardContent>
      </Card>
    </div>
  );
}
