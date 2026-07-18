"use client";

import { useNotifications, useMarkNotificationRead } from "@/lib/hooks/use-operations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Bell, Loader2, Check, Info, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

type Notif = { id: string; type: string; title: string; body: string | null; is_read: boolean; created_at: string; action_url: string | null; action_label: string | null };

const typeIcons: Record<string, React.ElementType> = { info: Info, warning: AlertTriangle, success: CheckCircle2, error: XCircle, reminder: Clock, announcement: Bell, task: Check, payment: CheckCircle2, attendance: Clock, system: Bell };
const typeColors: Record<string, string> = { info: "text-blue-500", warning: "text-yellow-500", success: "text-green-500", error: "text-red-500", reminder: "text-purple-500", announcement: "text-indigo-500", task: "text-orange-500", payment: "text-green-500", attendance: "text-teal-500", system: "text-gray-500" };

export default function NotificationsPage() {
  const { data: notifsRaw, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const notifs = (notifsRaw ?? []) as Notif[];
  const unread = notifs.filter((n) => !n.is_read).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Notifications</h1><p className="text-muted-foreground">{unread} unread notifications</p></div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">All Notifications</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : notifs.length > 0 ? (
            <div className="space-y-2">
              {notifs.map((n) => {
                const Icon = typeIcons[n.type] ?? Bell;
                return (
                  <div key={n.id} className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${n.is_read ? "bg-background" : "bg-primary/5"}`}>
                    <div className={`mt-0.5 ${typeColors[n.type] ?? "text-gray-500"}`}><Icon className="h-5 w-5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.is_read ? "font-normal" : "font-semibold"}`}>{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead.mutate(n.id)}><Check className="h-4 w-4" /></Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12"><Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-semibold">No notifications</h3><p className="text-muted-foreground mt-1">You&apos;re all caught up!</p></div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
