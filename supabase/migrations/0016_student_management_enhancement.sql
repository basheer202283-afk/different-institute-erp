-- ============================================================
-- Different Institute ERP Platform
-- Migration 0016: Student Management Enhancement
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- Enhance Students table with missing fields
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS national_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS first_name_ar VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name_ar VARCHAR(100),
ADD COLUMN IF NOT EXISTS first_name_en VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name_en VARCHAR(100),
ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS mobile VARCHAR(50),
ADD COLUMN IF NOT EXISTS alternative_mobile VARCHAR(50),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'YE',
ADD COLUMN IF NOT EXISTS guardian_whatsapp VARCHAR(50),
ADD COLUMN IF NOT EXISTS guardian_address TEXT,
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS level VARCHAR(50),
ADD COLUMN IF NOT EXISTS registration_date DATE,
ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Create unique index for registration_number
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_registration_number 
ON public.students(organization_id, registration_number) 
WHERE registration_number IS NOT NULL AND deleted_at IS NULL;

-- Create unique index for national_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_national_id 
ON public.students(organization_id, national_id) 
WHERE national_id IS NOT NULL AND deleted_at IS NULL;

-- Student Attachments table
CREATE TABLE IF NOT EXISTS public.student_attachments (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    attachment_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    description TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,
    created_by UUID,
    updated_by UUID
);

-- Student Academic History
CREATE TABLE IF NOT EXISTS public.student_academic_history (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    enrollment_date DATE,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'enrolled',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- Student Status History (audit trail)
CREATE TABLE IF NOT EXISTS public.student_status_history (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason TEXT,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_student_attachments_student_id ON public.student_attachments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attachments_type ON public.student_attachments(attachment_type);
CREATE INDEX IF NOT EXISTS idx_student_attachments_deleted_at ON public.student_attachments(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_student_academic_history_student_id ON public.student_academic_history(student_id);
CREATE INDEX IF NOT EXISTS idx_student_academic_history_org ON public.student_academic_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_student_academic_history_branch ON public.student_academic_history(branch_id);
CREATE INDEX IF NOT EXISTS idx_student_academic_history_deleted_at ON public.student_academic_history(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_student_status_history_student_id ON public.student_status_history(student_id);
CREATE INDEX IF NOT EXISTS idx_student_status_history_created_at ON public.student_status_history(created_at);

-- Additional indexes for students
CREATE INDEX IF NOT EXISTS idx_students_organization_id ON public.students(organization_id);
CREATE INDEX IF NOT EXISTS idx_students_branch_id ON public.students(branch_id);
CREATE INDEX IF NOT EXISTS idx_students_registration_number_idx ON public.students(registration_number);
CREATE INDEX IF NOT EXISTS idx_students_national_id_idx ON public.students(national_id);
CREATE INDEX IF NOT EXISTS idx_students_mobile ON public.students(mobile);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_first_name_ar ON public.students(first_name_ar);
CREATE INDEX IF NOT EXISTS idx_students_last_name_ar ON public.students(last_name_ar);
CREATE INDEX IF NOT EXISTS idx_students_first_name_en ON public.students(first_name_en);
CREATE INDEX IF NOT EXISTS idx_students_last_name_en ON public.students(last_name_en);

-- RLS for new tables
ALTER TABLE public.student_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view student attachments" ON public.student_attachments FOR SELECT
    TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant staff can manage student attachments" ON public.student_attachments FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('reception') OR public.has_role('academic_manager'))
    );

CREATE POLICY "Tenant members can view academic history" ON public.student_academic_history FOR SELECT
    TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant staff can manage academic history" ON public.student_academic_history FOR ALL
    TO authenticated USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_tenant_admin() OR public.has_role('academic_manager'))
    );

CREATE POLICY "Tenant members can view status history" ON public.student_status_history FOR SELECT
    TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "System can insert status history" ON public.student_status_history FOR INSERT
    TO authenticated WITH CHECK (tenant_id = public.get_user_tenant_id());

-- Triggers
CREATE TRIGGER set_updated_at_student_attachments BEFORE UPDATE ON public.student_attachments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

CREATE TRIGGER set_updated_at_student_academic_history BEFORE UPDATE ON public.student_academic_history
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func();

-- Function to auto-calculate age
CREATE OR REPLACE FUNCTION public.calculate_age()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.date_of_birth IS NOT NULL THEN
        NEW.age := EXTRACT(YEAR FROM age(NEW.date_of_birth));
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_student_age BEFORE INSERT OR UPDATE OF date_of_birth ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.calculate_age();

-- Function to auto-generate student number
CREATE OR REPLACE FUNCTION public.generate_student_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_num INTEGER;
    org_code VARCHAR(10);
BEGIN
    IF NEW.student_number IS NULL OR NEW.student_number = '' THEN
        SELECT COALESCE(slug, 'STU') INTO org_code 
        FROM public.organizations 
        WHERE id = NEW.organization_id;
        
        SELECT COALESCE(MAX(CAST(SUBSTRING(student_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
        INTO next_num
        FROM public.students
        WHERE organization_id = NEW.organization_id
        AND student_number ~ ('^' || org_code || '[0-9]+$');
        
        NEW.student_number := org_code || LPAD(next_num::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER auto_generate_student_number BEFORE INSERT ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.generate_student_number();
