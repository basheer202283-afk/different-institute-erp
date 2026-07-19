-- ============================================================
-- Different Institute ERP Platform
-- Migration 0009: Branches
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

CREATE TABLE public.branches (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'YE',
    phone VARCHAR(50),
    email VARCHAR(255),
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(organization_id, code)
);

-- Indexes
CREATE INDEX idx_branches_organization_id ON public.branches(organization_id);
CREATE INDEX idx_branches_manager_id ON public.branches(manager_id);
CREATE INDEX idx_branches_is_active ON public.branches(is_active);
CREATE INDEX idx_branches_deleted_at ON public.branches(deleted_at) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view branches" ON public.branches FOR SELECT
    TO authenticated USING (
        organization_id IN (
            SELECT t.organization_id FROM public.tenants t
            JOIN public.profiles p ON p.tenant_id = t.id
            WHERE p.id = auth.uid()
        )
    );

CREATE POLICY "Tenant admins can manage branches" ON public.branches FOR ALL
    TO authenticated USING (
        organization_id IN (
            SELECT t.organization_id FROM public.tenants t
            JOIN public.profiles p ON p.tenant_id = t.id
            WHERE p.id = auth.uid()
            AND p.role IN ('owner', 'manager')
        )
    );

-- Triggers
CREATE TRIGGER set_updated_at_branches BEFORE UPDATE ON public.branches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER audit_branches AFTER INSERT OR UPDATE OR DELETE ON public.branches
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
