"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإشعارات</h1>
        <p className="text-muted-foreground">عرض جميع الإشعارات</p>
      </div>
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">لا توجد إشعارات</h3>
            <p className="text-muted-foreground mt-1">ستظهر الإشعارات هنا</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
