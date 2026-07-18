-- ============================================================
-- Different Institute ERP Platform
-- Migration 0002: Enums
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- User status enum
CREATE TYPE public.user_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending',
    'deleted'
);

-- User role enum
CREATE TYPE public.user_role_type AS ENUM (
    'super_admin',
    'tenant_admin',
    'manager',
    'instructor',
    'student',
    'staff',
    'accountant',
    'librarian',
    'crm_agent',
    'marketing_agent',
    'viewer'
);

-- Gender enum
CREATE TYPE public.gender_type AS ENUM (
    'male',
    'female',
    'other',
    'prefer_not_to_say'
);

-- Contact type enum
CREATE TYPE public.contact_type AS ENUM (
    'email',
    'phone',
    'mobile',
    'fax',
    'whatsapp',
    'telegram'
);

-- Address type enum
CREATE TYPE public.address_type AS ENUM (
    'home',
    'work',
    'billing',
    'shipping',
    'other'
);

-- Organization status enum
CREATE TYPE public org_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'trial',
    'expired'
);

-- Tenant status enum
CREATE TYPE public.tenant_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'trial',
    'expired',
    'pending_setup'
);

-- Subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM (
    'free',
    'basic',
    'professional',
    'enterprise',
    'custom'
);

-- Student status enum
CREATE TYPE public.student_status AS ENUM (
    'enrolled',
    'active',
    'graduated',
    'transferred',
    'dropped',
    'suspended',
    'expelled',
    'on_leave',
    'pending',
    'rejected'
);

-- Academic level enum
CREATE TYPE public.academic_level AS ENUM (
    'beginner',
    'elementary',
    'intermediate',
    'advanced',
    'professional',
    'expert'
);

-- Course status enum
CREATE TYPE public.course_status AS ENUM (
    'draft',
    'published',
    'active',
    'completed',
    'cancelled',
    'archived'
);

-- Class status enum
CREATE TYPE public.class_status AS ENUM (
    'scheduled',
    'active',
    'completed',
    'cancelled',
    'postponed'
);

-- Payment status enum
CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'partial',
    'paid',
    'overdue',
    'refunded',
    'cancelled',
    'failed'
);

-- Invoice status enum
CREATE TYPE public.invoice_status AS ENUM (
    'draft',
    'sent',
    'viewed',
    'partial',
    'paid',
    'overdue',
    'cancelled',
    'refunded'
);

-- Transaction type enum
CREATE TYPE public.transaction_type AS ENUM (
    'income',
    'expense',
    'refund',
    'transfer',
    'adjustment'
);

-- Payment method enum
CREATE TYPE public.payment_method AS ENUM (
    'cash',
    'bank_transfer',
    'credit_card',
    'debit_card',
    'online',
    'check',
    'mobile_payment',
    'other'
);

-- Attendance status enum
CREATE TYPE public.attendance_status AS ENUM (
    'present',
    'absent',
    'late',
    'excused',
    'left_early',
    'holiday'
);

-- Certificate status enum
CREATE TYPE public.certificate_status AS ENUM (
    'draft',
    'issued',
    'revoked',
    'expired',
    'replaced'
);

-- Task status enum
CREATE TYPE public.task_status AS ENUM (
    'todo',
    'in_progress',
    'review',
    'completed',
    'cancelled',
    'on_hold'
);

-- Task priority enum
CREATE TYPE public.task_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent',
    'critical'
);

-- Document type enum
CREATE TYPE public.document_type AS ENUM (
    'contract',
    'agreement',
    'certificate',
    'receipt',
    'invoice',
    'id_document',
    'academic_record',
    'medical',
    'other'
);

-- Notification type enum
CREATE TYPE public.notification_type AS ENUM (
    'info',
    'warning',
    'success',
    'error',
    'reminder',
    'announcement',
    'task',
    'payment',
    'attendance',
    'system'
);

-- Notification channel enum
CREATE TYPE public.notification_channel AS ENUM (
    'in_app',
    'email',
    'sms',
    'push',
    'whatsapp'
);

-- Announcement type enum
CREATE TYPE public.announcement_type AS ENUM (
    'general',
    'academic',
    'financial',
    'event',
    'emergency',
    'maintenance'
);

-- Lead status enum
CREATE TYPE public.lead_status AS ENUM (
    'new',
    'contacted',
    'qualified',
    'proposal',
    'negotiation',
    'won',
    'lost',
    'dormant'
);

-- Campaign status enum
CREATE TYPE public.campaign_status AS ENUM (
    'draft',
    'scheduled',
    'active',
    'paused',
    'completed',
    'cancelled'
);

-- Campaign type enum
CREATE TYPE public.campaign_type AS ENUM (
    'email',
    'sms',
    'social_media',
    'event',
    'referral',
    'advertisement',
    'other'
);

-- Library item type enum
CREATE TYPE public.library_item_type AS ENUM (
    'book',
    'ebook',
    'journal',
    'magazine',
    'dvd',
    'cd',
    'digital_resource',
    'equipment',
    'other'
);

-- Library transaction type enum
CREATE TYPE public.library_transaction_type AS ENUM (
    'checkout',
    'return',
    'renew',
    'reserve',
    'lost',
    'damaged'
);

-- Calendar event type enum
CREATE TYPE public.calendar_event_type AS ENUM (
    'class',
    'exam',
    'meeting',
    'holiday',
    'workshop',
    'seminar',
    'deadline',
    'other'
);

-- Recurrence pattern enum
CREATE TYPE public.recurrence_pattern AS ENUM (
    'none',
    'daily',
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'yearly'
);

-- Message status enum
CREATE TYPE public.message_status AS ENUM (
    'sent',
    'delivered',
    'read',
    'failed'
);

-- Audit action enum
CREATE TYPE public.audit_action AS ENUM (
    'create',
    'read',
    'update',
    'delete',
    'login',
    'logout',
    'export',
    'import',
    'approve',
    'reject',
    'archive',
    'restore'
);

-- Permission effect enum
CREATE TYPE public.permission_effect AS ENUM (
    'allow',
    'deny'
);

-- Setting type enum
CREATE TYPE public.setting_type AS ENUM (
    'string',
    'number',
    'boolean',
    'json',
    'array',
    'encrypted'
);

-- Report type enum
CREATE TYPE public.report_type AS ENUM (
    'students',
    'finance',
    'attendance',
    'academics',
    'staff',
    'custom'
);

-- Report format enum
CREATE TYPE public.report_format AS ENUM (
    'pdf',
    'excel',
    'csv',
    'json',
    'html'
);
