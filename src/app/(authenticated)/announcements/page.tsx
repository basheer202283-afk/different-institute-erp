"use client";

import { useState } from "react";
import { useAnnouncements, useCreateAnnouncement } from "@/lib/hooks/use-operations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Megaphone, Plus, Loader2, Pin, Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useAuthContext } from "@/components/providers/auth-provider";

type Announcement = { id: string; title: string; content: string; type: string; is_pinned: boolean; published_at: string | null; view_count: number; summary: string | null };

export default function AnnouncementsPage() {
  const { hasRole } = useAuthContext();
  const { data: announcementsRaw, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "general" });
  const announcements = (announcementsRaw ?? []) as Announcement[];
  const canManage = hasRole("tenant_admin") || hasRole("manager");

  const handleCreate = () => {
    if (!form.title || !form.content) return;
    createAnnouncement.mutate(form, { onSuccess: () => { setShowForm(false); setForm({ title: "", content: "", type: "general" }); } });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Announcements</h1><p className="text-muted-foreground">Institution announcements and updates</p></div>
        {canManage && <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New Announcement</Button>}
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Create Announcement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2"><label className="text-sm font-medium">Title *</label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Announcement title..." className="mt-1" /></div>
              <div><label className="text-sm font-medium">Type</label><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"><option value="general">General</option><option value="academic">Academic</option><option value="financial">Financial</option><option value="event">Event</option><option value="emergency">Emergency</option><option value="maintenance">Maintenance</option></select></div>
            </div>
            <div><label className="text-sm font-medium">Content *</label><textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px] mt-1" placeholder="Announcement content..." /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleCreate} disabled={createAnnouncement.isPending}>{createAnnouncement.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Megaphone className="mr-2 h-4 w-4" />} Publish</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : announcements.length > 0 ? (
          announcements.map((a) => (
            <Card key={a.id} className={a.is_pinned ? "border-primary/20" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={a.type === "emergency" ? "destructive" : a.type === "academic" ? "default" : "secondary"}>{a.type}</Badge>
                      {a.is_pinned && <Badge variant="outline" className="text-[10px]"><Pin className="h-3 w-3 mr-1" /> Pinned</Badge>}
                    </div>
                    <h3 className="text-lg font-semibold">{a.title}</h3>
                    {a.summary && <p className="text-sm text-muted-foreground mt-1">{a.summary}</p>}
                    <p className="text-sm mt-2 whitespace-pre-wrap">{a.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      {a.published_at && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(a.published_at)}</span>}
                      <span>{a.view_count} views</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16"><Megaphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" /><h3 className="text-xl font-semibold">No announcements yet</h3><p className="text-muted-foreground mt-2">Announcements will appear here when published</p></div>
        )}
      </div>
    </motion.div>
  );
}
