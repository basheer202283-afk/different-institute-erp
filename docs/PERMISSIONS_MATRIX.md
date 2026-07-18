# Permissions Matrix

## Different Institute ERP Platform

---

## Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| Super Admin | 100 | Full system access across all tenants |
| Tenant Admin | 90 | Full access within their tenant |
| Manager | 70 | Department/branch management |
| Accountant | 60 | Financial operations |
| Instructor | 50 | Teaching and attendance |
| Staff | 40 | General operations |
| Librarian | 40 | Library management |
| CRM Agent | 40 | Customer relationship management |
| Marketing Agent | 40 | Marketing operations |
| Student | 10 | Limited self-service access |
| Viewer | 5 | Read-only access |

---

## Module Permissions

### Core Platform

| Permission | Super Admin | Tenant Admin | Manager | Accountant | Instructor | Staff | Student | Viewer |
|------------|:-----------:|:------------:|:-------:|:----------:|:----------:|:-----:|:-------:|:------:|
| **Organizations** |||||||||
| organizations.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| organizations.create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| organizations.update | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| organizations.delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tenants** |||||||||
| tenants.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| tenants.create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| tenants.update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| tenants.delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Users** |||||||||
| users.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| users.create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| users.update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| users.delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Roles** |||||||||
| roles.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| roles.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Permissions** |||||||||
| permissions.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| permissions.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Audit Logs** |||||||||
| audit_logs.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Settings** |||||||||
| settings.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| settings.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Notifications** |||||||||
| notifications.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| notifications.manage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Student Management

| Permission | Super Admin | Tenant Admin | Manager | Accountant | Instructor | Staff | Student | Viewer |
|------------|:-----------:|:------------:|:-------:|:----------:|:----------:|:-----:|:-------:|:------:|
| **Students** |||||||||
| students.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅¹ | ✅ |
| students.create | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| students.update | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| students.delete | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Enrollments** |||||||||
| enrollments.view | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅¹ | ✅ |
| enrollments.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Student Documents** |||||||||
| student_documents.view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅¹ | ✅ |
| student_documents.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

¹ Students can only view their own records

### Academic Management

| Permission | Super Admin | Tenant Admin | Manager | Accountant | Instructor | Staff | Student | Viewer |
|------------|:-----------:|:------------:|:-------:|:----------:|:----------:|:-----:|:-------:|:------:|
| **Courses** |||||||||
| courses.view | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| courses.create | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| courses.update | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| courses.delete | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Classes** |||||||||
| classes.view | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| classes.manage | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Departments** |||||||||
| departments.view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| departments.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Programs** |||||||||
| programs.view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| programs.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Instructors** |||||||||
| instructors.view | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| instructors.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Finance

| Permission | Super Admin | Tenant Admin | Manager | Accountant | Instructor | Staff | Student | Viewer |
|------------|:-----------:|:------------:|:-------:|:----------:|:----------:|:-----:|:-------:|:------:|
| **Invoices** |||||||||
| invoices.view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅¹ | ✅ |
| invoices.create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| invoices.update | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| invoices.delete | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Payments** |||||||||
| payments.view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅¹ | ✅ |
| payments.manage | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Transactions** |||||||||
| transactions.view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| transactions.manage | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Scholarships** |||||||||
| scholarships.view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅¹ | ✅ |
| scholarships.manage | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Fee Structures** |||||||||
| fee_structures.view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| fee_structures.manage | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

¹ Students can only view their own records

### Attendance

| Permission | Super Admin | Tenant Admin | Manager | Accountant | Instructor | Staff | Student | Viewer |
|------------|:-----------:|:------------:|:-------:|:----------:|:----------:|:-----:|:-------:|:------:|
| **Attendance** |||||||||
| attendance.view | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅¹ | ✅ |
| attendance.mark | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| attendance.update | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| attendance.delete | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| attendance_reports.view | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅¹ | ✅ |
| attendance_policies.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

¹ Students can only view their own attendance

### Communication

| Permission | Super Admin | Tenant Admin | Manager | Accountant | Instructor | Staff | Student | Viewer |
|------------|:-----------:|:------------:|:-------:|:----------:|:----------:|:-----:|:-------:|:------:|
| **Messages** |||||||||
| messages.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| messages.send | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Announcements** |||||||||
| announcements.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| announcements.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Calendar** |||||||||
| calendar.view | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| calendar.manage | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |

### Other Modules

| Permission | Super Admin | Tenant Admin | Manager | Accountant | Instructor | Staff | Student | Viewer |
|------------|:-----------:|:------------:|:-------:|:----------:|:----------:|:-----:|:-------:|:------:|
| **Tasks** |||||||||
| tasks.view | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| tasks.manage | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Documents** |||||||||
| documents.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| documents.manage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Reports** |||||||||
| reports.view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| reports.generate | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Dashboard** |||||||||
| dashboard.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Library** |||||||||
| library.view | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| library.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **CRM** |||||||||
| crm.view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| crm.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Marketing** |||||||||
| marketing.view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| marketing.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Certificates** |||||||||
| certificates.view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| certificates.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## Row Level Security Policies

### Tenant Isolation

All data tables enforce tenant isolation:

```sql
-- Example: Users can only see data in their tenant
CREATE POLICY "tenant_isolation" ON {table}
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());
```

### Role-Based Access

Different roles have different CRUD permissions:

```sql
-- Example: Only admins can delete
CREATE POLICY "admin_delete" ON {table}
    FOR DELETE
    USING (
        user_belongs_to_tenant(tenant_id)
        AND is_tenant_admin()
    );
```

### Owner Access

Users can access their own data:

```sql
-- Example: Users can view their own profile
CREATE POLICY "own_profile" ON profiles
    FOR SELECT
    USING (id = auth.uid());
```

---

## Permission Slugs

### Format

Permissions follow the pattern: `{module}.{action}`

### Examples

| Slug | Module | Action | Resource |
|------|--------|--------|----------|
| students.view | students | read | students |
| students.create | students | create | students |
| students.update | students | update | students |
| students.delete | students | delete | students |
| invoices.view | finance | read | invoices |
| attendance.mark | attendance | create | attendance |
| messages.send | messaging | create | messages |

---

## Checking Permissions

### In SQL

```sql
-- Check if user has specific permission
SELECT has_permission('students.view');

-- Check if user has specific role
SELECT has_role('tenant_admin');

-- Check if user is super admin
SELECT is_super_admin();

-- Get user's tenant ID
SELECT get_user_tenant_id();
```

### In JavaScript/TypeScript

```typescript
// Using Supabase client
const { data, error } = await supabase.rpc('has_permission', {
  permission_slug: 'students.view'
});

// Check role
const { data: hasRole } = await supabase.rpc('has_role', {
  role_slug: 'tenant_admin'
});
```

---

## Special Cases

### Service Role

The Supabase service role bypasses RLS and should only be used for:
- Admin operations
- Server-side operations
- Scheduled tasks
- Data migrations

### System Roles

System roles (with `is_system = TRUE`) cannot be deleted or modified by tenant admins.

### Default Roles

When a new user is created, they are assigned the default role (marked with `is_default = TRUE`).
