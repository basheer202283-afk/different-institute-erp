"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import type { TaskFormData, DocumentFormData, CalendarEventFormData } from "@/lib/validators/phase3";

type Task = { id: string; tenant_id: string; assigned_to: string | null; assigned_by: string | null; parent_task_id: string | null; title: string; description: string | null; status: string; priority: string; due_date: string | null; completed_at: string | null; estimated_hours: number | null; actual_hours: number | null; progress: number; tags: string[]; attachments: unknown; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type Document = { id: string; tenant_id: string; uploaded_by: string; documentable_type: string | null; documentable_id: string | null; type: string; name: string; description: string | null; file_path: string; file_size: number | null; mime_type: string | null; version: number; is_public: boolean; is_encrypted: boolean; checksum: string | null; tags: string[]; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type CalendarEvent = { id: string; tenant_id: string; organizer_id: string; type: string; title: string; description: string | null; location: string | null; start_time: string; end_time: string; all_day: boolean; recurrence: string; recurrence_end_date: string | null; color: string | null; is_public: boolean; max_attendees: number | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };
type Notification = { id: string; tenant_id: string; user_id: string; type: string; channel: string; title: string; body: string | null; data: unknown; read_at: string | null; sent_at: string | null; expires_at: string | null; is_read: boolean; is_sent: boolean; action_url: string | null; action_label: string | null; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null };
type Announcement = { id: string; tenant_id: string; author_id: string; type: string; title: string; content: string; summary: string | null; image_url: string | null; is_pinned: boolean; is_published: boolean; published_at: string | null; expires_at: string | null; target_roles: string[]; target_users: string[]; view_count: number; metadata: unknown; created_at: string; updated_at: string; deleted_at: string | null; created_by: string | null; updated_by: string | null };

// Tasks
export function useTasks(params?: { status?: string; priority?: string }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["tasks", tenantId, params?.status, params?.priority],
    queryFn: async () => {
      if (!tenantId) return [] as Task[];
      let q = supabase.from("tasks").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.status && params.status !== "all") q = q.eq("status", params.status);
      if (params?.priority && params.priority !== "all") q = q.eq("priority", params.priority);
      const { data } = await q.order("created_at", { ascending: false });
      return (data ?? []) as Task[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateTask() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: TaskFormData) => { if (!tenantId) throw new Error("No tenant"); const { error } = await (supabase.from("tasks") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Task created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTask() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskFormData> }) => { const { error } = await (supabase.from("tasks") as unknown as { update: (data: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } }).update(data as Record<string, unknown>).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Task updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTask() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase.from("tasks") as unknown as { update: (data: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } }).update({ deleted_at: new Date().toISOString() }).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Task deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Documents
export function useDocuments(params?: { type?: string; search?: string }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["documents", tenantId, params?.type, params?.search],
    queryFn: async () => {
      if (!tenantId) return [] as Document[];
      let q = supabase.from("documents").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.type && params.type !== "all") q = q.eq("type", params.type);
      if (params?.search) q = q.or(`name.ilike.%${params.search}%`);
      const { data } = await q.order("created_at", { ascending: false });
      return (data ?? []) as Document[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateDocument() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: DocumentFormData & { file_path: string; file_size?: number; mime_type?: string }) => {
      if (!tenantId) throw new Error("No tenant");
      const userId = useAuthStore.getState().user?.id;
      const { error } = await (supabase.from("documents") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId, uploaded_by: userId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document uploaded"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Calendar Events
export function useCalendarEvents(params?: { start?: string; end?: string; type?: string }) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["calendar_events", tenantId, params?.start, params?.end, params?.type],
    queryFn: async () => {
      if (!tenantId) return [] as CalendarEvent[];
      let q = supabase.from("calendar_events").select("*").eq("tenant_id", tenantId).is("deleted_at", null);
      if (params?.start) q = q.gte("start_time", params.start);
      if (params?.end) q = q.lte("end_time", params.end);
      if (params?.type && params.type !== "all") q = q.eq("type", params.type);
      const { data } = await q.order("start_time", { ascending: true });
      return (data ?? []) as CalendarEvent[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateCalendarEvent() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: CalendarEventFormData) => {
      if (!tenantId) throw new Error("No tenant");
      const userId = useAuthStore.getState().user?.id;
      const { error } = await (supabase.from("calendar_events") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId, organizer_id: userId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["calendar_events"] }); toast.success("Event created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Notifications
export function useNotifications() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const supabase = createClient();
  return useQuery({
    queryKey: ["notifications", tenantId, userId],
    queryFn: async () => {
      if (!tenantId || !userId) return [] as Notification[];
      const { data } = await supabase.from("notifications").select("*").eq("tenant_id", tenantId).eq("user_id", userId).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
      return (data ?? []) as Notification[];
    },
    enabled: !!tenantId && !!userId,
  });
}

export function useMarkNotificationRead() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase.from("notifications") as unknown as { update: (data: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } }).update({ is_read: true, read_at: new Date().toISOString() }).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
}

// Announcements
export function useAnnouncements() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  return useQuery({
    queryKey: ["announcements", tenantId],
    queryFn: async () => { if (!tenantId) return [] as Announcement[]; const { data } = await supabase.from("announcements").select("*").eq("tenant_id", tenantId).eq("is_published", true).is("deleted_at", null).order("published_at", { ascending: false }); return (data ?? []) as Announcement[]; },
    enabled: !!tenantId,
  });
}

export function useCreateAnnouncement() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: { title: string; content: string; type?: string }) => {
      if (!tenantId) throw new Error("No tenant");
      const userId = useAuthStore.getState().user?.id;
      const { error } = await (supabase.from("announcements") as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({ ...d, tenant_id: tenantId, author_id: userId, is_published: true, published_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); toast.success("Announcement published"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
