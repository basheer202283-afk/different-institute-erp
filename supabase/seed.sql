-- ============================================================
-- Different Institute ERP Platform
-- Seed Data
-- PostgreSQL 17 + Supabase Compatible
-- ============================================================

-- ============================================================
-- DEFAULT SYSTEM ROLES
-- ============================================================

-- Insert default roles (tenant_id NULL = system roles)
INSERT INTO public.roles (id, tenant_id, name, slug, description, is_system, is_default, level) VALUES
    ('a0000000-0000-0000-0000-000000000001', NULL, 'Super Admin', 'super_admin', 'Full system access', TRUE, FALSE, 100),
    ('a0000000-0000-0000-0000-000000000002', NULL, 'Tenant Admin', 'tenant_admin', 'Full tenant access', TRUE, FALSE, 90),
    ('a0000000-0000-0000-0000-000000000003', NULL, 'Manager', 'manager', 'Department management', TRUE, FALSE, 70),
    ('a0000000-0000-0000-0000-000000000004', NULL, 'Instructor', 'instructor', 'Teaching staff', TRUE, FALSE, 50),
    ('a0000000-0000-0000-0000-000000000005', NULL, 'Student', 'student', 'Student access', TRUE, TRUE, 10),
    ('a0000000-0000-0000-0000-000000000006', NULL, 'Staff', 'staff', 'General staff', TRUE, FALSE, 40),
    ('a0000000-0000-0000-0000-000000000007', NULL, 'Accountant', 'accountant', 'Finance management', TRUE, FALSE, 60),
    ('a0000000-0000-0000-0000-000000000008', NULL, 'Librarian', 'librarian', 'Library management', TRUE, FALSE, 40),
    ('a0000000-0000-0000-0000-000000000009', NULL, 'CRM Agent', 'crm_agent', 'CRM access', TRUE, FALSE, 40),
    ('a0000000-0000-0000-0000-000000000010', NULL, 'Marketing Agent', 'marketing_agent', 'Marketing access', TRUE, FALSE, 40),
    ('a0000000-0000-0000-0000-000000000011', NULL, 'Viewer', 'viewer', 'Read-only access', TRUE, FALSE, 5);

-- ============================================================
-- DEFAULT PERMISSIONS
-- ============================================================

-- Core Platform Permissions
INSERT INTO public.permissions (id, tenant_id, name, slug, module, action, resource, is_system) VALUES
    ('b0000000-0000-0000-0000-000000000001', NULL, 'View Organizations', 'organizations.view', 'organizations', 'read', 'organizations', TRUE),
    ('b0000000-0000-0000-0000-000000000002', NULL, 'Create Organizations', 'organizations.create', 'organizations', 'create', 'organizations', TRUE),
    ('b0000000-0000-0000-0000-000000000003', NULL, 'Update Organizations', 'organizations.update', 'organizations', 'update', 'organizations', TRUE),
    ('b0000000-0000-0000-0000-000000000004', NULL, 'Delete Organizations', 'organizations.delete', 'organizations', 'delete', 'organizations', TRUE),
    ('b0000000-0000-0000-0000-000000000005', NULL, 'View Tenants', 'tenants.view', 'tenants', 'read', 'tenants', TRUE),
    ('b0000000-0000-0000-0000-000000000006', NULL, 'Create Tenants', 'tenants.create', 'tenants', 'create', 'tenants', TRUE),
    ('b0000000-0000-0000-0000-000000000007', NULL, 'Update Tenants', 'tenants.update', 'tenants', 'update', 'tenants', TRUE),
    ('b0000000-0000-0000-0000-000000000008', NULL, 'Delete Tenants', 'tenants.delete', 'tenants', 'delete', 'tenants', TRUE),
    ('b0000000-0000-0000-0000-000000000009', NULL, 'View Users', 'users.view', 'users', 'read', 'users', TRUE),
    ('b0000000-0000-0000-0000-000000000010', NULL, 'Create Users', 'users.create', 'users', 'create', 'users', TRUE),
    ('b0000000-0000-0000-0000-000000000011', NULL, 'Update Users', 'users.update', 'users', 'update', 'users', TRUE),
    ('b0000000-0000-0000-0000-000000000012', NULL, 'Delete Users', 'users.delete', 'users', 'delete', 'users', TRUE),
    ('b0000000-0000-0000-0000-000000000013', NULL, 'View Roles', 'roles.view', 'roles', 'read', 'roles', TRUE),
    ('b0000000-0000-0000-0000-000000000014', NULL, 'Manage Roles', 'roles.manage', 'roles', 'update', 'roles', TRUE),
    ('b0000000-0000-0000-0000-000000000015', NULL, 'View Permissions', 'permissions.view', 'permissions', 'read', 'permissions', TRUE),
    ('b0000000-0000-0000-0000-000000000016', NULL, 'Manage Permissions', 'permissions.manage', 'permissions', 'update', 'permissions', TRUE),
    ('b0000000-0000-0000-0000-000000000017', NULL, 'View Audit Logs', 'audit_logs.view', 'audit_logs', 'read', 'audit_logs', TRUE),
    ('b0000000-0000-0000-0000-000000000018', NULL, 'View Settings', 'settings.view', 'settings', 'read', 'settings', TRUE),
    ('b0000000-0000-0000-0000-000000000019', NULL, 'Manage Settings', 'settings.manage', 'settings', 'update', 'settings', TRUE),
    ('b0000000-0000-0000-0000-000000000020', NULL, 'View Notifications', 'notifications.view', 'notifications', 'read', 'notifications', TRUE),
    ('b0000000-0000-0000-0000-000000000021', NULL, 'Manage Notifications', 'notifications.manage', 'notifications', 'update', 'notifications', TRUE);

-- Student Management Permissions
INSERT INTO public.permissions (id, tenant_id, name, slug, module, action, resource, is_system) VALUES
    ('b0000000-0000-0000-0000-000000000101', NULL, 'View Students', 'students.view', 'students', 'read', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000102', NULL, 'Create Students', 'students.create', 'students', 'create', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000103', NULL, 'Update Students', 'students.update', 'students', 'update', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000104', NULL, 'Delete Students', 'students.delete', 'students', 'delete', 'students', TRUE),
    ('b0000000-0000-0000-0000-000000000105', NULL, 'View Enrollments', 'enrollments.view', 'enrollments', 'read', 'enrollments', TRUE),
    ('b0000000-0000-0000-0000-000000000106', NULL, 'Manage Enrollments', 'enrollments.manage', 'enrollments', 'update', 'enrollments', TRUE),
    ('b0000000-0000-0000-0000-000000000107', NULL, 'View Student Documents', 'student_documents.view', 'student_documents', 'read', 'student_documents', TRUE),
    ('b0000000-0000-0000-0000-000000000108', NULL, 'Manage Student Documents', 'student_documents.manage', 'student_documents', 'update', 'student_documents', TRUE);

-- Academic Management Permissions
INSERT INTO public.permissions (id, tenant_id, name, slug, module, action, resource, is_system) VALUES
    ('b0000000-0000-0000-0000-000000000201', NULL, 'View Courses', 'courses.view', 'courses', 'read', 'courses', TRUE),
    ('b0000000-0000-0000-0000-000000000202', NULL, 'Create Courses', 'courses.create', 'courses', 'create', 'courses', TRUE),
    ('b0000000-0000-0000-0000-000000000203', NULL, 'Update Courses', 'courses.update', 'courses', 'update', 'courses', TRUE),
    ('b0000000-0000-0000-0000-000000000204', NULL, 'Delete Courses', 'courses.delete', 'courses', 'delete', 'courses', TRUE),
    ('b0000000-0000-0000-0000-000000000205', NULL, 'View Classes', 'classes.view', 'classes', 'read', 'classes', TRUE),
    ('b0000000-0000-0000-0000-000000000206', NULL, 'Manage Classes', 'classes.manage', 'classes', 'update', 'classes', TRUE),
    ('b0000000-0000-0000-0000-000000000207', NULL, 'View Departments', 'departments.view', 'departments', 'read', 'departments', TRUE),
    ('b0000000-0000-0000-0000-000000000208', NULL, 'Manage Departments', 'departments.manage', 'departments', 'update', 'departments', TRUE),
    ('b0000000-0000-0000-0000-000000000209', NULL, 'View Programs', 'programs.view', 'programs', 'read', 'programs', TRUE),
    ('b0000000-0000-0000-0000-000000000210', NULL, 'Manage Programs', 'programs.manage', 'programs', 'update', 'programs', TRUE),
    ('b0000000-0000-0000-0000-000000000211', NULL, 'View Instructors', 'instructors.view', 'instructors', 'read', 'instructors', TRUE),
    ('b0000000-0000-0000-0000-000000000212', NULL, 'Manage Instructors', 'instructors.manage', 'instructors', 'update', 'instructors', TRUE);

-- Finance Permissions
INSERT INTO public.permissions (id, tenant_id, name, slug, module, action, resource, is_system) VALUES
    ('b0000000-0000-0000-0000-000000000301', NULL, 'View Invoices', 'invoices.view', 'finance', 'read', 'invoices', TRUE),
    ('b0000000-0000-0000-0000-000000000302', NULL, 'Create Invoices', 'invoices.create', 'finance', 'create', 'invoices', TRUE),
    ('b0000000-0000-0000-0000-000000000303', NULL, 'Update Invoices', 'invoices.update', 'finance', 'update', 'invoices', TRUE),
    ('b0000000-0000-0000-0000-000000000304', NULL, 'Delete Invoices', 'invoices.delete', 'finance', 'delete', 'invoices', TRUE),
    ('b0000000-0000-0000-0000-000000000305', NULL, 'View Payments', 'payments.view', 'finance', 'read', 'payments', TRUE),
    ('b0000000-0000-0000-0000-000000000306', NULL, 'Manage Payments', 'payments.manage', 'finance', 'update', 'payments', TRUE),
    ('b0000000-0000-0000-0000-000000000307', NULL, 'View Transactions', 'transactions.view', 'finance', 'read', 'transactions', TRUE),
    ('b0000000-0000-0000-0000-000000000308', NULL, 'Manage Transactions', 'transactions.manage', 'finance', 'update', 'transactions', TRUE),
    ('b0000000-0000-0000-0000-000000000309', NULL, 'View Scholarships', 'scholarships.view', 'finance', 'read', 'scholarships', TRUE),
    ('b0000000-0000-0000-0000-000000000310', NULL, 'Manage Scholarships', 'scholarships.manage', 'finance', 'update', 'scholarships', TRUE),
    ('b0000000-0000-0000-0000-000000000311', NULL, 'View Fee Structures', 'fee_structures.view', 'finance', 'read', 'fee_structures', TRUE),
    ('b0000000-0000-0000-0000-000000000312', NULL, 'Manage Fee Structures', 'fee_structures.manage', 'finance', 'update', 'fee_structures', TRUE);

-- Attendance Permissions
INSERT INTO public.permissions (id, tenant_id, name, slug, module, action, resource, is_system) VALUES
    ('b0000000-0000-0000-0000-000000000401', NULL, 'View Attendance', 'attendance.view', 'attendance', 'read', 'attendance', TRUE),
    ('b0000000-0000-0000-0000-000000000402', NULL, 'Mark Attendance', 'attendance.mark', 'attendance', 'create', 'attendance', TRUE),
    ('b0000000-0000-0000-0000-000000000403', NULL, 'Update Attendance', 'attendance.update', 'attendance', 'update', 'attendance', TRUE),
    ('b0000000-0000-0000-0000-000000000404', NULL, 'Delete Attendance', 'attendance.delete', 'attendance', 'delete', 'attendance', TRUE),
    ('b0000000-0000-0000-0000-000000000405', NULL, 'View Attendance Reports', 'attendance_reports.view', 'attendance', 'read', 'attendance_reports', TRUE),
    ('b0000000-0000-0000-0000-000000000406', NULL, 'Manage Attendance Policies', 'attendance_policies.manage', 'attendance', 'update', 'attendance_policies', TRUE);

-- Communication Permissions
INSERT INTO public.permissions (id, tenant_id, name, slug, module, action, resource, is_system) VALUES
    ('b0000000-0000-0000-0000-000000000501', NULL, 'View Messages', 'messages.view', 'messaging', 'read', 'messages', TRUE),
    ('b0000000-0000-0000-0000-000000000502', NULL, 'Send Messages', 'messages.send', 'messaging', 'create', 'messages', TRUE),
    ('b0000000-0000-0000-0000-000000000503', NULL, 'View Announcements', 'announcements.view', 'announcements', 'read', 'announcements', TRUE),
    ('b0000000-0000-0000-0000-000000000504', NULL, 'Manage Announcements', 'announcements.manage', 'announcements', 'update', 'announcements', TRUE),
    ('b0000000-0000-0000-0000-000000000505', NULL, 'View Calendar', 'calendar.view', 'calendar', 'read', 'calendar', TRUE),
    ('b0000000-0000-0000-0000-000000000506', NULL, 'Manage Calendar', 'calendar.manage', 'calendar', 'update', 'calendar', TRUE);

-- Other Module Permissions
INSERT INTO public.permissions (id, tenant_id, name, slug, module, action, resource, is_system) VALUES
    ('b0000000-0000-0000-0000-000000000601', NULL, 'View Tasks', 'tasks.view', 'tasks', 'read', 'tasks', TRUE),
    ('b0000000-0000-0000-0000-000000000602', NULL, 'Manage Tasks', 'tasks.manage', 'tasks', 'update', 'tasks', TRUE),
    ('b0000000-0000-0000-0000-000000000603', NULL, 'View Documents', 'documents.view', 'documents', 'read', 'documents', TRUE),
    ('b0000000-0000-0000-0000-000000000604', NULL, 'Manage Documents', 'documents.manage', 'documents', 'update', 'documents', TRUE),
    ('b0000000-0000-0000-0000-000000000605', NULL, 'View Reports', 'reports.view', 'reports', 'read', 'reports', TRUE),
    ('b0000000-0000-0000-0000-000000000606', NULL, 'Generate Reports', 'reports.generate', 'reports', 'create', 'reports', TRUE),
    ('b0000000-0000-0000-0000-000000000607', NULL, 'View Dashboard', 'dashboard.view', 'dashboard', 'read', 'dashboard', TRUE),
    ('b0000000-0000-0000-0000-000000000608', NULL, 'View Library', 'library.view', 'library', 'read', 'library', TRUE),
    ('b0000000-0000-0000-0000-000000000609', NULL, 'Manage Library', 'library.manage', 'library', 'update', 'library', TRUE),
    ('b0000000-0000-0000-0000-000000000610', NULL, 'View CRM', 'crm.view', 'crm', 'read', 'crm', TRUE),
    ('b0000000-0000-0000-0000-000000000611', NULL, 'Manage CRM', 'crm.manage', 'crm', 'update', 'crm', TRUE),
    ('b0000000-0000-0000-0000-000000000612', NULL, 'View Marketing', 'marketing.view', 'marketing', 'read', 'marketing', TRUE),
    ('b0000000-0000-0000-0000-000000000613', NULL, 'Manage Marketing', 'marketing.manage', 'marketing', 'update', 'marketing', TRUE),
    ('b0000000-0000-0000-0000-000000000614', NULL, 'View Certificates', 'certificates.view', 'certificates', 'read', 'certificates', TRUE),
    ('b0000000-0000-0000-0000-000000000615', NULL, 'Manage Certificates', 'certificates.manage', 'certificates', 'update', 'certificates', TRUE);

-- ============================================================
-- ASSIGN PERMISSIONS TO ROLES
-- ============================================================

-- Super Admin gets all permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000001', id, 'allow'
FROM public.permissions
WHERE is_system = TRUE;

-- Tenant Admin gets all tenant-level permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000002', id, 'allow'
FROM public.permissions
WHERE is_system = TRUE
  AND slug NOT LIKE 'organizations.%'
  AND slug NOT LIKE 'tenants.create'
  AND slug NOT LIKE 'tenants.delete';

-- Manager gets most permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000003', id, 'allow'
FROM public.permissions
WHERE is_system = TRUE
  AND slug NOT LIKE 'organizations.%'
  AND slug NOT LIKE 'tenants.%'
  AND slug NOT LIKE 'users.delete'
  AND slug NOT LIKE 'roles.manage'
  AND slug NOT LIKE 'permissions.manage'
  AND slug NOT LIKE 'settings.manage';

-- Instructor permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000004', id, 'allow'
FROM public.permissions
WHERE is_system = TRUE
  AND (
    slug LIKE 'courses.view'
    OR slug LIKE 'classes.%'
    OR slug LIKE 'students.view'
    OR slug LIKE 'attendance.%'
    OR slug LIKE 'messages.%'
    OR slug LIKE 'announcements.view'
    OR slug LIKE 'calendar.%'
    OR slug LIKE 'tasks.%'
    OR slug LIKE 'documents.%'
    OR slug LIKE 'notifications.%'
    OR slug LIKE 'dashboard.view'
  );

-- Student permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000005', id, 'allow'
FROM public.permissions
WHERE is_system = TRUE
  AND (
    slug LIKE 'courses.view'
    OR slug LIKE 'classes.view'
    OR slug LIKE 'enrollments.view'
    OR slug LIKE 'attendance.view'
    OR slug LIKE 'invoices.view'
    OR slug LIKE 'payments.view'
    OR slug LIKE 'messages.%'
    OR slug LIKE 'announcements.view'
    OR slug LIKE 'calendar.view'
    OR slug LIKE 'tasks.view'
    OR slug LIKE 'documents.view'
    OR slug LIKE 'notifications.%'
    OR slug LIKE 'dashboard.view'
    OR slug LIKE 'certificates.view'
    OR slug LIKE 'student_documents.view'
  );

-- Staff permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000006', id, 'allow'
FROM public.permissions
WHERE is_system = TRUE
  AND (
    slug LIKE 'students.%'
    OR slug LIKE 'enrollments.%'
    OR slug LIKE 'courses.view'
    OR slug LIKE 'classes.view'
    OR slug LIKE 'attendance.view'
    OR slug LIKE 'attendance.mark'
    OR slug LIKE 'messages.%'
    OR slug LIKE 'announcements.view'
    OR slug LIKE 'calendar.%'
    OR slug LIKE 'tasks.%'
    OR slug LIKE 'documents.%'
    OR slug LIKE 'notifications.%'
    OR slug LIKE 'dashboard.view'
    OR slug LIKE 'student_documents.%'
  );

-- Accountant permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000007', id, 'allow'
FROM public.permissions
WHERE is_system = TRUE
  AND (
    slug LIKE 'students.view'
    OR slug LIKE 'enrollments.view'
    OR slug LIKE 'invoices.%'
    OR slug LIKE 'payments.%'
    OR slug LIKE 'transactions.%'
    OR slug LIKE 'scholarships.%'
    OR slug LIKE 'fee_structures.%'
    OR slug LIKE 'reports.%'
    OR slug LIKE 'messages.%'
    OR slug LIKE 'notifications.%'
    OR slug LIKE 'dashboard.view'
    OR slug LIKE 'documents.%'
  );

-- Viewer gets read-only permissions
INSERT INTO public.role_permissions (tenant_id, role_id, permission_id, effect)
SELECT NULL, 'a0000000-0000-0000-0000-000000000011', id, 'allow'
FROM public.permissions
WHERE is_system = TRUE
  AND slug LIKE '%.view';

-- ============================================================
-- DEFAULT SYSTEM SETTINGS
-- ============================================================
INSERT INTO public.system_settings (tenant_id, key, value, value_type, category, description, is_public) VALUES
    (NULL, 'platform.name', 'Different Institute ERP', 'string', 'general', 'Platform name', TRUE),
    (NULL, 'platform.version', '1.0.0', 'string', 'general', 'Platform version', TRUE),
    (NULL, 'platform.timezone', 'UTC', 'string', 'general', 'Default timezone', TRUE),
    (NULL, 'platform.locale', 'en', 'string', 'general', 'Default locale', TRUE),
    (NULL, 'platform.currency', 'USD', 'string', 'general', 'Default currency', TRUE),
    (NULL, 'auth.session_timeout', '3600', 'number', 'security', 'Session timeout in seconds', FALSE),
    (NULL, 'auth.max_login_attempts', '5', 'number', 'security', 'Max login attempts', FALSE),
    (NULL, 'auth.password_min_length', '8', 'number', 'security', 'Minimum password length', FALSE),
    (NULL, 'auth.require_2fa', 'false', 'boolean', 'security', 'Require 2FA', FALSE),
    (NULL, 'notifications.email_enabled', 'true', 'boolean', 'notifications', 'Enable email notifications', FALSE),
    (NULL, 'notifications.sms_enabled', 'false', 'boolean', 'notifications', 'Enable SMS notifications', FALSE),
    (NULL, 'storage.max_file_size_mb', '10', 'number', 'storage', 'Max file upload size', FALSE),
    (NULL, 'storage.allowed_types', '["pdf","doc","docx","xls","xlsx","jpg","jpeg","png","gif"]', 'json', 'storage', 'Allowed file types', FALSE);
