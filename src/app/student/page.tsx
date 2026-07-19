"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function StudentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الطالبات</h1>
          <p className="text-muted-foreground">إدارة بيانات الطالبات</p>
        </div>
        <Button asChild><Link href="/student/new"><Plus className="ml-2 h-4 w-4" /> إضافة طالبة</Link></Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث عن طالبة..." className="pr-9" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">لا توجد طالبات</h3>
            <p className="text-muted-foreground mt-1">ابدأ بإضافة أول طالبة</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
