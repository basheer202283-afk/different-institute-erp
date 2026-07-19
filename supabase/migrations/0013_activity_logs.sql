-- ============================================================
-- Different Institute ERP Platform
-- Migration 0013: Activity Logs
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_logs_tenant_id ON public.activity_logs(tenant_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX idx_activity_logs_entity_id ON public.activity_logs(entity_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant admins can view activity logs" ON public.activity_logs FOR SELECT
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND public.is_tenant_admin()
    );

CREATE POLICY "System can insert activity logs" ON public.activity_logs FOR INSERT
    TO authenticated WITH CHECK (TRUE);
