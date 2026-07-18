-- ============================================================
-- Different Institute ERP Platform
-- Migration 0008: Attendance
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- ============================================================
-- ATTENDANCE_RECORDS TABLE
-- ============================================================
CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.class_sessions(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status public.attendance_status NOT NULL DEFAULT 'present',
    check_in_time TIME,
    check_out_time TIME,
    late_minutes INTEGER DEFAULT 0,
    reason TEXT,
    notes TEXT,
    marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, student_id, class_id, attendance_date)
);

-- ============================================================
-- ATTENDANCE_SUMMARY TABLE (Materialized view-like)
-- ============================================================
CREATE TABLE public.attendance_summary (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    present_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    late_count INTEGER DEFAULT 0,
    excused_count INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE
            WHEN total_sessions > 0 THEN
                ROUND(((present_count + late_count)::DECIMAL / total_sessions) * 100, 2)
            ELSE 0
        END
    ) STORED,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, student_id, class_id, month, year)
);

-- ============================================================
-- ATTENDANCE_POLICIES TABLE
-- ============================================================
CREATE TABLE public.attendance_policies (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    min_attendance_percentage DECIMAL(5, 2) DEFAULT 75.00,
    late_threshold_minutes INTEGER DEFAULT 15,
    auto_mark_absent BOOLEAN DEFAULT FALSE,
    allow_excuse BOOLEAN DEFAULT TRUE,
    excuse_required_document BOOLEAN DEFAULT FALSE,
    notification_enabled BOOLEAN DEFAULT TRUE,
    notification_threshold DECIMAL(5, 2) DEFAULT 80.00,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_programs UUID[],
    applicable_levels public.academic_level[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- ATTENDANCE_EXCUSES TABLE
-- ============================================================
CREATE TABLE public.attendance_excuses (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    attendance_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- INDEXES FOR ATTENDANCE
-- ============================================================

-- Attendance records indexes
CREATE INDEX idx_attendance_records_tenant_id ON public.attendance_records(tenant_id);
CREATE INDEX idx_attendance_records_student_id ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_records_class_id ON public.attendance_records(class_id);
CREATE INDEX idx_attendance_records_session_id ON public.attendance_records(session_id);
CREATE INDEX idx_attendance_records_attendance_date ON public.attendance_records(attendance_date);
CREATE INDEX idx_attendance_records_status ON public.attendance_records(status);
CREATE INDEX idx_attendance_records_marked_by ON public.attendance_records(marked_by);
CREATE INDEX idx_attendance_records_deleted_at ON public.attendance_records(deleted_at) WHERE deleted_at IS NULL;

-- Attendance summary indexes
CREATE INDEX idx_attendance_summary_tenant_id ON public.attendance_summary(tenant_id);
CREATE INDEX idx_attendance_summary_student_id ON public.attendance_summary(student_id);
CREATE INDEX idx_attendance_summary_class_id ON public.attendance_summary(class_id);
CREATE INDEX idx_attendance_summary_month_year ON public.attendance_summary(month, year);
CREATE INDEX idx_attendance_summary_deleted_at ON public.attendance_summary(deleted_at) WHERE deleted_at IS NULL;

-- Attendance policies indexes
CREATE INDEX idx_attendance_policies_tenant_id ON public.attendance_policies(tenant_id);
CREATE INDEX idx_attendance_policies_deleted_at ON public.attendance_policies(deleted_at) WHERE deleted_at IS NULL;

-- Attendance excuses indexes
CREATE INDEX idx_attendance_excuses_tenant_id ON public.attendance_excuses(tenant_id);
CREATE INDEX idx_attendance_excuses_attendance_id ON public.attendance_excuses(attendance_id);
CREATE INDEX idx_attendance_excuses_student_id ON public.attendance_excuses(student_id);
CREATE INDEX idx_attendance_excuses_reviewed_by ON public.attendance_excuses(reviewed_by);
CREATE INDEX idx_attendance_excuses_status ON public.attendance_excuses(status);
CREATE INDEX idx_attendance_excuses_deleted_at ON public.attendance_excuses(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_excuses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - ATTENDANCE_RECORDS
-- ============================================================
CREATE POLICY "Tenant members can view attendance records"
    ON public.attendance_records FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Students can view their own attendance"
    ON public.attendance_records FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Instructors can manage attendance for their classes"
    ON public.attendance_records FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            marked_by = auth.uid()
            OR public.is_tenant_admin()
            OR public.has_role('manager')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - ATTENDANCE_SUMMARY
-- ============================================================
CREATE POLICY "Tenant members can view attendance summary"
    ON public.attendance_summary FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Students can view their own attendance summary"
    ON public.attendance_summary FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant admins can manage attendance summary"
    ON public.attendance_summary FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('manager')
            OR public.has_role('instructor')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - ATTENDANCE_POLICIES
-- ============================================================
CREATE POLICY "Tenant members can view attendance policies"
    ON public.attendance_policies FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can manage attendance policies"
    ON public.attendance_policies FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (public.is_tenant_admin() OR public.has_role('manager'))
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - ATTENDANCE_EXCUSES
-- ============================================================
CREATE POLICY "Tenant members can view attendance excuses"
    ON public.attendance_excuses FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Students can view their own excuses"
    ON public.attendance_excuses FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Students can submit excuses"
    ON public.attendance_excuses FOR INSERT
    TO authenticated
    WITH CHECK (
        public.user_belongs_to_tenant(tenant_id)
        AND student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant staff can manage excuses"
    ON public.attendance_excuses FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (
            public.is_tenant_admin()
            OR public.has_role('manager')
            OR public.has_role('instructor')
        )
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER set_updated_at_attendance_records
    BEFORE UPDATE ON public.attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_attendance_summary
    BEFORE UPDATE ON public.attendance_summary
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_attendance_policies
    BEFORE UPDATE ON public.attendance_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_attendance_excuses
    BEFORE UPDATE ON public.attendance_excuses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

-- ============================================================
-- AUDIT TRIGGERS
-- ============================================================
CREATE TRIGGER audit_attendance_records
    AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_attendance_policies
    AFTER INSERT OR UPDATE OR DELETE ON public.attendance_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

-- ============================================================
-- ATTENDANCE HELPER FUNCTIONS
-- ============================================================

-- Function to calculate attendance percentage
CREATE OR REPLACE FUNCTION public.calculate_attendance_percentage(
    p_student_id UUID,
    p_class_id UUID,
    p_tenant_id UUID
)
RETURNS DECIMAL(5, 2)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total INTEGER;
    present INTEGER;
    percentage DECIMAL(5, 2);
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status IN ('present', 'late'))
    INTO total, present
    FROM public.attendance_records
    WHERE student_id = p_student_id
      AND class_id = p_class_id
      AND tenant_id = p_tenant_id
      AND deleted_at IS NULL;

    IF total = 0 THEN
        RETURN 0;
    END IF;

    percentage := ROUND((present::DECIMAL / total) * 100, 2);
    RETURN percentage;
END;
$$;

-- Function to update attendance summary
CREATE OR REPLACE FUNCTION public.update_attendance_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_month INTEGER;
    v_year INTEGER;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        v_month := EXTRACT(MONTH FROM NEW.attendance_date);
        v_year := EXTRACT(YEAR FROM NEW.attendance_date);
    ELSE
        v_month := EXTRACT(MONTH FROM OLD.attendance_date);
        v_year := EXTRACT(YEAR FROM OLD.attendance_date);
    END IF;

    -- Upsert attendance summary
    INSERT INTO public.attendance_summary (
        tenant_id,
        student_id,
        class_id,
        month,
        year,
        total_sessions,
        present_count,
        absent_count,
        late_count,
        excused_count
    )
    SELECT
        tenant_id,
        student_id,
        class_id,
        v_month,
        v_year,
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'present'),
        COUNT(*) FILTER (WHERE status = 'absent'),
        COUNT(*) FILTER (WHERE status = 'late'),
        COUNT(*) FILTER (WHERE status = 'excused')
    FROM public.attendance_records
    WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)
      AND class_id = COALESCE(NEW.class_id, OLD.class_id)
      AND tenant_id = COALESCE(NEW.tenant_id, OLD.tenant_id)
      AND EXTRACT(MONTH FROM attendance_date) = v_month
      AND EXTRACT(YEAR FROM attendance_date) = v_year
      AND deleted_at IS NULL
    GROUP BY tenant_id, student_id, class_id
    ON CONFLICT (tenant_id, student_id, class_id, month, year)
    DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        present_count = EXCLUDED.present_count,
        absent_count = EXCLUDED.absent_count,
        late_count = EXCLUDED.late_count,
        excused_count = EXCLUDED.excused_count,
        updated_at = NOW();

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Create trigger to auto-update attendance summary
CREATE TRIGGER auto_update_attendance_summary
    AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_attendance_summary();

-- ============================================================
-- GRANT PERMISSIONS FOR NEW FUNCTIONS
-- ============================================================
GRANT EXECUTE ON FUNCTION public.calculate_attendance_percentage(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_attendance_summary() TO authenticated;
