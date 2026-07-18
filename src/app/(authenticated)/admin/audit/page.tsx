"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Shield, Search, Loader2, Clock, User, FileText } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useState } from "react";

type AuditLog = { id: string; action: string; resource_type: string; resource_id: string | null; user_id: string | null; created_at: string; ip_address: string | null; old_values: unknown; new_values: unknown };

const actionColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  create: "success", read: "secondary", update: "default", delete: "destructive",
  login: "success", logout: "secondary", approve: "success", reject: "destructive",
};

export default function AuditPage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [search, setSearch] = useState("");

  const { data: logsRaw, isLoading } = useQuery({
    queryKey: ["audit_logs", tenantId],
    queryFn: async () => {
      if (!tenantId) return [] as AuditLog[];
      const { data } = await createClient().from("audit_logs").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(200);
      return (data ?? []) as AuditLog[];
    },
    enabled: !!tenantId,
  });

  const logs = (logsRaw ?? []).filter((l) =>
    !search || l.action.includes(search.toLowerCase()) || l.resource_type.includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Audit Log</h1><p className="text-muted-foreground">Track all system activities</p></div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search audit logs..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Activity Log ({logs.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={actionColors[log.action] ?? "secondary"} className="text-[10px]">{log.action}</Badge>
                      <span className="text-sm font-medium">{log.resource_type}</span>
                      {log.resource_id && <span className="text-xs text-muted-foreground font-mono">{log.resource_id.slice(0, 8)}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDateTime(log.created_at)}</span>
                      {log.ip_address && <span>{log.ip_address}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12"><Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-semibold">No audit logs</h3><p className="text-muted-foreground mt-1">Activity will appear here</p></div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
