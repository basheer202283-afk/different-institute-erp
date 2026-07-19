-- ============================================================
-- Different Institute ERP Platform
-- Migration 0012: Expenses, Financial Accounts
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- Financial Accounts
CREATE TABLE public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    description TEXT,
    balance DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'YER',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- Expenses
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'YER',
    expense_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    receipt_path VARCHAR(500),
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- Indexes
CREATE INDEX idx_financial_accounts_tenant_id ON public.financial_accounts(tenant_id);
CREATE INDEX idx_financial_accounts_account_type ON public.financial_accounts(account_type);
CREATE INDEX idx_financial_accounts_deleted_at ON public.financial_accounts(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_expenses_tenant_id ON public.expenses(tenant_id);
CREATE INDEX idx_expenses_account_id ON public.expenses(account_id);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX idx_expenses_status ON public.expenses(status);
CREATE INDEX idx_expenses_deleted_at ON public.expenses(deleted_at) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant finance can view accounts" ON public.financial_accounts FOR SELECT
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('accountant') OR public.has_role('owner'))
    );

CREATE POLICY "Tenant finance can manage accounts" ON public.financial_accounts FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('accountant'))
    );

CREATE POLICY "Tenant finance can view expenses" ON public.expenses FOR SELECT
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('accountant') OR public.has_role('owner'))
    );

CREATE POLICY "Tenant finance can manage expenses" ON public.expenses FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('accountant'))
    );

-- Triggers
CREATE TRIGGER set_updated_at_financial_accounts BEFORE UPDATE ON public.financial_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_expenses BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
