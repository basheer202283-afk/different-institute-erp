-- ============================================================
-- Different Institute ERP Platform
-- Migration 0005: Student Management
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- ============================================================
-- STUDENTS TABLE
-- ============================================================
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_number VARCHAR(50) NOT NULL,
    admission_date DATE,
    status public.student_status NOT NULL DEFAULT 'pending',
    academic_level public.academic_level DEFAULT 'beginner',
    guardian_name VARCHAR(200),
    guardian_phone VARCHAR(50),
    guardian_email VARCHAR(255),
    guardian_relationship VARCHAR(50),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    medical_conditions TEXT,
    allergies TEXT,
    blood_group VARCHAR(10),
    nationality VARCHAR(100),
    religion VARCHAR(100),
    place_of_birth VARCHAR(200),
    previous_school VARCHAR(255),
    previous_grade VARCHAR(50),
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, student_number)
);

-- ============================================================
-- STUDENT_ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE public.student_enrollments (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL,
    class_id UUID,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    payment_status public.payment_status DEFAULT 'pending',
    total_fees DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    discount_reason TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- STUDENT_DOCUMENTS TABLE
-- ============================================================
CREATE TABLE public.student_documents (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    issue_date DATE,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- STUDENT_NOTES TABLE
-- ============================================================
CREATE TABLE public.student_notes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- INDEXES FOR STUDENT MANAGEMENT
-- ============================================================

-- Students indexes
CREATE INDEX idx_students_tenant_id ON public.students(tenant_id);
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_students_student_number ON public.students(student_number);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_academic_level ON public.students(academic_level);
CREATE INDEX idx_students_admission_date ON public.students(admission_date);
CREATE INDEX idx_students_deleted_at ON public.students(deleted_at) WHERE deleted_at IS NULL;

-- Student enrollments indexes
CREATE INDEX idx_student_enrollments_tenant_id ON public.student_enrollments(tenant_id);
CREATE INDEX idx_student_enrollments_student_id ON public.student_enrollments(student_id);
CREATE INDEX idx_student_enrollments_course_id ON public.student_enrollments(course_id);
CREATE INDEX idx_student_enrollments_class_id ON public.student_enrollments(class_id);
CREATE INDEX idx_student_enrollments_status ON public.student_enrollments(status);
CREATE INDEX idx_student_enrollments_payment_status ON public.student_enrollments(payment_status);
CREATE INDEX idx_student_enrollments_deleted_at ON public.student_enrollments(deleted_at) WHERE deleted_at IS NULL;

-- Student documents indexes
CREATE INDEX idx_student_documents_tenant_id ON public.student_documents(tenant_id);
CREATE INDEX idx_student_documents_student_id ON public.student_documents(student_id);
CREATE INDEX idx_student_documents_document_id ON public.student_documents(document_id);
CREATE INDEX idx_student_documents_deleted_at ON public.student_documents(deleted_at) WHERE deleted_at IS NULL;

-- Student notes indexes
CREATE INDEX idx_student_notes_tenant_id ON public.student_notes(tenant_id);
CREATE INDEX idx_student_notes_student_id ON public.student_notes(student_id);
CREATE INDEX idx_student_notes_author_id ON public.student_notes(author_id);
CREATE INDEX idx_student_notes_deleted_at ON public.student_notes(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - STUDENTS
-- ============================================================
CREATE POLICY "Tenant members can view students in their tenant"
    ON public.students FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Students can view their own record"
    ON public.students FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Tenant staff can manage students"
    ON public.students FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.has_role('tenant_admin')
            OR public.has_role('manager')
            OR public.has_role('staff')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - STUDENT_ENROLLMENTS
-- ============================================================
CREATE POLICY "Tenant members can view enrollments in their tenant"
    ON public.student_enrollments FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Students can view their own enrollments"
    ON public.student_enrollments FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant staff can manage enrollments"
    ON public.student_enrollments FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.has_role('tenant_admin')
            OR public.has_role('manager')
            OR public.has_role('staff')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - STUDENT_DOCUMENTS
-- ============================================================
CREATE POLICY "Tenant members can view student documents"
    ON public.student_documents FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Students can view their own documents"
    ON public.student_documents FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant staff can manage student documents"
    ON public.student_documents FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.has_role('tenant_admin')
            OR public.has_role('manager')
            OR public.has_role('staff')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - STUDENT_NOTES
-- ============================================================
CREATE POLICY "Tenant staff can view student notes"
    ON public.student_notes FOR SELECT
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.has_role('tenant_admin')
            OR public.has_role('manager')
            OR public.has_role('instructor')
            OR public.has_role('staff')
        )
    );

CREATE POLICY "Authors can manage their own student notes"
    ON public.student_notes FOR ALL
    TO authenticated
    USING (author_id = auth.uid())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER set_updated_at_students
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_student_enrollments
    BEFORE UPDATE ON public.student_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_student_documents
    BEFORE UPDATE ON public.student_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_student_notes
    BEFORE UPDATE ON public.student_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

-- ============================================================
-- AUDIT TRIGGERS
-- ============================================================
CREATE TRIGGER audit_students
    AFTER INSERT OR UPDATE OR DELETE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_student_enrollments
    AFTER INSERT OR UPDATE OR DELETE ON public.student_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();
