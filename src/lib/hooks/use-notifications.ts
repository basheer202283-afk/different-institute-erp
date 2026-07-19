"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type { Notification, NotificationFilters, NotificationStats, PaginatedResponse } from "@/lib/types/notification";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function useNotifications(filters: NotificationFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { search, type, status, channel, page = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ["notifications", organization?.id, search, type, status, channel, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Notification>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (search) query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%,title_ar.ilike.%${search}%`);
      if (type) query = query.eq("type", type);
      if (status) query = query.eq("status", status);
      if (channel) query = query.eq("channel", channel);

      const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;

      return {
        data: (data ?? []) as Notification[],
        count: count ?? 0, page, pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    enabled: !!organization,
  });
}

export function useNotificationStats() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["notification-stats", organization?.id],
    queryFn: async (): Promise<NotificationStats> => {
      if (!organization) return { total: 0, unread: 0, read: 0, this_week: 0 };

      const { data: notifs } = await supabase
        .from("notifications")
        .select("status, created_at")
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      const rows = (notifs ?? []) as Array<{ status: string; created_at: string }>;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const stats: NotificationStats = { total: rows.length, unread: 0, read: 0, this_week: 0 };
      for (const row of rows) {
        if (row.status === "unread") stats.unread++;
        if (row.status === "read") stats.read++;
        if (new Date(row.created_at) >= weekAgo) stats.this_week++;
      }
      return stats;
    },
    enabled: !!organization,
  });
}

export function useUnreadCount() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["notification-unread", organization?.id],
    queryFn: async (): Promise<number> => {
      if (!organization) return 0;
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .eq("status", "unread")
        .is("deleted_at", null);
      return count ?? 0;
    },
    enabled: !!organization,
    refetchInterval: 30000,
  });
}

export function useCreateNotification() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      recipient_id?: string;
      recipient_type?: string;
      type?: string;
      channel?: string;
      title: string;
      title_ar?: string;
      message: string;
      message_ar?: string;
      action_url?: string;
      entity_type?: string;
      entity_id?: string;
    }) => {
      if (!organization) throw new Error("No organization");

      const { data: notif, error } = await (supabase.from("notifications") as any)
        .insert({
          ...data,
          organization_id: organization.id,
          recipient_type: data.recipient_type || "staff",
          type: data.type || "info",
          channel: data.channel || "in_app",
          status: "unread",
          sent_at: new Date().toISOString(),
        }).select().single();
      if (error) throw error;
      return notif as Notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-unread"] });
    },
  });
}

export function useMarkAsRead() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("notifications") as any)
        .update({ status: "read", read_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-unread"] });
    },
  });
}

export function useMarkAllAsRead() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!organization) throw new Error("No organization");
      const { error } = await (supabase.from("notifications") as any)
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("organization_id", organization.id)
        .eq("status", "unread");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-unread"] });
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    },
  });
}

export function useArchiveNotification() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("notifications") as any)
        .update({ status: "archived", archived_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("notifications") as any)
        .update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-unread"] });
      toast.success("تم حذف الإشعار");
    },
  });
}
