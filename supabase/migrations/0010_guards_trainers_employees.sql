-- ============================================================
-- Different Institute ERP Platform
-- Migration 0010: Guardians, Trainers, Employees
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- Guardians
CREATE TABLE public.guardians (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    relationship VARCHAR(50),
    occupation VARCHAR(200),
    address TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- Trainers
CREATE TABLE public.trainers (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    specialization VARCHAR(200),
    qualifications TEXT,
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10, 2),
    bio TEXT,
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- Employees
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    employee_number VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(200),
    hire_date DATE,
    salary DECIMAL(12, 2),
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, employee_number)
);

-- Indexes
CREATE INDEX idx_guardians_tenant_id ON public.guardians(tenant_id);
CREATE INDEX idx_guardians_deleted_at ON public.guardians(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_trainers_tenant_id ON public.trainers(tenant_id);
CREATE INDEX idx_trainers_user_id ON public.trainers(user_id);
CREATE INDEX idx_trainers_status ON public.trainers(status);
CREATE INDEX idx_trainers_deleted_at ON public.trainers(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_employees_tenant_id ON public.employees(tenant_id);
CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_department_id ON public.employees(department_id);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_employees_deleted_at ON public.employees(deleted_at) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view guardians" ON public.guardians FOR SELECT
    TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant staff can manage guardians" ON public.guardians FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('reception'))
    );

CREATE POLICY "Tenant members can view trainers" ON public.trainers FOR SELECT
    TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant admins can manage trainers" ON public.trainers FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND public.is_tenant_admin()
    );

CREATE POLICY "Tenant members can view employees" ON public.employees FOR SELECT
    TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant admins can manage employees" ON public.employees FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND public.is_tenant_admin()
    );

-- Triggers
CREATE TRIGGER set_updated_at_guardians BEFORE UPDATE ON public.guardians
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_trainers BEFORE UPDATE ON public.trainers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_employees BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER audit_guardians AFTER INSERT OR UPDATE OR DELETE ON public.guardians
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_trainers AFTER INSERT OR UPDATE OR DELETE ON public.trainers
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_employees AFTER INSERT OR UPDATE OR DELETE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
