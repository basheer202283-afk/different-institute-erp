-- ============================================================
-- Different Institute ERP Platform
-- Migration 0021: Employee Management (HR)
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    organization_id UUID,
    branch_id UUID,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    employee_number VARCHAR(50) NOT NULL,
    first_name_ar VARCHAR(100) NOT NULL,
    last_name_ar VARCHAR(100) NOT NULL,
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    national_id VARCHAR(30),
    date_of_birth DATE,
    gender VARCHAR(10),
    nationality VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    department_id UUID,
    position_id UUID,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active',
    contract_type VARCHAR(30) DEFAULT 'full_time',
    salary DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'YER',
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- Positions Table
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    organization_id UUID,
    department_id UUID,
    title VARCHAR(200) NOT NULL,
    title_ar VARCHAR(200),
    description TEXT,
    min_salary DECIMAL(12,2),
    max_salary DECIMAL(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    organization_id UUID,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL DEFAULT 1,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (end_date >= start_date)
);

-- Add org_id to departments if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'organization_id') THEN
        ALTER TABLE public.departments ADD COLUMN organization_id UUID;
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_org ON public.employees(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employees_dept ON public.employees(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employees_number ON public.employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_positions_org ON public.positions(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_positions_dept ON public.positions(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leave_requests_org ON public.leave_requests(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON public.leave_requests(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_departments_org ON public.departments(organization_id) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view employees" ON public.employees FOR SELECT TO authenticated
    USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant admins can manage employees" ON public.employees FOR ALL TO authenticated
    USING (tenant_id = public.get_user_tenant_id() AND (public.is_tenant_admin() OR public.has_role('manager') OR public.has_role('hr_manager')))
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can view positions" ON public.positions FOR SELECT TO authenticated
    USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant admins can manage positions" ON public.positions FOR ALL TO authenticated
    USING (tenant_id = public.get_user_tenant_id() AND (public.is_tenant_admin() OR public.has_role('manager') OR public.has_role('hr_manager')))
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Employees can view their leave requests" ON public.leave_requests FOR SELECT TO authenticated
    USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant admins can manage leave requests" ON public.leave_requests FOR ALL TO authenticated
    USING (tenant_id = public.get_user_tenant_id() AND (public.is_tenant_admin() OR public.has_role('manager') OR public.has_role('hr_manager')))
    WITH CHECK (tenant_id = public.get_user_tenant_id());

-- Triggers
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_employees') THEN
        CREATE TRIGGER set_updated_at_employees BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_positions') THEN
        CREATE TRIGGER set_updated_at_positions BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_leave_requests') THEN
        CREATE TRIGGER set_updated_at_leave_requests BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();
    END IF;
END $$;
