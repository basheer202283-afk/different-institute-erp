# Database Documentation

## Different Institute ERP Platform

### PostgreSQL 17 + Supabase

---

## Table of Contents

1. [Overview](#overview)
2. [Extensions](#extensions)
3. [Enum Types](#enum-types)
4. [Core Platform Tables](#core-platform-tables)
5. [Student Management Tables](#student-management-tables)
6. [Academic Management Tables](#academic-management-tables)
7. [Finance Tables](#finance-tables)
8. [Attendance Tables](#attendance-tables)
9. [Indexes](#indexes)
10. [Triggers](#triggers)
11. [Functions](#functions)
12. [Row Level Security](#row-level-security)

---

## Overview

The database is designed following PostgreSQL best practices with:
- **UUID Primary Keys**: All tables use UUID v4 for primary keys
- **Soft Delete**: All tables support soft delete via `deleted_at` column
- **Audit Trail**: All tables have `created_at`, `updated_at`, `created_by`, `updated_by`
- **Tenant Isolation**: All tables have `tenant_id` for multi-tenancy
- **JSONB Metadata**: All tables have `metadata` column for extensibility

---

## Extensions

| Extension | Purpose |
|-----------|---------|
| uuid-ossp | UUID generation |
| pgcrypto | Cryptographic functions |
| pg_trgm | Trigram text search |
| unaccent | Text normalization |
| moddatetime | Auto-update timestamps |
| pg_stat_statements | Query performance monitoring |

---

## Enum Types

### User & Auth Enums

| Enum | Values | Description |
|------|--------|-------------|
| user_status | active, inactive, suspended, pending, deleted | User account status |
| user_role_type | super_admin, tenant_admin, manager, instructor, student, staff, accountant, librarian, crm_agent, marketing_agent, viewer | User role types |
| gender_type | male, female, other, prefer_not_to_say | Gender options |
| contact_type | email, phone, mobile, fax, whatsapp, telegram | Contact types |
| address_type | home, work, billing, shipping, other | Address types |

### Organization Enums

| Enum | Values | Description |
|------|--------|-------------|
| org_status | active, inactive, suspended, trial, expired | Organization status |
| tenant_status | active, inactive, suspended, trial, expired, pending_setup | Tenant status |
| subscription_plan | free, basic, professional, enterprise, custom | Subscription plans |

### Academic Enums

| Enum | Values | Description |
|------|--------|-------------|
| student_status | enrolled, active, graduated, transferred, dropped, suspended, expelled, on_leave, pending, rejected | Student status |
| academic_level | beginner, elementary, intermediate, advanced, professional, expert | Academic levels |
| course_status | draft, published, active, completed, cancelled, archived | Course status |
| class_status | scheduled, active, completed, cancelled, postponed | Class status |

### Finance Enums

| Enum | Values | Description |
|------|--------|-------------|
| payment_status | pending, partial, paid, overdue, refunded, cancelled, failed | Payment status |
| invoice_status | draft, sent, viewed, partial, paid, overdue, cancelled, refunded | Invoice status |
| transaction_type | income, expense, refund, transfer, adjustment | Transaction types |
| payment_method | cash, bank_transfer, credit_card, debit_card, online, check, mobile_payment, other | Payment methods |

### Other Enums

| Enum | Values | Description |
|------|--------|-------------|
| attendance_status | present, absent, late, excused, left_early, holiday | Attendance status |
| task_status | todo, in_progress, review, completed, cancelled, on_hold | Task status |
| task_priority | low, medium, high, urgent, critical | Task priority |
| document_type | contract, agreement, certificate, receipt, invoice, id_document, academic_record, medical, other | Document types |
| notification_type | info, warning, success, error, reminder, announcement, task, payment, attendance, system | Notification types |
| audit_action | create, read, update, delete, login, logout, export, import, approve, reject, archive, restore | Audit actions |

---

## Core Platform Tables

### organizations

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| name | VARCHAR(255) | NO | - | Organization name |
| slug | VARCHAR(100) | NO | - | URL-friendly identifier (unique) |
| legal_name | VARCHAR(255) | YES | NULL | Legal entity name |
| registration_number | VARCHAR(100) | YES | NULL | Business registration number |
| tax_id | VARCHAR(100) | YES | NULL | Tax identification number |
| email | VARCHAR(255) | YES | NULL | Contact email |
| phone | VARCHAR(50) | YES | NULL | Contact phone |
| website | VARCHAR(500) | YES | NULL | Website URL |
| logo_url | VARCHAR(500) | YES | NULL | Logo image URL |
| status | org_status | NO | 'active' | Organization status |
| subscription_plan | subscription_plan | NO | 'free' | Subscription plan |
| subscription_expires_at | TIMESTAMPTZ | YES | NULL | Subscription expiry |
| settings | JSONB | YES | '{}' | Organization settings |
| metadata | JSONB | YES | '{}' | Additional metadata |
| created_at | TIMESTAMPTZ | NO | NOW() | Record creation time |
| updated_at | TIMESTAMPTZ | NO | NOW() | Last update time |
| deleted_at | TIMESTAMPTZ | YES | NULL | Soft delete timestamp |
| created_by | UUID | YES | NULL | Created by user ID |
| updated_by | UUID | YES | NULL | Updated by user ID |

### tenants

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| organization_id | UUID | NO | - | Parent organization (FK) |
| name | VARCHAR(255) | NO | - | Tenant name |
| slug | VARCHAR(100) | NO | - | URL-friendly identifier |
| domain | VARCHAR(255) | YES | NULL | Custom domain |
| logo_url | VARCHAR(500) | YES | NULL | Logo image URL |
| favicon_url | VARCHAR(500) | YES | NULL | Favicon URL |
| primary_color | VARCHAR(7) | YES | '#3B82F6' | Primary brand color |
| secondary_color | VARCHAR(7) | YES | '#1E40AF' | Secondary brand color |
| status | tenant_status | NO | 'pending_setup' | Tenant status |
| subscription_plan | subscription_plan | NO | 'free' | Subscription plan |
| max_users | INTEGER | YES | 10 | Maximum users |
| max_students | INTEGER | YES | 100 | Maximum students |
| max_storage_mb | INTEGER | YES | 1024 | Maximum storage (MB) |
| timezone | VARCHAR(50) | YES | 'UTC' | Default timezone |
| locale | VARCHAR(10) | YES | 'en' | Default locale |
| currency | VARCHAR(3) | YES | 'USD' | Default currency |
| date_format | VARCHAR(20) | YES | 'YYYY-MM-DD' | Date format |

### profiles

Extends Supabase `auth.users` table.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | - | Primary key (FK to auth.users) |
| tenant_id | UUID | YES | NULL | Tenant (FK) |
| first_name | VARCHAR(100) | YES | NULL | First name |
| last_name | VARCHAR(100) | YES | NULL | Last name |
| display_name | VARCHAR(200) | YES | NULL | Display name |
| avatar_url | VARCHAR(500) | YES | NULL | Avatar URL |
| date_of_birth | DATE | YES | NULL | Date of birth |
| gender | gender_type | YES | NULL | Gender |
| bio | TEXT | YES | NULL | Biography |
| status | user_status | NO | 'pending' | Account status |
| last_login_at | TIMESTAMPTZ | YES | NULL | Last login time |
| last_active_at | TIMESTAMPTZ | YES | NULL | Last activity time |
| login_count | INTEGER | YES | 0 | Total logins |
| preferences | JSONB | YES | '{}' | User preferences |

### roles

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | YES | NULL | Tenant (NULL = system role) |
| name | VARCHAR(100) | NO | - | Role name |
| slug | VARCHAR(100) | NO | - | Role slug |
| description | TEXT | YES | NULL | Role description |
| is_system | BOOLEAN | YES | FALSE | Is system role |
| is_default | BOOLEAN | YES | FALSE | Is default role |
| level | INTEGER | YES | 0 | Role hierarchy level |

### permissions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | YES | NULL | Tenant (NULL = system permission) |
| name | VARCHAR(200) | NO | - | Permission name |
| slug | VARCHAR(200) | NO | - | Permission slug |
| module | VARCHAR(50) | NO | - | Module name |
| action | VARCHAR(50) | NO | - | Action (CRUD) |
| resource | VARCHAR(100) | YES | NULL | Resource name |
| is_system | BOOLEAN | YES | FALSE | Is system permission |
| effect | permission_effect | NO | 'allow' | Allow or deny |

---

## Student Management Tables

### students

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | NO | - | Tenant (FK) |
| user_id | UUID | YES | NULL | Linked user account (FK) |
| student_number | VARCHAR(50) | NO | - | Student ID number |
| admission_date | DATE | YES | NULL | Admission date |
| status | student_status | NO | 'pending' | Student status |
| academic_level | academic_level | YES | 'beginner' | Academic level |
| guardian_name | VARCHAR(200) | YES | NULL | Guardian name |
| guardian_phone | VARCHAR(50) | YES | NULL | Guardian phone |
| guardian_email | VARCHAR(255) | YES | NULL | Guardian email |
| emergency_contact_name | VARCHAR(200) | YES | NULL | Emergency contact |
| emergency_contact_phone | VARCHAR(50) | YES | NULL | Emergency phone |
| medical_conditions | TEXT | YES | NULL | Medical conditions |
| allergies | TEXT | YES | NULL | Allergies |
| blood_group | VARCHAR(10) | YES | NULL | Blood group |
| nationality | VARCHAR(100) | YES | NULL | Nationality |
| tags | TEXT[] | YES | NULL | Tags |
| custom_fields | JSONB | YES | '{}' | Custom fields |

### student_enrollments

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | NO | - | Tenant (FK) |
| student_id | UUID | NO | - | Student (FK) |
| course_id | UUID | NO | - | Course (FK) |
| class_id | UUID | YES | NULL | Class (FK) |
| enrollment_date | DATE | NO | CURRENT_DATE | Enrollment date |
| start_date | DATE | YES | NULL | Start date |
| end_date | DATE | YES | NULL | End date |
| status | VARCHAR(20) | YES | 'active' | Enrollment status |
| payment_status | payment_status | YES | 'pending' | Payment status |
| total_fees | DECIMAL(12,2) | YES | 0 | Total fees |
| paid_amount | DECIMAL(12,2) | YES | 0 | Paid amount |

---

## Academic Management Tables

### academic_years

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | NO | - | Tenant (FK) |
| name | VARCHAR(100) | NO | - | Year name |
| code | VARCHAR(20) | NO | - | Year code |
| start_date | DATE | NO | - | Start date |
| end_date | DATE | NO | - | End date |
| is_current | BOOLEAN | YES | FALSE | Is current year |

### courses

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | NO | - | Tenant (FK) |
| program_id | UUID | YES | NULL | Program (FK) |
| department_id | UUID | YES | NULL | Department (FK) |
| instructor_id | UUID | YES | NULL | Instructor (FK) |
| name | VARCHAR(200) | NO | - | Course name |
| code | VARCHAR(20) | NO | - | Course code |
| description | TEXT | YES | NULL | Description |
| academic_level | academic_level | YES | 'beginner' | Level |
| status | course_status | NO | 'draft' | Status |
| credits | INTEGER | YES | 0 | Credits |
| duration_hours | INTEGER | YES | NULL | Duration |
| max_students | INTEGER | YES | NULL | Max enrollment |
| price | DECIMAL(12,2) | YES | 0 | Price |
| start_date | DATE | YES | NULL | Start date |
| end_date | DATE | YES | NULL | End date |

### classes

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | NO | - | Tenant (FK) |
| course_id | UUID | NO | - | Course (FK) |
| semester_id | UUID | YES | NULL | Semester (FK) |
| instructor_id | UUID | YES | NULL | Instructor (FK) |
| name | VARCHAR(200) | NO | - | Class name |
| code | VARCHAR(20) | NO | - | Class code |
| section | VARCHAR(20) | YES | NULL | Section |
| status | class_status | NO | 'scheduled' | Status |
| max_students | INTEGER | YES | NULL | Max students |
| current_students | INTEGER | YES | 0 | Current count |

---

## Finance Tables

### invoices

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | NO | - | Tenant (FK) |
| student_id | UUID | NO | - | Student (FK) |
| invoice_number | VARCHAR(50) | NO | - | Invoice number |
| status | invoice_status | NO | 'draft' | Status |
| issue_date | DATE | NO | CURRENT_DATE | Issue date |
| due_date | DATE | NO | - | Due date |
| subtotal | DECIMAL(12,2) | NO | 0 | Subtotal |
| tax_amount | DECIMAL(12,2) | YES | 0 | Tax |
| discount_amount | DECIMAL(12,2) | YES | 0 | Discount |
| total_amount | DECIMAL(12,2) | NO | 0 | Total |
| paid_amount | DECIMAL(12,2) | YES | 0 | Paid |
| balance | DECIMAL(12,2) | - | COMPUTED | Balance (computed) |

### payments

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | NO | - | Tenant (FK) |
| student_id | UUID | NO | - | Student (FK) |
| invoice_id | UUID | YES | NULL | Invoice (FK) |
| payment_number | VARCHAR(50) | NO | - | Payment number |
| amount | DECIMAL(12,2) | NO | - | Amount |
| payment_method | payment_method | NO | 'cash' | Method |
| payment_date | DATE | NO | CURRENT_DATE | Date |
| status | payment_status | NO | 'pending' | Status |

---

## Attendance Tables

### attendance_records

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | NO | - | Tenant (FK) |
| student_id | UUID | NO | - | Student (FK) |
| class_id | UUID | NO | - | Class (FK) |
| session_id | UUID | YES | NULL | Session (FK) |
| attendance_date | DATE | NO | CURRENT_DATE | Date |
| status | attendance_status | NO | 'present' | Status |
| check_in_time | TIME | YES | NULL | Check in |
| check_out_time | TIME | YES | NULL | Check out |
| late_minutes | INTEGER | YES | 0 | Late minutes |
| marked_by | UUID | YES | NULL | Marked by (FK) |

### attendance_summary

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| tenant_id | UUID | NO | - | Tenant (FK) |
| student_id | UUID | NO | - | Student (FK) |
| class_id | UUID | NO | - | Class (FK) |
| month | INTEGER | NO | - | Month (1-12) |
| year | INTEGER | NO | - | Year |
| total_sessions | INTEGER | YES | 0 | Total sessions |
| present_count | INTEGER | YES | 0 | Present count |
| absent_count | INTEGER | YES | 0 | Absent count |
| late_count | INTEGER | YES | 0 | Late count |
| attendance_percentage | DECIMAL(5,2) | - | COMPUTED | Percentage (computed) |

---

## Triggers

### Updated At Triggers
All tables with `updated_at` column have triggers to automatically update the timestamp.

### Audit Triggers
Core tables have audit triggers that log all INSERT, UPDATE, and DELETE operations to the `audit_logs` table.

### Custom Triggers

| Trigger | Table | Function | Description |
|---------|-------|----------|-------------|
| on_auth_user_created | auth.users | handle_new_user() | Creates profile on signup |
| auto_update_attendance_summary | attendance_records | update_attendance_summary() | Updates summary on attendance change |

---

## Functions

| Function | Returns | Description |
|----------|---------|-------------|
| get_user_tenant_id() | UUID | Get current user's tenant ID |
| has_role(VARCHAR) | BOOLEAN | Check if user has role |
| has_permission(VARCHAR) | BOOLEAN | Check if user has permission |
| is_super_admin() | BOOLEAN | Check if user is super admin |
| is_tenant_admin() | BOOLEAN | Check if user is tenant admin |
| user_belongs_to_tenant(UUID) | BOOLEAN | Check if user belongs to tenant |
| calculate_attendance_percentage(UUID, UUID, UUID) | DECIMAL | Calculate attendance percentage |
| update_attendance_summary() | TRIGGER | Update attendance summary |
| audit_trigger_func() | TRIGGER | Audit logging trigger |
| update_updated_at_func() | TRIGGER | Update timestamp trigger |
| handle_new_user() | TRIGGER | Handle new user signup |

---

## Row Level Security

All tables have RLS enabled. Policies are based on:
1. **Tenant membership**: Users can only access data in their tenant
2. **Role-based access**: Different roles have different permissions
3. **Ownership**: Users can access their own data
4. **Admin override**: Admins have elevated access

See [PERMISSIONS_MATRIX.md](PERMISSIONS_MATRIX.md) for detailed policy information.
