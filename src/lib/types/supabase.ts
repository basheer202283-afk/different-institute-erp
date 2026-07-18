// ============================================================
// Different Institute ERP Platform
// Supabase Database Types
// ============================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          legal_name: string | null;
          registration_number: string | null;
          tax_id: string | null;
          email: string | null;
          phone: string | null;
          website: string | null;
          logo_url: string | null;
          status: 'active' | 'inactive' | 'suspended' | 'trial' | 'expired';
          subscription_plan: 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
          subscription_expires_at: string | null;
          settings: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          legal_name?: string | null;
          registration_number?: string | null;
          tax_id?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          logo_url?: string | null;
          status?: 'active' | 'inactive' | 'suspended' | 'trial' | 'expired';
          subscription_plan?: 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
          subscription_expires_at?: string | null;
          settings?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          legal_name?: string | null;
          registration_number?: string | null;
          tax_id?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          logo_url?: string | null;
          status?: 'active' | 'inactive' | 'suspended' | 'trial' | 'expired';
          subscription_plan?: 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
          subscription_expires_at?: string | null;
          settings?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      tenants: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          domain: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          primary_color: string;
          secondary_color: string;
          status: 'active' | 'inactive' | 'suspended' | 'trial' | 'expired' | 'pending_setup';
          subscription_plan: 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
          subscription_expires_at: string | null;
          max_users: number;
          max_students: number;
          max_storage_mb: number;
          timezone: string;
          locale: string;
          currency: string;
          date_format: string;
          settings: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          domain?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          status?: 'active' | 'inactive' | 'suspended' | 'trial' | 'expired' | 'pending_setup';
          subscription_plan?: 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
          subscription_expires_at?: string | null;
          max_users?: number;
          max_students?: number;
          max_storage_mb?: number;
          timezone?: string;
          locale?: string;
          currency?: string;
          date_format?: string;
          settings?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          domain?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          status?: 'active' | 'inactive' | 'suspended' | 'trial' | 'expired' | 'pending_setup';
          subscription_plan?: 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
          subscription_expires_at?: string | null;
          max_users?: number;
          max_students?: number;
          max_storage_mb?: number;
          timezone?: string;
          locale?: string;
          currency?: string;
          date_format?: string;
          settings?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string | null;
          first_name: string | null;
          last_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          bio: string | null;
          locale: string;
          timezone: string;
          status: 'active' | 'inactive' | 'suspended' | 'pending' | 'deleted';
          last_login_at: string | null;
          last_active_at: string | null;
          login_count: number;
          preferences: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id: string;
          tenant_id?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          bio?: string | null;
          locale?: string;
          timezone?: string;
          status?: 'active' | 'inactive' | 'suspended' | 'pending' | 'deleted';
          last_login_at?: string | null;
          last_active_at?: string | null;
          login_count?: number;
          preferences?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          bio?: string | null;
          locale?: string;
          timezone?: string;
          status?: 'active' | 'inactive' | 'suspended' | 'pending' | 'deleted';
          last_login_at?: string | null;
          last_active_at?: string | null;
          login_count?: number;
          preferences?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      roles: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          is_system: boolean;
          is_default: boolean;
          level: number;
          color: string | null;
          icon: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          is_system?: boolean;
          is_default?: boolean;
          level?: number;
          color?: string | null;
          icon?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          is_system?: boolean;
          is_default?: boolean;
          level?: number;
          color?: string | null;
          icon?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_tenant_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_role: {
        Args: { role_slug: string };
        Returns: boolean;
      };
      has_permission: {
        Args: { permission_slug: string };
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_tenant_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      user_belongs_to_tenant: {
        Args: { target_tenant_id: string };
        Returns: boolean;
      };
      calculate_attendance_percentage: {
        Args: { p_student_id: string; p_class_id: string; p_tenant_id: string };
        Returns: number;
      };
    };
    Enums: {
      user_status: 'active' | 'inactive' | 'suspended' | 'pending' | 'deleted';
      user_role_type: 'super_admin' | 'tenant_admin' | 'manager' | 'instructor' | 'student' | 'staff' | 'accountant' | 'librarian' | 'crm_agent' | 'marketing_agent' | 'viewer';
      gender_type: 'male' | 'female' | 'other' | 'prefer_not_to_say';
      contact_type: 'email' | 'phone' | 'mobile' | 'fax' | 'whatsapp' | 'telegram';
      address_type: 'home' | 'work' | 'billing' | 'shipping' | 'other';
      org_status: 'active' | 'inactive' | 'suspended' | 'trial' | 'expired';
      tenant_status: 'active' | 'inactive' | 'suspended' | 'trial' | 'expired' | 'pending_setup';
      subscription_plan: 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
      student_status: 'enrolled' | 'active' | 'graduated' | 'transferred' | 'dropped' | 'suspended' | 'expelled' | 'on_leave' | 'pending' | 'rejected';
      academic_level: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'professional' | 'expert';
      course_status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled' | 'archived';
      class_status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'postponed';
      payment_status: 'pending' | 'partial' | 'paid' | 'overdue' | 'refunded' | 'cancelled' | 'failed';
      invoice_status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
      transaction_type: 'income' | 'expense' | 'refund' | 'transfer' | 'adjustment';
      payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'online' | 'check' | 'mobile_payment' | 'other';
      attendance_status: 'present' | 'absent' | 'late' | 'excused' | 'left_early' | 'holiday';
      certificate_status: 'draft' | 'issued' | 'revoked' | 'expired' | 'replaced';
      task_status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'on_hold';
      task_priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
      document_type: 'contract' | 'agreement' | 'certificate' | 'receipt' | 'invoice' | 'id_document' | 'academic_record' | 'medical' | 'other';
      notification_type: 'info' | 'warning' | 'success' | 'error' | 'reminder' | 'announcement' | 'task' | 'payment' | 'attendance' | 'system';
      notification_channel: 'in_app' | 'email' | 'sms' | 'push' | 'whatsapp';
      announcement_type: 'general' | 'academic' | 'financial' | 'event' | 'emergency' | 'maintenance';
      lead_status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'dormant';
      campaign_status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
      campaign_type: 'email' | 'sms' | 'social_media' | 'event' | 'referral' | 'advertisement' | 'other';
      library_item_type: 'book' | 'ebook' | 'journal' | 'magazine' | 'dvd' | 'cd' | 'digital_resource' | 'equipment' | 'other';
      library_transaction_type: 'checkout' | 'return' | 'renew' | 'reserve' | 'lost' | 'damaged';
      calendar_event_type: 'class' | 'exam' | 'meeting' | 'holiday' | 'workshop' | 'seminar' | 'deadline' | 'other';
      recurrence_pattern: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
      message_status: 'sent' | 'delivered' | 'read' | 'failed';
      audit_action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'approve' | 'reject' | 'archive' | 'restore';
      permission_effect: 'allow' | 'deny';
      setting_type: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'encrypted';
      report_type: 'students' | 'finance' | 'attendance' | 'academics' | 'staff' | 'custom';
      report_format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
    };
  };
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
