-- ============================================================
-- Different Institute ERP Platform
-- Migration 0006: Academic Management
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- ============================================================
-- ACADEMIC_YEARS TABLE
-- ============================================================
CREATE TABLE public.academic_years (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code),
    CHECK (end_date > start_date)
);

-- ============================================================
-- SEMESTERS TABLE
-- ============================================================
CREATE TABLE public.semesters (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code),
    CHECK (end_date > start_date)
);

-- ============================================================
-- DEPARTMENTS TABLE
-- ============================================================
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    head_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- ============================================================
-- PROGRAMS TABLE
-- ============================================================
CREATE TABLE public.programs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    academic_level public.academic_level DEFAULT 'beginner',
    duration_months INTEGER,
    total_credits INTEGER,
    total_courses INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    requirements TEXT,
    outcomes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- ============================================================
-- COURSES TABLE
-- ============================================================
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    academic_level public.academic_level DEFAULT 'beginner',
    status public.course_status NOT NULL DEFAULT 'draft',
    credits INTEGER DEFAULT 0,
    duration_hours INTEGER,
    max_students INTEGER,
    min_students INTEGER DEFAULT 1,
    price DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    start_date DATE,
    end_date DATE,
    schedule JSONB DEFAULT '{}',
    prerequisites TEXT[],
    syllabus TEXT,
    objectives TEXT,
    materials TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    online_link VARCHAR(500),
    location VARCHAR(255),
    image_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- ============================================================
-- CLASSES TABLE
-- ============================================================
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    section VARCHAR(20),
    status public.class_status NOT NULL DEFAULT 'scheduled',
    max_students INTEGER,
    current_students INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    schedule JSONB DEFAULT '{}',
    room VARCHAR(100),
    building VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, code)
);

-- ============================================================
-- CLASS_SCHEDULES TABLE
-- ============================================================
CREATE TABLE public.class_schedules (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(100),
    building VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    CHECK (end_time > start_time)
);

-- ============================================================
-- CLASS_SESSIONS TABLE
-- ============================================================
CREATE TABLE public.class_sessions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title VARCHAR(255),
    description TEXT,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(100),
    building VARCHAR(100),
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    materials JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    CHECK (end_time > start_time)
);

-- ============================================================
-- INSTRUCTORS TABLE
-- ============================================================
CREATE TABLE public.instructors (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    employee_number VARCHAR(50),
    specialization VARCHAR(200),
    qualifications TEXT,
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10, 2),
    bio TEXT,
    office_location VARCHAR(200),
    office_hours TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    UNIQUE(tenant_id, user_id)
);

-- ============================================================
-- INDEXES FOR ACADEMIC MANAGEMENT
-- ============================================================

-- Academic years indexes
CREATE INDEX idx_academic_years_tenant_id ON public.academic_years(tenant_id);
CREATE INDEX idx_academic_years_is_current ON public.academic_years(is_current);
CREATE INDEX idx_academic_years_deleted_at ON public.academic_years(deleted_at) WHERE deleted_at IS NULL;

-- Semesters indexes
CREATE INDEX idx_semesters_tenant_id ON public.semesters(tenant_id);
CREATE INDEX idx_semesters_academic_year_id ON public.semesters(academic_year_id);
CREATE INDEX idx_semesters_is_current ON public.semesters(is_current);
CREATE INDEX idx_semesters_deleted_at ON public.semesters(deleted_at) WHERE deleted_at IS NULL;

-- Departments indexes
CREATE INDEX idx_departments_tenant_id ON public.departments(tenant_id);
CREATE INDEX idx_departments_parent_id ON public.departments(parent_id);
CREATE INDEX idx_departments_head_id ON public.departments(head_id);
CREATE INDEX idx_departments_deleted_at ON public.departments(deleted_at) WHERE deleted_at IS NULL;

-- Programs indexes
CREATE INDEX idx_programs_tenant_id ON public.programs(tenant_id);
CREATE INDEX idx_programs_department_id ON public.programs(department_id);
CREATE INDEX idx_programs_deleted_at ON public.programs(deleted_at) WHERE deleted_at IS NULL;

-- Courses indexes
CREATE INDEX idx_courses_tenant_id ON public.courses(tenant_id);
CREATE INDEX idx_courses_program_id ON public.courses(program_id);
CREATE INDEX idx_courses_department_id ON public.courses(department_id);
CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_deleted_at ON public.courses(deleted_at) WHERE deleted_at IS NULL;

-- Classes indexes
CREATE INDEX idx_classes_tenant_id ON public.classes(tenant_id);
CREATE INDEX idx_classes_course_id ON public.classes(course_id);
CREATE INDEX idx_classes_semester_id ON public.classes(semester_id);
CREATE INDEX idx_classes_instructor_id ON public.classes(instructor_id);
CREATE INDEX idx_classes_status ON public.classes(status);
CREATE INDEX idx_classes_deleted_at ON public.classes(deleted_at) WHERE deleted_at IS NULL;

-- Class schedules indexes
CREATE INDEX idx_class_schedules_tenant_id ON public.class_schedules(tenant_id);
CREATE INDEX idx_class_schedules_class_id ON public.class_schedules(class_id);
CREATE INDEX idx_class_schedules_day_of_week ON public.class_schedules(day_of_week);
CREATE INDEX idx_class_schedules_deleted_at ON public.class_schedules(deleted_at) WHERE deleted_at IS NULL;

-- Class sessions indexes
CREATE INDEX idx_class_sessions_tenant_id ON public.class_sessions(tenant_id);
CREATE INDEX idx_class_sessions_class_id ON public.class_sessions(class_id);
CREATE INDEX idx_class_sessions_instructor_id ON public.class_sessions(instructor_id);
CREATE INDEX idx_class_sessions_session_date ON public.class_sessions(session_date);
CREATE INDEX idx_class_sessions_deleted_at ON public.class_sessions(deleted_at) WHERE deleted_at IS NULL;

-- Instructors indexes
CREATE INDEX idx_instructors_tenant_id ON public.instructors(tenant_id);
CREATE INDEX idx_instructors_user_id ON public.instructors(user_id);
CREATE INDEX idx_instructors_department_id ON public.instructors(department_id);
CREATE INDEX idx_instructors_deleted_at ON public.instructors(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- ADD FOREIGN KEYS FOR STUDENT_ENROLLMENTS
-- ============================================================
ALTER TABLE public.student_enrollments
    ADD CONSTRAINT fk_student_enrollments_course
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE public.student_enrollments
    ADD CONSTRAINT fk_student_enrollments_class
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - ACADEMIC_YEARS
-- ============================================================
CREATE POLICY "Tenant members can view academic years"
    ON public.academic_years FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can manage academic years"
    ON public.academic_years FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (public.is_tenant_admin() OR public.has_role('manager'))
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - SEMESTERS
-- ============================================================
CREATE POLICY "Tenant members can view semesters"
    ON public.semesters FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can manage semesters"
    ON public.semesters FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (public.is_tenant_admin() OR public.has_role('manager'))
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - DEPARTMENTS
-- ============================================================
CREATE POLICY "Tenant members can view departments"
    ON public.departments FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can manage departments"
    ON public.departments FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND public.is_tenant_admin()
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - PROGRAMS
-- ============================================================
CREATE POLICY "Tenant members can view programs"
    ON public.programs FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can manage programs"
    ON public.programs FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (public.is_tenant_admin() OR public.has_role('manager'))
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - COURSES
-- ============================================================
CREATE POLICY "Tenant members can view courses"
    ON public.courses FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Instructors can view their courses"
    ON public.courses FOR SELECT
    TO authenticated
    USING (instructor_id = auth.uid());

CREATE POLICY "Tenant staff can manage courses"
    ON public.courses FOR ALL
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
-- RLS POLICIES - CLASSES
-- ============================================================
CREATE POLICY "Tenant members can view classes"
    ON public.classes FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Instructors can view their classes"
    ON public.classes FOR SELECT
    TO authenticated
    USING (instructor_id = auth.uid());

CREATE POLICY "Tenant staff can manage classes"
    ON public.classes FOR ALL
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
-- RLS POLICIES - CLASS_SCHEDULES
-- ============================================================
CREATE POLICY "Tenant members can view class schedules"
    ON public.class_schedules FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant staff can manage class schedules"
    ON public.class_schedules FOR ALL
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
-- RLS POLICIES - CLASS_SESSIONS
-- ============================================================
CREATE POLICY "Tenant members can view class sessions"
    ON public.class_sessions FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Instructors can manage their class sessions"
    ON public.class_sessions FOR ALL
    TO authenticated
    USING (instructor_id = auth.uid())
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can manage class sessions"
    ON public.class_sessions FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (public.is_tenant_admin() OR public.has_role('manager'))
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- RLS POLICIES - INSTRUCTORS
-- ============================================================
CREATE POLICY "Tenant members can view instructors"
    ON public.instructors FOR SELECT
    TO authenticated
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Instructors can view their own record"
    ON public.instructors FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can manage instructors"
    ON public.instructors FOR ALL
    TO authenticated
    USING (
        public.user_belongs_to_tenant(tenant_id)
        AND (public.is_tenant_admin() OR public.has_role('manager'))
    )
    WITH CHECK (public.user_belongs_to_tenant(tenant_id));

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER set_updated_at_academic_years
    BEFORE UPDATE ON public.academic_years
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_semesters
    BEFORE UPDATE ON public.semesters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_departments
    BEFORE UPDATE ON public.departments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_programs
    BEFORE UPDATE ON public.programs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_courses
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_classes
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_class_schedules
    BEFORE UPDATE ON public.class_schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_class_sessions
    BEFORE UPDATE ON public.class_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_instructors
    BEFORE UPDATE ON public.instructors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_func();

-- ============================================================
-- AUDIT TRIGGERS
-- ============================================================
CREATE TRIGGER audit_academic_years
    AFTER INSERT OR UPDATE OR DELETE ON public.academic_years
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_courses
    AFTER INSERT OR UPDATE OR DELETE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_classes
    AFTER INSERT OR UPDATE OR DELETE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_instructors
    AFTER INSERT OR UPDATE OR DELETE ON public.instructors
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();
