-- ============================================================
-- Different Institute ERP Platform
-- Migration 0019: Certificate Templates & Enhancements
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- Certificate Templates
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    organization_id UUID,
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200),
    description TEXT,
    template_type VARCHAR(50) DEFAULT 'course_completion',
    layout_html TEXT DEFAULT '<div>{{content}}</div>',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- Add new columns to certificates if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'organization_id') THEN
        ALTER TABLE public.certificates ADD COLUMN organization_id UUID;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'branch_id') THEN
        ALTER TABLE public.certificates ADD COLUMN branch_id UUID;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'enrollment_id') THEN
        ALTER TABLE public.certificates ADD COLUMN enrollment_id UUID;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'template_id') THEN
        ALTER TABLE public.certificates ADD COLUMN template_id UUID REFERENCES public.certificate_templates(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'title_ar') THEN
        ALTER TABLE public.certificates ADD COLUMN title_ar VARCHAR(300);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'grade') THEN
        ALTER TABLE public.certificates ADD COLUMN grade VARCHAR(10);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'score') THEN
        ALTER TABLE public.certificates ADD COLUMN score DECIMAL(5,2);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'hours_completed') THEN
        ALTER TABLE public.certificates ADD COLUMN hours_completed INTEGER;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'qr_code') THEN
        ALTER TABLE public.certificates ADD COLUMN qr_code VARCHAR(500);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'verification_url') THEN
        ALTER TABLE public.certificates ADD COLUMN verification_url VARCHAR(500);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'digital_signature') THEN
        ALTER TABLE public.certificates ADD COLUMN digital_signature TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'revoked_by') THEN
        ALTER TABLE public.certificates ADD COLUMN revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'revoke_reason') THEN
        ALTER TABLE public.certificates ADD COLUMN revoke_reason TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'deleted_at') THEN
        ALTER TABLE public.certificates ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'created_by') THEN
        ALTER TABLE public.certificates ADD COLUMN created_by UUID;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'updated_by') THEN
        ALTER TABLE public.certificates ADD COLUMN updated_by UUID;
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_certificate_templates_org ON public.certificate_templates(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_certificate_templates_type ON public.certificate_templates(template_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_certificates_org ON public.certificates(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_template ON public.certificates(template_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_certificates_issue_date ON public.certificates(issue_date);
CREATE INDEX IF NOT EXISTS idx_certificates_deleted ON public.certificates(deleted_at) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view certificate templates"
    ON public.certificate_templates FOR SELECT
    TO authenticated
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant admins can manage certificate templates"
    ON public.certificate_templates FOR ALL
    TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('manager') OR public.has_role('academic_manager'))
    )
    WITH CHECK (tenant_id = public.get_user_tenant_id());

-- Triggers
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_certificate_templates') THEN
        CREATE TRIGGER set_updated_at_certificate_templates
            BEFORE UPDATE ON public.certificate_templates
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_certificate_templates') THEN
        CREATE TRIGGER audit_certificate_templates
            AFTER INSERT OR UPDATE OR DELETE ON public.certificate_templates
            FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
    END IF;
END $$;
