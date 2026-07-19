-- ============================================================
-- Different Institute ERP Platform
-- Seed Data Script
-- Run this after migrations to populate sample data
-- ============================================================

-- First, let's create a default organization if it doesn't exist
INSERT INTO public.organizations (
  id, name, slug, legal_name, email, phone, website,
  brand_color, secondary_color, tagline, address, city, country,
  timezone, locale, currency, date_format, status, subscription_plan,
  max_branches, max_users, max_students, created_at, updated_at
) VALUES (
  'org-001-0000-0000-000000000001',
  'معهد المختلفة للتدريب النسائي',
  'different-female-institute',
  'معهد مختلفة للتدريب النسائي',
  'info@differentinstitute.com',
  '+967-1-234567',
  'https://differentinstitute.com',
  '#E91E63',
  '#9C27B0',
  'Empowering Women Through Education',
  'شارع الصافية',
  'صنعاء',
  'YE',
  'Asia/Aden',
  'ar',
  'YER',
  'YYYY-MM-DD',
  'active',
  'professional',
  5,
  100,
  1000,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create a default branch
INSERT INTO public.branches (
  id, organization_id, name, code, branch_code, description,
  address_line1, city, country, phone, email,
  timezone, locale, is_active, created_at, updated_at
) VALUES (
  'branch-001-0000-0000-000000000001',
  'org-001-0000-0000-000000000001',
  'الفرع الرئيسي',
  'MAIN',
  'BR-MAIN',
  'الفرع الرئيسي لمعهد مختلفة',
  'شارع الصافية، صنعاء',
  'صنعاء',
  'YE',
  '+967-1-234567',
  'main@differentinstitute.com',
  'Asia/Aden',
  'ar',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create a default tenant
INSERT INTO public.tenants (
  id, organization_id, name, slug, status,
  timezone, locale, currency, date_format,
  created_at, updated_at
) VALUES (
  'tenant-001-0000-0000-000000000001',
  'org-001-0000-0000-000000000001',
  'معهد مختلفة - الفرع الرئيسي',
  'different-main-branch',
  'active',
  'Asia/Aden',
  'ar',
  'YER',
  'YYYY-MM-DD',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create sample trainers
INSERT INTO public.trainers (
  id, tenant_id, organization_id, branch_id,
  first_name, last_name, email, phone, specialization,
  status, created_at, updated_at
) VALUES
  ('trainer-001-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'فاطمة', 'أحمد', 'fatima@differentinstitute.com', '+967-777-111111', 'اللغة العربية',
   'active', NOW(), NOW()),
  ('trainer-002-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'مريم', 'علي', 'maryam@differentinstitute.com', '+967-777-222222', 'الرياضيات',
   'active', NOW(), NOW()),
  ('trainer-003-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'نورة', 'محمد', 'noura@differentinstitute.com', '+967-777-333333', 'العلوم',
   'active', NOW(), NOW()),
  ('trainer-004-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'سارة', 'خالد', 'sara@differentinstitute.com', '+967-777-444444', 'اللغة الإنجليزية',
   'active', NOW(), NOW()),
  ('trainer-005-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'هدى', 'أحمد', 'huda@differentinstitute.com', '+967-777-555555', 'الحاسوب',
   'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample courses
INSERT INTO public.courses (
  id, tenant_id, organization_id, branch_id,
  name, code, description, status, price,
  duration_hours, max_students, created_at, updated_at
) VALUES
  ('course-001-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'دورة اللغة العربية المتقدمة', 'ARB-101', 'دورة شاملة في اللغة العربية للطلاب المتقدمين',
   'active', 50000, 40, 30, NOW(), NOW()),
  ('course-002-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'دورة الرياضيات الأساسية', 'MATH-101', 'دورة في أساسيات الرياضيات للمرحلة الثانوية',
   'active', 40000, 30, 25, NOW(), NOW()),
  ('course-003-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'دورة العلوم العامة', 'SCI-101', 'مقدمة في العلوم الطبيعية والفيزياء',
   'active', 45000, 35, 30, NOW(), NOW()),
  ('course-004-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'دورة اللغة الإنجليزية', 'ENG-101', 'تعلم أساسيات اللغة الإنجليزية',
   'active', 55000, 45, 25, NOW(), NOW()),
  ('course-005-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'دورة الحاسوب للمبتدئين', 'CS-101', 'تعلم أساسيات استخدام الحاسوب',
   'active', 35000, 20, 20, NOW(), NOW()),
  ('course-006-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'دورة البرمجة للمتقدمين', 'CS-201', 'تعلم البرمجة بلغة Python',
   'draft', 75000, 60, 15, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample students
INSERT INTO public.students (
  id, tenant_id, organization_id, branch_id,
  student_number, registration_number, national_id,
  first_name_ar, last_name_ar, first_name_en, last_name_en,
  date_of_birth, gender, nationality, mobile, email,
  address, city, country, status, academic_level,
  guardian_name, guardian_phone, guardian_email, guardian_relationship,
  registration_date, admission_date, notes, created_at, updated_at
) VALUES
  ('student-001-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'STU00001', 'REG-2026-001', '1234567890',
   'آمنة', 'محمد', 'Amina', 'Mohammed',
   '2005-03-15', 'female', 'يمنية', '+967-777-100001', 'amina@example.com',
   'شارع الزعفران، صنعاء', 'صنعاء', 'YE', 'active', 'intermediate',
   'محمد أحمد', '+967-777-200001', 'mohammed@example.com', 'father',
   '2026-01-15', '2026-01-15', 'طالبة متميزة', NOW(), NOW()),
  ('student-002-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'STU00002', 'REG-2026-002', '1234567891',
   'فاطمة', 'علي', 'Fatima', 'Ali',
   '2004-07-22', 'female', 'يمنية', '+967-777-100002', 'fatima@example.com',
   'شارع الحرية، صنعاء', 'صنعاء', 'YE', 'active', 'advanced',
   'علي حسن', '+967-777-200002', 'ali@example.com', 'father',
   '2026-01-20', '2026-01-20', NULL, NOW(), NOW()),
  ('student-003-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'STU00003', 'REG-2026-003', '1234567892',
   'مريم', 'أحمد', 'Maryam', 'Ahmed',
   '2005-11-08', 'female', 'يمنية', '+967-777-100003', 'maryam@example.com',
   'شارع الستين، صنعاء', 'صنعاء', 'YE', 'active', 'beginner',
   'أحمد محمد', '+967-777-200003', 'ahmed@example.com', 'father',
   '2026-02-01', '2026-02-01', 'طالبة جديدة', NOW(), NOW()),
  ('student-004-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'STU00004', 'REG-2026-004', '1234567893',
   'نورة', 'خالد', 'Noura', 'Khalid',
   '2004-01-30', 'female', 'يمنية', '+967-777-100004', 'noura@example.com',
   'شارع التحرير، صنعاء', 'صنعاء', 'YE', 'pending', 'intermediate',
   'خالد عبدالله', '+967-777-200004', 'khalid@example.com', 'father',
   '2026-02-10', NULL, NULL, NOW(), NOW()),
  ('student-005-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'STU00005', 'REG-2026-005', '1234567894',
   'سارة', 'حسن', 'Sara', 'Hassan',
   '2003-09-12', 'female', 'يمنية', '+967-777-100005', 'sara@example.com',
   'شارع الجمهورية، صنعاء', 'صنعاء', 'YE', 'active', 'advanced',
   'حسن أحمد', '+967-777-200005', 'hassan@example.com', 'father',
   '2026-01-05', '2026-01-05', NULL, NOW(), NOW()),
  ('student-006-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'STU00006', 'REG-2026-006', '1234567895',
   'هدى', 'سعيد', 'Huda', 'Saeed',
   '2005-05-18', 'female', 'يمنية', '+967-777-100006', 'huda@example.com',
   'شارع المكلا، صنعاء', 'صنعاء', 'YE', 'graduated', 'expert',
   'سعيد محمد', '+967-777-200006', 'saeed@example.com', 'father',
   '2025-09-01', '2025-09-01', 'تخرجت بنجاح', NOW(), NOW()),
  ('student-007-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'STU00007', 'REG-2026-007', '1234567896',
   'ليلى', 'يوسف', 'Layla', 'Yousef',
   '2004-12-03', 'female', 'يمنية', '+967-777-100007', 'layla@example.com',
   'شارع الحصبة، صنعاء', 'صنعاء', 'YE', 'active', 'intermediate',
   'يوسف أحمد', '+967-777-200007', 'yousef@example.com', 'father',
   '2026-02-15', '2026-02-15', NULL, NOW(), NOW()),
  ('student-008-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'STU00008', 'REG-2026-008', '1234567897',
   'رنا', 'إبراهيم', 'Rana', 'Ibrahim',
   '2005-08-25', 'female', 'يمنية', '+967-777-100008', 'rana@example.com',
   'شارعصنعاء القديمة', 'صنعاء', 'YE', 'active', 'beginner',
   'إبراهيم محمد', '+967-777-200008', 'ibrahim@example.com', 'father',
   '2026-03-01', '2026-03-01', 'طالبة مجتهدة', NOW(), NOW()),
  ('student-009-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'STU00009', 'REG-2026-009', '1234567898',
   'ياسمين', 'مصطفى', 'Yasmin', 'Mustafa',
   '2004-04-14', 'female', 'يمنية', '+967-777-100009', 'yasmin@example.com',
   'شارع تعز، صنعاء', 'صنعاء', 'YE', 'suspended', 'intermediate',
   'مصطفى أحمد', '+967-777-200009', 'mustafa@example.com', 'father',
   '2026-01-10', '2026-01-10', 'معلقة بسبب عدم السداد', NOW(), NOW()),
  ('student-010-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'STU00010', 'REG-2026-010', '1234567899',
   'سلمى', 'عبدالله', 'Salma', 'Abdullah',
   '2005-02-28', 'female', 'يمنية', '+967-777-100010', 'salma@example.com',
   'شارع عدن، صنعاء', 'صنعاء', 'YE', 'active', 'advanced',
   'عبدالله محمد', '+967-777-200010', 'abdullah@example.com', 'father',
   '2026-02-20', '2026-02-20', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample payments
INSERT INTO public.payments (
  id, tenant_id, organization_id, branch_id,
  student_id, payment_number, amount, currency,
  payment_method, payment_date, status, created_at, updated_at
) VALUES
  ('payment-001-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-001-0000-0000-000000000001', 'PAY-2026-001', 50000, 'YER',
   'cash', '2026-01-15', 'paid', NOW(), NOW()),
  ('payment-002-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-002-0000-0000-000000000001', 'PAY-2026-002', 40000, 'YER',
   'bank_transfer', '2026-01-20', 'paid', NOW(), NOW()),
  ('payment-003-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-003-0000-0000-000000000001', 'PAY-2026-003', 45000, 'YER',
   'cash', '2026-02-01', 'paid', NOW(), NOW()),
  ('payment-004-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-005-0000-0000-000000000001', 'PAY-2026-004', 55000, 'YER',
   'online', '2026-01-05', 'paid', NOW(), NOW()),
  ('payment-005-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-007-0000-0000-000000000001', 'PAY-2026-005', 35000, 'YER',
   'cash', '2026-02-15', 'paid', NOW(), NOW()),
  ('payment-006-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-008-0000-0000-000000000001', 'PAY-2026-006', 50000, 'YER',
   'bank_transfer', '2026-03-01', 'paid', NOW(), NOW()),
  ('payment-007-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-010-0000-0000-000000000001', 'PAY-2026-007', 75000, 'YER',
   'cash', '2026-02-20', 'paid', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample attendance records
INSERT INTO public.attendance_records (
  id, tenant_id, organization_id, branch_id,
  student_id, class_id, attendance_date, status,
  check_in_time, check_out_time, notes, created_at, updated_at
) VALUES
  ('att-001-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-001-0000-0000-000000000001', 'class-001', CURRENT_DATE, 'present',
   '08:00:00', '12:00:00', NULL, NOW(), NOW()),
  ('att-002-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-002-0000-0000-000000000001', 'class-001', CURRENT_DATE, 'present',
   '08:05:00', '12:00:00', NULL, NOW(), NOW()),
  ('att-003-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-003-0000-0000-000000000001', 'class-001', CURRENT_DATE, 'late',
   '08:20:00', '12:00:00', 'تأخرت 20 دقيقة', NOW(), NOW()),
  ('att-004-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-005-0000-0000-000000000001', 'class-001', CURRENT_DATE, 'present',
   '07:55:00', '12:00:00', NULL, NOW(), NOW()),
  ('att-005-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-007-0000-0000-000000000001', 'class-001', CURRENT_DATE, 'absent',
   NULL, NULL, 'غابت بعذر', NOW(), NOW()),
  ('att-006-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-008-0000-0000-000000000001', 'class-001', CURRENT_DATE, 'present',
   '08:00:00', '12:00:00', NULL, NOW(), NOW()),
  ('att-007-0000-0000-000000000001', 'tenant-001-0000-0000-000000000001', 'org-001-0000-0000-000000000001', 'branch-001-0000-0000-000000000001',
   'student-010-0000-0000-000000000001', 'class-001', CURRENT_DATE, 'present',
   '08:10:00', '12:00:00', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- Run this to verify data was inserted:
-- SELECT 'Students' as entity, COUNT(*) as count FROM students WHERE deleted_at IS NULL
-- UNION ALL
-- SELECT 'Trainers', COUNT(*) FROM trainers WHERE deleted_at IS NULL
-- UNION ALL
-- SELECT 'Courses', COUNT(*) FROM courses WHERE deleted_at IS NULL
-- UNION ALL
-- SELECT 'Payments', COUNT(*) FROM payments WHERE deleted_at IS NULL
-- UNION ALL
-- SELECT 'Attendance', COUNT(*) FROM attendance_records WHERE deleted_at IS NULL;
