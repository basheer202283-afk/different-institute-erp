"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TrainerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المدربات</h1>
          <p className="text-muted-foreground">إدارة بيانات المدربات</p>
        </div>
        <Button asChild><Link href="/trainer/new"><Plus className="ml-2 h-4 w-4" /> إضافة مدربة</Link></Button>
      </div>
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">لا توجد مدربات</h3>
            <p className="text-muted-foreground mt-1">ابدأ بإضافة أول مدربة</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
