-- ============================================================
-- Different Institute ERP Platform
-- Migration 0014: Enterprise RBAC
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- System Roles (replace existing seed data)
DELETE FROM public.role_permissions;
DELETE FROM public.roles;

INSERT INTO public.roles (id, tenant_id, name, slug, description, is_system, is_default, level) VALUES
    ('a0000000-0000-0000-0000-000000000001', NULL, 'Super Admin', 'super_admin', 'Full system access across all tenants', TRUE, FALSE, 100),
    ('a0000000-0000-0000-0000-000000000002', NULL, 'Institute Owner', 'owner', 'Full access within their institute', TRUE, FALSE, 95),
    ('a0000000-0000-0000-0000-000000000003', NULL, 'Branch Manager', 'branch_manager', 'Branch-level management', TRUE, FALSE, 80),
    ('a0000000-0000-0000-0000-000000000004', NULL, 'Finance Manager', 'finance_manager', 'Financial operations management', TRUE, FALSE, 70),
    ('a0000000-0000-0000-0000-000000000005', NULL, 'HR Manager', 'hr_manager', 'Human resources management', TRUE, FALSE, 70),
    ('a0000000-0000-0000-0000-000000000006', NULL, 'Academic Manager', 'academic_manager', 'Academic operations management', TRUE, FALSE, 70),
    ('a0000000-0000-0000-0000-000000000007', NULL, 'Trainer', 'trainer', 'Teaching and training', TRUE, FALSE, 50),
    ('a0000000-0000-0000-0000-000000000008', NULL, 'Reception', 'reception', 'Front desk operations', TRUE, FALSE, 40),
    ('a0000000-0000-0000-0000-000000000009', NULL, 'Student', 'student', 'Student access', TRUE, TRUE, 20),
    ('a0000000-0000-0000-0000-000000000010', NULL, 'Guardian', 'guardian', 'Parent/guardian access', TRUE, FALSE, 10);

-- Granular Permissions
DELETE FROM public.permissions;

INSERT INTO public.permissions (id, tenant_id, name, slug, module, action, resource, is_system) VALUES
    -- Dashboard
    ('b0000000-0000-0000-0000-000000000001', NULL, 'View Dashboard', 'dashboard.view', 'dashboard', 'read', 'dashboard', TRUE),
    
    -- Students
    ('b0000000-0000-0000-0000-000000000101', NULL, 'View Students', 'students.view', 'students', 'read', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000102', NULL, 'Create Students', 'students.create', 'students', 'create', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000103', NULL, 'Edit Students', 'students.edit', 'students', 'update', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000104', NULL, 'Delete Students', 'students.delete', 'students', 'delete', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000105', NULL, 'Export Students', 'students.export', 'students', 'export', 'students', TRUE),
    
    -- Trainers
    ('b0000000-0000-0000-0000-000000000201', NULL, 'View Trainers', 'trainers.view', 'trainers', 'read', 'trainers', TRUE),
    ('b0000000-0000-0000-0000-000000000202', NULL, 'Create Trainers', 'trainers.create', 'trainers', 'create', 'trainers', TRUE),
    ('b0000000-0000-0000-0000-000000000203', NULL, 'Edit Trainers', 'trainers.edit', 'trainers', 'update', 'trainers', TRUE),
    ('b0000000-0000-0000-0000-000000000204', NULL, 'Delete Trainers', 'trainers.delete', 'trainers', 'delete', 'trainers', TRUE),
    
    -- Courses
    ('b0000000-0000-0000-0000-000000000301', NULL, 'View Courses', 'courses.view', 'courses', 'read', 'courses', TRUE),
    ('b0000000-0000-0000-0000-000000000302', NULL, 'Create Courses', 'courses.create', 'courses', 'create', 'courses', TRUE),
    ('b0000000-0000-0000-0000-000000000303', NULL, 'Edit Courses', 'courses.edit', 'courses', 'update', 'courses', TRUE),
    ('b0000000-0000-0000-0000-000000000304', NULL, 'Delete Courses', 'courses.delete', 'courses', 'delete', 'courses', TRUE),
    
    -- Finance
    ('b0000000-0000-0000-0000-000000000401', NULL, 'View Finance', 'finance.view', 'finance', 'read', 'finance', TRUE),
    ('b0000000-0000-0000-0000-000000000402', NULL, 'Create Invoices', 'finance.invoices.create', 'finance', 'create', 'invoices', TRUE),
    ('b0000000-0000-0000-0000-000000000403', NULL, 'Manage Payments', 'finance.payments.manage', 'finance', 'manage', 'payments', TRUE),
    ('b0000000-0000-0000-0000-000000000404', NULL, 'Manage Expenses', 'finance.expenses.manage', 'finance', 'manage', 'expenses', TRUE),
    ('b0000000-0000-0000-0000-000000000405', NULL, 'Manage Scholarships', 'finance.scholarships.manage', 'finance', 'manage', 'scholarships', TRUE),
    ('b0000000-0000-0000-0000-000000000406', NULL, 'View Financial Reports', 'finance.reports.view', 'finance', 'read', 'reports', TRUE),
    
    -- Attendance
    ('b0000000-0000-0000-0000-000000000501', NULL, 'View Attendance', 'attendance.view', 'attendance', 'read', 'attendance', TRUE),
    ('b0000000-0000-0000-0000-000000000502', NULL, 'Mark Attendance', 'attendance.mark', 'attendance', 'create', 'attendance', TRUE),
    ('b0000000-0000-0000-0000-000000000503', NULL, 'Edit Attendance', 'attendance.edit', 'attendance', 'update', 'attendance', TRUE),
    
    -- Reports
    ('b0000000-0000-0000-0000-000000000601', NULL, 'View Reports', 'reports.view', 'reports', 'read', 'reports', TRUE),
    ('b0000000-0000-0000-0000-000000000602', NULL, 'Generate Reports', 'reports.generate', 'reports', 'create', 'reports', TRUE),
    ('b0000000-0000-0000-0000-000000000603', NULL, 'Export Reports', 'reports.export', 'reports', 'export', 'reports', TRUE),
    
    -- Settings
    ('b0000000-0000-0000-0000-000000000701', NULL, 'View Settings', 'settings.view', 'settings', 'read', 'settings', TRUE),
    ('b0000000-0000-0000-0000-000000000702', NULL, 'Manage Settings', 'settings.manage', 'settings', 'update', 'settings', TRUE),
    
    -- Users
    ('b0000000-0000-0000-0000-000000000801', NULL, 'View Users', 'users.view', 'users', 'read', 'users', TRUE),
    ('b0000000-0000-0000-0000-000000000802', NULL, 'Create Users', 'users.create', 'users', 'create', 'users', TRUE),
    ('b0000000-0000-0000-0000-000000000803', NULL, 'Edit Users', 'users.edit', 'users', 'update', 'users', TRUE),
    ('b0000000-0000-0000-0000-000000000804', NULL, 'Delete Users', 'users.delete', 'users', 'delete', 'users', TRUE),
    ('b0000000-0000-0000-0000-000000000805', NULL, 'Manage Roles', 'users.roles.manage', 'users', 'manage', 'roles', TRUE),
    
    -- Certificates
    ('b0000000-0000-0000-0000-000000000901', NULL, 'View Certificates', 'certificates.view', 'certificates', 'read', 'certificates', TRUE),
    ('b0000000-0000-0000-0000-000000000902', NULL, 'Issue Certificates', 'certificates.issue', 'certificates', 'create', 'certificates', TRUE),
    
    -- Audit
    ('b0000000-0000-0000-0000-000000001001', NULL, 'View Audit Logs', 'audit.view', 'audit', 'read', 'audit_logs', TRUE);

-- Role-Permission Mappings

-- Super Admin: ALL permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000001', id, 'allow'
FROM public.permissions WHERE is_system = TRUE;

-- Owner: ALL except super_admin specific
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000002', id, 'allow'
FROM public.permissions WHERE is_system = TRUE;

-- Branch Manager: Most except finance and user management
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000003', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND slug NOT LIKE 'finance.%'
AND slug NOT LIKE 'users.%'
AND slug NOT LIKE 'settings.manage';

-- Finance Manager: Finance + Reports + Students view
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000004', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND (slug LIKE 'finance.%' OR slug LIKE 'reports.%' OR slug = 'students.view' OR slug = 'dashboard.view');

-- HR Manager: Trainers + Employees + Students
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000005', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND (slug LIKE 'trainers.%' OR slug LIKE 'students.%' OR slug LIKE 'users.%' OR slug = 'dashboard.view');

-- Academic Manager: Academic + Attendance + Reports
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000006', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND (slug LIKE 'courses.%' OR slug LIKE 'attendance.%' OR slug LIKE 'certificates.%' OR slug LIKE 'reports.%' OR slug = 'students.view' OR slug = 'dashboard.view');

-- Trainer: Courses view + Attendance + Students view
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000007', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND (slug = 'courses.view' OR slug LIKE 'attendance.%' OR slug = 'students.view' OR slug = 'dashboard.view');

-- Reception: Students + Attendance
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000008', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND (slug LIKE 'students.%' OR slug LIKE 'attendance.%' OR slug = 'dashboard.view');

-- Student: View only
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000009', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND slug IN ('dashboard.view', 'students.view', 'courses.view', 'attendance.view', 'certificates.view');

-- Guardian: Limited view
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000010', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND slug IN ('dashboard.view', 'students.view', 'attendance.view');

-- Login Audit Table
CREATE TABLE public.login_audit (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_login_audit_user_id ON public.login_audit(user_id);
CREATE INDEX idx_login_audit_action ON public.login_audit(action);
CREATE INDEX idx_login_audit_created_at ON public.login_audit(created_at);

ALTER TABLE public.login_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view login audit" ON public.login_audit FOR SELECT
    TO authenticated USING (public.is_tenant_admin() OR public.is_super_admin());
