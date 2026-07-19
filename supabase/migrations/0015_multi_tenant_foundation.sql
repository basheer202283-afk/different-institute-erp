-- ============================================================
-- Different Institute ERP Platform
-- Migration 0015: Multi-Tenant Enterprise Foundation
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- Enhance Organizations with branding
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS brand_color VARCHAR(7) DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#1E40AF',
ADD COLUMN IF NOT EXISTS tagline VARCHAR(500),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'YE',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Aden',
ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'ar',
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'YER',
ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
ADD COLUMN IF NOT EXISTS max_branches INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 1000;

-- Enhance Branches with settings
ALTER TABLE public.branches
ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS opening_date DATE,
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Aden',
ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'ar',
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Add organization_id and branch_id to profiles for context
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_id ON public.profiles(branch_id);

-- Organization Members table (tracks who belongs to which org)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Branch Members table (tracks who belongs to which branch)
CREATE TABLE IF NOT EXISTS public.branch_members (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(branch_id, user_id)
);

-- Context Audit Log (tracks organization/branch switches)
CREATE TABLE IF NOT EXISTS public.context_audit_log (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    old_organization_id UUID,
    new_organization_id UUID,
    old_branch_id UUID,
    new_branch_id UUID,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_branch_members_branch_id ON public.branch_members(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_members_user_id ON public.branch_members(user_id);
CREATE INDEX IF NOT EXISTS idx_context_audit_user_id ON public.context_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_context_audit_created_at ON public.context_audit_log(created_at);

-- RLS for new tables
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_audit_log ENABLE ROW LEVEL SECURITY;

-- Organization Members RLS
CREATE POLICY "Users can view own org membership" ON public.organization_members FOR SELECT
    TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Org admins can manage members" ON public.organization_members FOR ALL
    TO authenticated USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_members om
            WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
        )
    );

-- Branch Members RLS
CREATE POLICY "Users can view own branch membership" ON public.branch_members FOR SELECT
    TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Branch admins can manage members" ON public.branch_members FOR ALL
    TO authenticated USING (
        branch_id IN (
            SELECT bm.branch_id FROM public.branch_members bm
            WHERE bm.user_id = auth.uid() AND bm.role IN ('manager', 'admin')
        )
    );

-- Context Audit RLS
CREATE POLICY "Admins can view context audit" ON public.context_audit_log FOR SELECT
    TO authenticated USING (public.is_tenant_admin());

CREATE POLICY "System can insert context audit" ON public.context_audit_log FOR INSERT
    TO authenticated WITH CHECK (TRUE);

-- Update Triggers
CREATE TRIGGER set_updated_at_organization_members BEFORE UPDATE ON public.organization_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_branch_members BEFORE UPDATE ON public.branch_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

-- Helper Functions
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_branch_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT branch_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE user_id = auth.uid()
        AND organization_id = org_id
        AND is_active = TRUE
    );
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_branch(br_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.branch_members
        WHERE user_id = auth.uid()
        AND branch_id = br_id
        AND is_active = TRUE
    );
$$;

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_branch_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_belongs_to_organization(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_belongs_to_branch(UUID) TO authenticated;
