-- ============================================================
-- Different Institute ERP Platform
-- Migration 0007: Finance
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- ============================================================
-- FEE_STRUCTURES TABLE
-- ============================================================
CREATE TABLE public.fee_structures (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    fee_type VARCHAR(50) NOT NULL DEFAULT 'tuition',
    is_mandatory BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    due_days INTEGER DEFAULT 30,
    late_fee_amount DECIMAL(12, 2) DEFAULT 0,
    late_fee_percentage DECIMAL(5, 2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- ============================================================
-- INVOICES TABLE
-- ============================================================
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    status public.invoice_status NOT NULL DEFAULT 'draft',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    balance DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    terms TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, invoice_number)
);

-- ============================================================
-- INVOICE_ITEMS TABLE
-- ============================================================
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE SET NULL,
    description VARCHAR(500) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    payment_number VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method public.payment_method NOT NULL DEFAULT 'cash',
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status public.payment_status NOT NULL DEFAULT 'pending',
    reference_number VARCHAR(100),
    transaction_id VARCHAR(255),
    notes TEXT,
    receipt_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, payment_number)
);

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    type public.transaction_type NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    reference VARCHAR(255),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- SCHOLARSHIPS TABLE
-- ============================================================
CREATE TABLE public.scholarships (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'merit',
    value DECIMAL(12, 2) NOT NULL DEFAULT 0,
    value_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
    max_recipients INTEGER,
    current_recipients INTEGER DEFAULT 0,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    criteria JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- ============================================================
-- STUDENT_SCHOLARSHIPS TABLE
-- ============================================================
CREATE TABLE public.student_scholarships (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(student_id, scholarship_id)
);

-- ============================================================
-- DISCOUNTS TABLE
-- ============================================================
CREATE TABLE public.discounts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'percentage',
    value DECIMAL(12, 2) NOT NULL DEFAULT 0,
    min_amount DECIMAL(12, 2) DEFAULT 0,
    max_discount DECIMAL(12, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    applicable_fees TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- ============================================================
-- INDEXES FOR FINANCE
-- ============================================================

-- Fee structures indexes
CREATE INDEX idx_fee_structures_tenant_id ON public.fee_structures(tenant_id);
CREATE INDEX idx_fee_structures_academic_year_id ON public.fee_structures(academic_year_id);
CREATE INDEX idx_fee_structures_program_id ON public.fee_structures(program_id);
CREATE INDEX idx_fee_structures_deleted_at ON public.fee_structures(deleted_at) WHERE deleted_at IS NULL;

-- Invoices indexes
CREATE INDEX idx_invoices_tenant_id ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_student_id ON public.invoices(student_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_issue_date ON public.invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoices_deleted_at ON public.invoices(deleted_at) WHERE deleted_at IS NULL;

-- Invoice items indexes
CREATE INDEX idx_invoice_items_tenant_id ON public.invoice_items(tenant_id);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_fee_structure_id ON public.invoice_items(fee_structure_id);
CREATE INDEX idx_invoice_items_deleted_at ON public.invoice_items(deleted_at) WHERE deleted_at IS NULL;

-- Payments indexes
CREATE INDEX idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX idx_payments_student_id ON public.payments(student_id);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX idx_payments_deleted_at ON public.payments(deleted_at) WHERE deleted_at IS NULL;

-- Transactions indexes
CREATE INDEX idx_transactions_tenant_id ON public.transactions(tenant_id);
CREATE INDEX idx_transactions_payment_id ON public.transactions(payment_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_category ON public.transactions(category);
CREATE INDEX idx_transactions_transaction_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_deleted_at ON public.transactions(deleted_at) WHERE deleted_at IS NULL;

-- Scholarships indexes
CREATE INDEX idx_scholarships_tenant_id ON public.scholarships(tenant_id);
CREATE INDEX idx_scholarships_academic_year_id ON public.scholarships(academic_year_id);
CREATE INDEX idx_scholarships_deleted_at ON public.scholarships(deleted_at) WHERE deleted_at IS NULL;

-- Student scholarships indexes
CREATE INDEX idx_student_scholarships_tenant_id ON public.student_scholarships(tenant_id);
CREATE INDEX idx_student_scholarships_student_id ON public.student_scholarships(student_id);
CREATE INDEX idx_student_scholarships_scholarship_id ON public.student_scholarships(scholarship_id);
CREATE INDEX idx_student_scholarships_deleted_at ON public.student_scholarships(deleted_at) WHERE deleted_at IS NULL;

-- Discounts indexes
CREATE INDEX idx_discounts_tenant_id ON public.discounts(tenant_id);
CREATE INDEX idx_discounts_deleted_at ON public.discounts(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - FEE_STRUCTURES
-- ============================================================
CREATE POLICY "Tenant members can view fee structures"
    ON public.fee_structures FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant finance staff can manage fee structures"
    ON public.fee_structures FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('accountant')
            OR public.has_role('manager')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - INVOICES
-- ============================================================
CREATE POLICY "Tenant members can view invoices"
    ON public.invoices FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Students can view their own invoices"
    ON public.invoices FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant finance staff can manage invoices"
    ON public.invoices FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('accountant')
            OR public.has_role('manager')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - INVOICE_ITEMS
-- ============================================================
CREATE POLICY "Tenant members can view invoice items"
    ON public.invoice_items FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant finance staff can manage invoice items"
    ON public.invoice_items FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('accountant')
            OR public.has_role('manager')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - PAYMENTS
-- ============================================================
CREATE POLICY "Tenant members can view payments"
    ON public.payments FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Students can view their own payments"
    ON public.payments FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant finance staff can manage payments"
    ON public.payments FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('accountant')
            OR public.has_role('manager')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - TRANSACTIONS
-- ============================================================
CREATE POLICY "Tenant finance staff can view transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('accountant')
            OR public.has_role('manager')
        )
    );

CREATE POLICY "Tenant finance staff can manage transactions"
    ON public.transactions FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('accountant')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - SCHOLARSHIPS
-- ============================================================
CREATE POLICY "Tenant members can view scholarships"
    ON public.scholarships FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant finance staff can manage scholarships"
    ON public.scholarships FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('accountant')
            OR public.has_role('manager')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - STUDENT_SCHOLARSHIPS
-- ============================================================
CREATE POLICY "Tenant members can view student scholarships"
    ON public.student_scholarships FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Students can view their own scholarships"
    ON public.student_scholarships FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant finance staff can manage student scholarships"
    ON public.student_scholarships FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('accountant')
            OR public.has_role('manager')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - DISCOUNTS
-- ============================================================
CREATE POLICY "Tenant members can view discounts"
    ON public.discounts FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant finance staff can manage discounts"
    ON public.discounts FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('accountant')
            OR public.has_role('manager')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER set_updated_at_fee_structures
    BEFORE UPDATE ON public.fee_structures
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_invoices
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_invoice_items
    BEFORE UPDATE ON public.invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_payments
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_transactions
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_scholarships
    BEFORE UPDATE ON public.scholarships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_student_scholarships
    BEFORE UPDATE ON public.student_scholarships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_discounts
    BEFORE UPDATE ON public.discounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

-- ============================================================
-- AUDIT TRIGGERS
-- ============================================================
CREATE TRIGGER audit_invoices
    AFTER INSERT OR UPDATE OR DELETE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_payments
    AFTER INSERT OR UPDATE OR DELETE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_transactions
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();
