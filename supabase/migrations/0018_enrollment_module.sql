-- ============================================================
-- Different Institute ERP Platform
-- Migration 0018: Enrollment & Registration Module
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- ============================================================
-- ENHANCE STUDENT_ENROLLMENTS TABLE
-- ============================================================

-- Add new columns to student_enrollments
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'approval_status') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'approved_by') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'approved_at') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'rejection_reason') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'semester_id') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'transfer_from_enrollment_id') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN transfer_from_enrollment_id UUID REFERENCES public.student_enrollments(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'transfer_to_enrollment_id') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN transfer_to_enrollment_id UUID REFERENCES public.student_enrollments(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'cancellation_reason') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN cancellation_reason TEXT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'cancelled_at') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'cancelled_by') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'completion_date') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN completion_date DATE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'grade') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN grade VARCHAR(10);
    END IF;
END $$;

-- Add organization_id and branch_id if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'organization_id') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN organization_id UUID;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_enrollments' AND column_name = 'branch_id') THEN
        ALTER TABLE public.student_enrollments ADD COLUMN branch_id UUID;
    END IF;
END $$;

-- ============================================================
-- ENROLLMENT_WAITING_LIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enrollment_waiting_list (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    organization_id UUID,
    branch_id UUID,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
    offered_date TIMESTAMPTZ,
    offer_expires_at TIMESTAMPTZ,
    accepted_date TIMESTAMPTZ,
    declined_date TIMESTAMPTZ,
    decline_reason TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- ============================================================
-- ENROLLMENT_HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enrollment_history (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    enrollment_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    old_class_id UUID,
    new_class_id UUID,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR ENHANCED ENROLLMENTS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_student_enrollments_approval_status
    ON public.student_enrollments(approval_status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_student_enrollments_semester_id
    ON public.student_enrollments(semester_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_student_enrollments_transfer_from
    ON public.student_enrollments(transfer_from_enrollment_id);

CREATE INDEX IF NOT EXISTS idx_student_enrollments_transfer_to
    ON public.student_enrollments(transfer_to_enrollment_id);

CREATE INDEX IF NOT EXISTS idx_student_enrollments_organization_id
    ON public.student_enrollments(organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_student_enrollments_branch_id
    ON public.student_enrollments(branch_id) WHERE deleted_at IS NULL;

-- ============================================================
-- INDEXES FOR WAITING LIST
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_waiting_list_tenant_id
    ON public.enrollment_waiting_list(tenant_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_organization_id
    ON public.enrollment_waiting_list(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_waiting_list_student_id
    ON public.enrollment_waiting_list(student_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_course_id
    ON public.enrollment_waiting_list(course_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_status
    ON public.enrollment_waiting_list(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_waiting_list_position
    ON public.enrollment_waiting_list(course_id, position) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_waiting_list_deleted_at
    ON public.enrollment_waiting_list(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- INDEXES FOR ENROLLMENT HISTORY
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_enrollment_history_enrollment_id
    ON public.enrollment_history(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_history_tenant_id
    ON public.enrollment_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_history_action
    ON public.enrollment_history(action);
CREATE INDEX IF NOT EXISTS idx_enrollment_history_created_at
    ON public.enrollment_history(created_at);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.enrollment_waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - ENROLLMENT_WAITING_LIST
-- ============================================================
CREATE POLICY "Tenant members can view waiting list"
    ON public.enrollment_waiting_list FOR SELECT
    TO authenticated
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Students can view their own waiting list entries"
    ON public.enrollment_waiting_list FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant staff can manage waiting list"
    ON public.enrollment_waiting_list FOR ALL
    TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (
            public.is_tenant_admin()
            OR public.has_role('manager')
            OR public.has_role('staff')
            OR public.has_role('academic_manager')
            OR public.has_role('branch_manager')
            OR public.has_role('reception')
        )
    )
    WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ============================================================
-- RLS POLICIES - ENROLLMENT_HISTORY
-- ============================================================
CREATE POLICY "Tenant members can view enrollment history"
    ON public.enrollment_history FOR SELECT
    TO authenticated
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant staff can insert enrollment history"
    ON public.enrollment_history FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_enrollment_waiting_list') THEN
        CREATE TRIGGER set_updated_at_enrollment_waiting_list
            BEFORE UPDATE ON public.enrollment_waiting_list
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_func();
    END IF;
END $$;

-- ============================================================
-- AUDIT TRIGGERS
-- ============================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_enrollment_waiting_list') THEN
        CREATE TRIGGER audit_enrollment_waiting_list
            AFTER INSERT OR UPDATE OR DELETE ON public.enrollment_waiting_list
            FOR EACH ROW
            EXECUTE FUNCTION public.audit_trigger_func();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_enrollment_history') THEN
        CREATE TRIGGER audit_enrollment_history
            AFTER INSERT OR UPDATE OR DELETE ON public.enrollment_history
            FOR EACH ROW
            EXECUTE FUNCTION public.audit_trigger_func();
    END IF;
END $$;

-- ============================================================
-- ENROLLMENT STATUS CHANGE TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_enrollment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.enrollment_history (
            tenant_id, enrollment_id, action, old_status, new_status, changed_by
        ) VALUES (
            NEW.tenant_id, NEW.id, 'status_change', OLD.status, NEW.status, auth.uid()
        );
    END IF;
    IF OLD.class_id IS DISTINCT FROM NEW.class_id THEN
        INSERT INTO public.enrollment_history (
            tenant_id, enrollment_id, action, old_class_id, new_class_id, changed_by
        ) VALUES (
            NEW.tenant_id, NEW.id, 'class_change', OLD.class_id, NEW.class_id, auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'log_enrollment_status_change_trigger') THEN
        CREATE TRIGGER log_enrollment_status_change_trigger
            AFTER UPDATE OF status, class_id ON public.student_enrollments
            FOR EACH ROW
            EXECUTE FUNCTION public.log_enrollment_status_change();
    END IF;
END $$;
