-- ============================================================
-- Different Institute ERP Platform
-- Migration 0020: Notifications & Messaging
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    organization_id UUID,
    recipient_id UUID,
    recipient_type VARCHAR(30) DEFAULT 'staff',
    type VARCHAR(30) DEFAULT 'info',
    channel VARCHAR(30) DEFAULT 'in_app',
    title VARCHAR(300) NOT NULL,
    title_ar VARCHAR(300),
    message TEXT NOT NULL,
    message_ar TEXT,
    status VARCHAR(20) DEFAULT 'unread',
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, tenant_id, notification_type)
);

-- Notification Templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    organization_id UUID,
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200),
    subject VARCHAR(300),
    subject_ar VARCHAR(300),
    body_template TEXT,
    body_template_ar TEXT,
    notification_type VARCHAR(30) DEFAULT 'info',
    channel VARCHAR(30) DEFAULT 'in_app',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_org ON public.notification_templates(organization_id) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
    ON public.notifications FOR SELECT TO authenticated
    USING (recipient_id = auth.uid() OR recipient_id IS NULL);

CREATE POLICY "Tenant staff can manage notifications"
    ON public.notifications FOR ALL TO authenticated
    USING (tenant_id = public.get_user_tenant_id() AND (public.is_tenant_admin() OR public.has_role('manager')))
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can manage their preferences"
    ON public.notification_preferences FOR ALL TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can manage templates"
    ON public.notification_templates FOR ALL TO authenticated
    USING (tenant_id = public.get_user_tenant_id() AND (public.is_tenant_admin() OR public.has_role('manager')))
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can view templates"
    ON public.notification_templates FOR SELECT TO authenticated
    USING (tenant_id = public.get_user_tenant_id());

-- Triggers
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_notifications') THEN
        CREATE TRIGGER set_updated_at_notifications BEFORE UPDATE ON public.notifications
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_notification_preferences') THEN
        CREATE TRIGGER set_updated_at_notification_preferences BEFORE UPDATE ON public.notification_preferences
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_notification_templates') THEN
        CREATE TRIGGER set_updated_at_notification_templates BEFORE UPDATE ON public.notification_templates
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();
    END IF;
END $$;
