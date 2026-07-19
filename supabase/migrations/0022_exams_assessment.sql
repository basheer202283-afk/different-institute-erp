-- ============================================================
-- Different Institute ERP Platform
-- Migration 0022: Exams & Assessment Module
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- Enhance exams table with new columns
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='organization_id') THEN
    ALTER TABLE public.exams ADD COLUMN organization_id UUID; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='branch_id') THEN
    ALTER TABLE public.exams ADD COLUMN branch_id UUID; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='title_ar') THEN
    ALTER TABLE public.exams ADD COLUMN title_ar VARCHAR(300); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='is_online') THEN
    ALTER TABLE public.exams ADD COLUMN is_online BOOLEAN DEFAULT FALSE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='instructions') THEN
    ALTER TABLE public.exams ADD COLUMN instructions TEXT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='allow_retake') THEN
    ALTER TABLE public.exams ADD COLUMN allow_retake BOOLEAN DEFAULT FALSE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='shuffle_questions') THEN
    ALTER TABLE public.exams ADD COLUMN shuffle_questions BOOLEAN DEFAULT FALSE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='show_results') THEN
    ALTER TABLE public.exams ADD COLUMN show_results BOOLEAN DEFAULT TRUE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='deleted_at') THEN
    ALTER TABLE public.exams ADD COLUMN deleted_at TIMESTAMPTZ; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='created_by') THEN
    ALTER TABLE public.exams ADD COLUMN created_by UUID; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='updated_by') THEN
    ALTER TABLE public.exams ADD COLUMN updated_by UUID; END IF; END $$;

-- Exam Questions Table
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) DEFAULT 'multiple_choice',
    marks DECIMAL(8,2) NOT NULL DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Exam Submissions Table
CREATE TABLE IF NOT EXISTS public.exam_submissions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    enrollment_id UUID,
    status VARCHAR(20) DEFAULT 'in_progress',
    score DECIMAL(8,2),
    percentage DECIMAL(5,2),
    grade VARCHAR(5),
    gpa DECIMAL(3,2),
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    time_taken_minutes INTEGER,
    feedback TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Exam Answers Table
CREATE TABLE IF NOT EXISTS public.exam_answers (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    submission_id UUID NOT NULL REFERENCES public.exam_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    selected_option VARCHAR(50),
    is_correct BOOLEAN,
    marks_awarded DECIMAL(8,2),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exams_org ON public.exams(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_course ON public.exams(course_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_class ON public.exams(class_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_date ON public.exams(exam_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_deleted ON public.exams(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON public.exam_questions(exam_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exam_questions_order ON public.exam_questions(exam_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_exam ON public.exam_submissions(exam_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exam_submissions_student ON public.exam_submissions(student_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exam_submissions_status ON public.exam_submissions(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exam_answers_submission ON public.exam_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_question ON public.exam_answers(question_id);

-- RLS
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view exam questions" ON public.exam_questions FOR SELECT TO authenticated
    USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant staff can manage exam questions" ON public.exam_questions FOR ALL TO authenticated
    USING (tenant_id = public.get_user_tenant_id() AND (public.is_tenant_admin() OR public.has_role('manager') OR public.has_role('trainer') OR public.has_role('academic_manager')))
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Students can view their submissions" ON public.exam_submissions FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR tenant_id = public.get_user_tenant_id());
CREATE POLICY "Students can create submissions" ON public.exam_submissions FOR INSERT TO authenticated
    WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant staff can manage submissions" ON public.exam_submissions FOR ALL TO authenticated
    USING (tenant_id = public.get_user_tenant_id() AND (public.is_tenant_admin() OR public.has_role('manager') OR public.has_role('trainer') OR public.has_role('academic_manager')))
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can view exam answers" ON public.exam_answers FOR SELECT TO authenticated
    USING (submission_id IN (SELECT id FROM public.exam_submissions WHERE student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())) OR tenant_id = public.get_user_tenant_id());
CREATE POLICY "Students can insert answers" ON public.exam_answers FOR INSERT TO authenticated
    WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant staff can manage answers" ON public.exam_answers FOR ALL TO authenticated
    USING (tenant_id = public.get_user_tenant_id() AND (public.is_tenant_admin() OR public.has_role('manager') OR public.has_role('trainer') OR public.has_role('academic_manager')))
    WITH CHECK (tenant_id = public.get_user_tenant_id());

-- Triggers
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='set_updated_at_exam_questions') THEN
    CREATE TRIGGER set_updated_at_exam_questions BEFORE UPDATE ON public.exam_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func(); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='set_updated_at_exam_submissions') THEN
    CREATE TRIGGER set_updated_at_exam_submissions BEFORE UPDATE ON public.exam_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func(); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='set_updated_at_exam_answers') THEN
    CREATE TRIGGER set_updated_at_exam_answers BEFORE UPDATE ON public.exam_answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_func(); END IF; END $$;
