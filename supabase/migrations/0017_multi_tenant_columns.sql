-- ============================================================
-- Different Institute ERP Platform
-- Migration 0017: Multi-Tenant Columns for All Tables
-- PostgreSQL 17 + Supabase Compatible
-- 
-- This migration adds organization_id and branch_id to all
-- tables that need multi-tenant support but don't have it yet.
-- ============================================================

-- Add organization_id and branch_id to trainers
ALTER TABLE public.trainers
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add organization_id and branch_id to courses
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add organization_id and branch_id to payments
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add organization_id and branch_id to attendance_records
ALTER TABLE public.attendance_records
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add organization_id and branch_id to invoices
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add organization_id and branch_id to expenses
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add organization_id and branch_id to departments
ALTER TABLE public.departments
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add organization_id and branch_id to programs
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add organization_id and branch_id to classes
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add organization_id and branch_id to academic_years
ALTER TABLE public.academic_years
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add organization_id and branch_id to semesters
ALTER TABLE public.semesters
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_trainers_organization_id ON public.trainers(organization_id);
CREATE INDEX IF NOT EXISTS idx_trainers_branch_id ON public.trainers(branch_id);

CREATE INDEX IF NOT EXISTS idx_courses_organization_id ON public.courses(organization_id);
CREATE INDEX IF NOT EXISTS idx_courses_branch_id ON public.courses(branch_id);

CREATE INDEX IF NOT EXISTS idx_payments_organization_id ON public.payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_branch_id ON public.payments(branch_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_organization_id ON public.attendance_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_branch_id ON public.attendance_records(branch_id);

CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON public.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_branch_id ON public.invoices(branch_id);

CREATE INDEX IF NOT EXISTS idx_expenses_organization_id ON public.expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_branch_id ON public.expenses(branch_id);

CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_branch_id ON public.departments(branch_id);

CREATE INDEX IF NOT EXISTS idx_programs_organization_id ON public.programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_programs_branch_id ON public.programs(branch_id);

CREATE INDEX IF NOT EXISTS idx_classes_organization_id ON public.classes(organization_id);
CREATE INDEX IF NOT EXISTS idx_classes_branch_id ON public.classes(branch_id);

CREATE INDEX IF NOT EXISTS idx_academic_years_organization_id ON public.academic_years(organization_id);
CREATE INDEX IF NOT EXISTS idx_academic_years_branch_id ON public.academic_years(branch_id);

CREATE INDEX IF NOT EXISTS idx_semesters_organization_id ON public.semesters(organization_id);
CREATE INDEX IF NOT EXISTS idx_semesters_branch_id ON public.semesters(branch_id);
