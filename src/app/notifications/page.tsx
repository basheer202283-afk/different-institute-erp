"use client";

import { useState, useCallback } from "react";
import { useNotifications, useNotificationStats, useMarkAsRead, useMarkAllAsRead, useArchiveNotification, useDeleteNotification } from "@/lib/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bell, Search, Loader2, CheckCircle2, AlertCircle, Info, AlertTriangle, Trash2, Archive, Mail, MessageSquare, CheckCheck, Filter, ChevronLeft, ChevronRight, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification, NotificationFilters, NotificationStatus, NotificationType } from "@/lib/types/notification";

const typeColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  info: "default", success: "success", warning: "warning", error: "destructive", reminder: "secondary", announcement: "default",
};

const typeLabels: Record<string, string> = {
  info: "معلومات", success: "نجاح", warning: "تحذير", error: "خطأ", reminder: "تذكير", announcement: "إعلان",
};

const typeIcons: Record<string, React.ElementType> = {
  info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertCircle, reminder: Clock, announcement: Bell,
};

export default function NotificationsPage() {
  const [tab, setTab] = useState("all");
  const [filters, setFilters] = useState<NotificationFilters>({ page: 1, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useNotifications(filters);
  const { data: stats } = useNotificationStats();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const archiveNotif = useArchiveNotification();
  const deleteNotif = useDeleteNotification();

  const handleSearch = useCallback(() => setFilters(p => ({ ...p, search: searchInput, page: 1 })), [searchInput]);
  const handleMarkRead = useCallback(async (id: string) => { await markAsRead.mutateAsync(id); }, [markAsRead]);
  const handleArchive = useCallback(async (id: string) => { await archiveNotif.mutateAsync(id); }, [archiveNotif]);
  const handleDelete = useCallback(async (id: string) => { await deleteNotif.mutateAsync(id); }, [deleteNotif]);

  const notifications = data?.data ?? [];
  const unread = notifications.filter(n => n.status === "unread");
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الإشعارات</h1>
          <p className="text-muted-foreground">مركز الإشعارات والرسائل</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => markAllAsRead.mutate()} disabled={markAllAsRead.isPending}>
            <CheckCheck className="ml-2 h-4 w-4" /> تحديد الكل كمقروء
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Bell className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.total ?? 0}</p><p className="text-xs text-muted-foreground">إجمالي</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><Mail className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.unread ?? 0}</p><p className="text-xs text-muted-foreground">غير مقروءة</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.read ?? 0}</p><p className="text-xs text-muted-foreground">مقروءة</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Clock className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.this_week ?? 0}</p><p className="text-xs text-muted-foreground">هذا الأسبوع</p></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Search */}
      <Card><CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث في الإشعارات..." className="pr-9" value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
          </div>
          <Button variant="outline" onClick={handleSearch}><Search className="ml-2 h-4 w-4" /> بحث</Button>
        </div>
      </CardContent></Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">الكل ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">غير مقروءة ({unread.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <NotificationsList notifications={notifications} isLoading={isLoading} onMarkRead={handleMarkRead} onArchive={handleArchive} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="unread">
          <NotificationsList notifications={unread} isLoading={isLoading} onMarkRead={handleMarkRead} onArchive={handleArchive} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationsList({ notifications, isLoading, onMarkRead, onArchive, onDelete }: {
  notifications: Notification[];
  isLoading: boolean;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) return <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>;
  if (notifications.length === 0) return <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Bell className="h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-semibold">لا توجد إشعارات</h3></CardContent></Card>;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {notifications.map(notif => {
            const Icon = typeIcons[notif.type] || Info;
            return (
              <div key={notif.id} className={`p-4 hover:bg-muted/50 transition-colors flex items-start gap-4 ${notif.status === "unread" ? "bg-primary/5" : ""}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  notif.type === "error" ? "bg-red-100 dark:bg-red-900/30" :
                  notif.type === "warning" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                  notif.type === "success" ? "bg-green-100 dark:bg-green-900/30" :
                  "bg-blue-100 dark:bg-blue-900/30"
                }`}>
                  <Icon className={`h-5 w-5 ${
                    notif.type === "error" ? "text-red-600" :
                    notif.type === "warning" ? "text-yellow-600" :
                    notif.type === "success" ? "text-green-600" :
                    "text-blue-600"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm ${notif.status === "unread" ? "font-semibold" : "font-medium"}`}>{notif.title_ar || notif.title}</p>
                    {notif.status === "unread" && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    <Badge variant={typeColors[notif.type]} className="text-[10px]">{typeLabels[notif.type]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{notif.message_ar || notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(notif.created_at)}</span>
                    {notif.action_url && (
                      <Link href={notif.action_url} className="text-xs text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> {notif.action_label || "عرض"}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {notif.status === "unread" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMarkRead(notif.id)} title="تحديد كمقروء"><CheckCircle2 className="h-4 w-4" /></Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onArchive(notif.id)} title="أرشفة"><Archive className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(notif.id)} title="حذف"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
