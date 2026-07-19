-- ============================================================
-- Different Institute ERP Platform
-- Seed Data
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- Default Roles
INSERT INTO public.roles (id, tenant_id, name, slug, description, is_system, is_default, level) VALUES
    ('a0000000-0000-0000-0000-000000000001', NULL, 'Owner', 'owner', 'Full system access', TRUE, FALSE, 100),
    ('a0000000-0000-0000-0000-000000000002', NULL, 'Institute Manager', 'manager', 'Institute management', TRUE, FALSE, 80),
    ('a0000000-0000-0000-0000-000000000003', NULL, 'Reception', 'reception', 'Front desk operations', TRUE, FALSE, 40),
    ('a0000000-0000-0000-0000-000000000004', NULL, 'Accountant', 'accountant', 'Financial management', TRUE, FALSE, 60),
    ('a0000000-0000-0000-0000-000000000005', NULL, 'Trainer', 'trainer', 'Teaching and training', TRUE, TRUE, 50);

-- Default Permissions
INSERT INTO public.permissions (id, tenant_id, name, slug, module, action, resource, is_system) VALUES
    -- Student permissions
    ('b0000000-0000-0000-0000-000000000001', NULL, 'View Students', 'students.view', 'students', 'read', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000002', NULL, 'Create Students', 'students.create', 'students', 'create', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000003', NULL, 'Update Students', 'students.update', 'students', 'update', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000004', NULL, 'Delete Students', 'students.delete', 'students', 'delete', 'students', TRUE),
    -- Trainer permissions
    ('b0000000-0000-0000-0000-000000000005', NULL, 'View Trainers', 'trainers.view', 'trainers', 'read', 'trainers', TRUE),
    ('b0000000-0000-0000-0000-000000000006', NULL, 'Create Trainers', 'trainers.create', 'trainers', 'create', 'trainers', TRUE),
    ('b0000000-0000-0000-0000-000000000007', NULL, 'Update Trainers', 'trainers.update', 'trainers', 'update', 'trainers', TRUE),
    -- Course permissions
    ('b0000000-0000-0000-0000-000000000008', NULL, 'View Courses', 'courses.view', 'courses', 'read', 'courses', TRUE),
    ('b0000000-0000-0000-0000-000000000009', NULL, 'Create Courses', 'courses.create', 'courses', 'create', 'courses', TRUE),
    ('b0000000-0000-0000-0000-000000000010', NULL, 'Update Courses', 'courses.update', 'courses', 'update', 'courses', TRUE),
    -- Finance permissions
    ('b0000000-0000-0000-0000-000000000011', NULL, 'View Finance', 'finance.view', 'finance', 'read', 'finance', TRUE),
    ('b0000000-0000-0000-0000-000000000012', NULL, 'Manage Finance', 'finance.manage', 'finance', 'update', 'finance', TRUE),
    -- Attendance permissions
    ('b0000000-0000-0000-0000-000000000013', NULL, 'View Attendance', 'attendance.view', 'attendance', 'read', 'attendance', TRUE),
    ('b0000000-0000-0000-0000-000000000014', NULL, 'Mark Attendance', 'attendance.mark', 'attendance', 'create', 'attendance', TRUE),
    -- Report permissions
    ('b0000000-0000-0000-0000-000000000015', NULL, 'View Reports', 'reports.view', 'reports', 'read', 'reports', TRUE),
    -- Settings permissions
    ('b0000000-0000-0000-0000-000000000016', NULL, 'Manage Settings', 'settings.manage', 'settings', 'update', 'settings', TRUE);

-- Role-Permission Mappings
-- Owner gets all permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000001', id, 'allow'
FROM public.permissions WHERE is_system = TRUE;

-- Manager gets most permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000002', id, 'allow'
FROM public.permissions WHERE is_system = TRUE AND slug NOT LIKE 'settings.manage';

-- Reception gets student and attendance permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000003', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND (slug LIKE 'students.%' OR slug LIKE 'attendance.%');

-- Accountant gets finance permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000004', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND (slug LIKE 'finance.%' OR slug LIKE 'reports.%');

-- Trainer gets course and attendance permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000005', id, 'allow'
FROM public.permissions WHERE is_system = TRUE
AND (slug LIKE 'courses.%' OR slug LIKE 'attendance.%' OR slug LIKE 'students.view');
