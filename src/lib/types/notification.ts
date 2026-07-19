import type { Json } from "@/lib/types/database";

export type NotificationType = "info" | "success" | "warning" | "error" | "reminder" | "announcement";
export type NotificationChannel = "in_app" | "email" | "sms" | "whatsapp";
export type NotificationStatus = "unread" | "read" | "archived";

export interface Notification {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  recipient_id: string | null;
  recipient_type: "student" | "trainer" | "guardian" | "staff" | "all";
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  title_ar: string | null;
  message: string;
  message_ar: string | null;
  status: NotificationStatus;
  action_url: string | null;
  action_label: string | null;
  entity_type: string | null;
  entity_id: string | null;
  sent_at: string;
  read_at: string | null;
  archived_at: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  tenant_id: string;
  notification_type: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  name: string;
  name_ar: string | null;
  subject: string;
  subject_ar: string | null;
  body_template: string;
  body_template_ar: string | null;
  notification_type: NotificationType;
  channel: NotificationChannel;
  is_active: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface NotificationFilters {
  search?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  page?: number;
  pageSize?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  this_week: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
