-- ============================================================
-- Different Institute ERP Platform
-- Migration 0011: Subjects, Exams, Grades, Certificates
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- Subjects
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 0,
    hours INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- Exams
CREATE TABLE public.exams (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    exam_type VARCHAR(50) DEFAULT 'quiz',
    total_marks DECIMAL(10, 2) DEFAULT 100,
    passing_marks DECIMAL(10, 2) DEFAULT 50,
    exam_date DATE,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    location VARCHAR(200),
    status VARCHAR(20) DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- Grades
CREATE TABLE public.grades (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(10, 2),
    grade VARCHAR(5),
    gpa DECIMAL(3, 2),
    remarks TEXT,
    graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(student_id, exam_id)
);

-- Certificates
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    certificate_number VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    issue_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'draft',
    file_path VARCHAR(500),
    issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID,
    revoke_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, certificate_number)
);

-- Indexes
CREATE INDEX idx_subjects_tenant_id ON public.subjects(tenant_id);
CREATE INDEX idx_subjects_program_id ON public.subjects(program_id);
CREATE INDEX idx_subjects_deleted_at ON public.subjects(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_exams_tenant_id ON public.exams(tenant_id);
CREATE INDEX idx_exams_course_id ON public.exams(course_id);
CREATE INDEX idx_exams_class_id ON public.exams(class_id);
CREATE INDEX idx_exams_trainer_id ON public.exams(trainer_id);
CREATE INDEX idx_exams_exam_date ON public.exams(exam_date);
CREATE INDEX idx_exams_status ON public.exams(status);
CREATE INDEX idx_exams_deleted_at ON public.exams(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_grades_tenant_id ON public.grades(tenant_id);
CREATE INDEX idx_grades_student_id ON public.grades(student_id);
CREATE INDEX idx_grades_exam_id ON public.grades(exam_id);
CREATE INDEX idx_grades_deleted_at ON public.grades(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_certificates_tenant_id ON public.certificates(tenant_id);
CREATE INDEX idx_certificates_student_id ON public.certificates(student_id);
CREATE INDEX idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX idx_certificates_status ON public.certificates(status);
CREATE INDEX idx_certificates_deleted_at ON public.certificates(deleted_at) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view subjects" ON public.subjects FOR SELECT
    TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant admins can manage subjects" ON public.subjects FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('manager'))
    );

CREATE POLICY "Tenant members can view exams" ON public.exams FOR SELECT
    TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant staff can manage exams" ON public.exams FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('trainer') OR public.has_role('manager'))
    );

CREATE POLICY "Students can view own grades" ON public.grades FOR SELECT
    TO authenticated USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    );

CREATE POLICY "Tenant staff can manage grades" ON public.grades FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('trainer') OR public.has_role('manager'))
    );

CREATE POLICY "Students can view own certificates" ON public.certificates FOR SELECT
    TO authenticated USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    );

CREATE POLICY "Tenant staff can manage certificates" ON public.certificates FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('manager'))
    );

-- Triggers
CREATE TRIGGER set_updated_at_subjects BEFORE UPDATE ON public.subjects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_exams BEFORE UPDATE ON public.exams
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_grades BEFORE UPDATE ON public.grades
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_certificates BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();
