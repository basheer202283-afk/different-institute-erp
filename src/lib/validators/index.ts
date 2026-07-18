import { z } from "zod";

// Student validators
export const studentSchema = z.object({
  student_number: z.string().min(1, "Student number is required").max(50),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  status: z.enum(["pending", "active", "enrolled", "on_leave", "graduated", "transferred", "dropped", "suspended"]),
  academic_level: z.enum(["beginner", "elementary", "intermediate", "advanced", "professional", "expert"]),
  admission_date: z.string().optional().or(z.literal("")),
  guardian_name: z.string().max(200).optional().or(z.literal("")),
  guardian_phone: z.string().max(50).optional().or(z.literal("")),
  guardian_email: z.string().email("Invalid email").optional().or(z.literal("")),
  guardian_relationship: z.string().max(50).optional().or(z.literal("")),
  emergency_contact_name: z.string().max(200).optional().or(z.literal("")),
  emergency_contact_phone: z.string().max(50).optional().or(z.literal("")),
  medical_conditions: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  blood_group: z.string().max(10).optional().or(z.literal("")),
  nationality: z.string().max(100).optional().or(z.literal("")),
  previous_school: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type StudentFormData = z.infer<typeof studentSchema>;

// Course validators
export const courseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(200),
  code: z.string().min(1, "Course code is required").max(20),
  description: z.string().optional().or(z.literal("")),
  program_id: z.string().uuid().optional().or(z.literal("")),
  department_id: z.string().uuid().optional().or(z.literal("")),
  instructor_id: z.string().uuid().optional().or(z.literal("")),
  academic_level: z.enum(["beginner", "elementary", "intermediate", "advanced", "professional", "expert"]),
  status: z.enum(["draft", "published", "active", "completed", "cancelled", "archived"]),
  credits: z.coerce.number().min(0).default(0),
  duration_hours: z.coerce.number().min(0).optional(),
  max_students: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0).default(0),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  is_online: z.boolean().default(false),
  location: z.string().max(255).optional().or(z.literal("")),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// Class validators
export const classSchema = z.object({
  name: z.string().min(1, "Class name is required").max(200),
  code: z.string().min(1, "Class code is required").max(20),
  course_id: z.string().uuid("Select a course"),
  semester_id: z.string().uuid().optional().or(z.literal("")),
  instructor_id: z.string().uuid().optional().or(z.literal("")),
  section: z.string().max(20).optional().or(z.literal("")),
  status: z.enum(["scheduled", "active", "completed", "cancelled", "postponed"]),
  max_students: z.coerce.number().min(0).optional(),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  room: z.string().max(100).optional().or(z.literal("")),
  building: z.string().max(100).optional().or(z.literal("")),
});

export type ClassFormData = z.infer<typeof classSchema>;

// Program validators
export const programSchema = z.object({
  name: z.string().min(1, "Program name is required").max(200),
  code: z.string().min(1, "Program code is required").max(20),
  description: z.string().optional().or(z.literal("")),
  department_id: z.string().uuid().optional().or(z.literal("")),
  academic_level: z.enum(["beginner", "elementary", "intermediate", "advanced", "professional", "expert"]),
  duration_months: z.coerce.number().min(0).optional(),
  total_credits: z.coerce.number().min(0).optional(),
  is_active: z.boolean().default(true),
});

export type ProgramFormData = z.infer<typeof programSchema>;

// Department validators
export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required").max(200),
  code: z.string().min(1, "Code is required").max(20),
  description: z.string().optional().or(z.literal("")),
  head_id: z.string().uuid().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;

// Instructor validators
export const instructorSchema = z.object({
  user_id: z.string().uuid("Select a user"),
  department_id: z.string().uuid().optional().or(z.literal("")),
  employee_number: z.string().max(50).optional().or(z.literal("")),
  specialization: z.string().max(200).optional().or(z.literal("")),
  qualifications: z.string().optional().or(z.literal("")),
  experience_years: z.coerce.number().min(0).default(0),
  hourly_rate: z.coerce.number().min(0).optional(),
  bio: z.string().optional().or(z.literal("")),
  office_location: z.string().max(200).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type InstructorFormData = z.infer<typeof instructorSchema>;

// Academic year validators
export const academicYearSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  code: z.string().min(1, "Code is required").max(20),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  is_current: z.boolean().default(false),
  is_active: z.boolean().default(true),
  description: z.string().optional().or(z.literal("")),
});

export type AcademicYearFormData = z.infer<typeof academicYearSchema>;

// Semester validators
export const semesterSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  code: z.string().min(1, "Code is required").max(20),
  academic_year_id: z.string().uuid("Select an academic year"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  is_current: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export type SemesterFormData = z.infer<typeof semesterSchema>;

// Enrollment validators
export const enrollmentSchema = z.object({
  student_id: z.string().uuid("Select a student"),
  course_id: z.string().uuid("Select a course"),
  class_id: z.string().uuid().optional().or(z.literal("")),
  enrollment_date: z.string().min(1, "Enrollment date is required"),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  status: z.string().default("active"),
  total_fees: z.coerce.number().min(0).default(0),
  discount_amount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().or(z.literal("")),
});

export type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

// Attendance validators
export const attendanceSchema = z.object({
  class_id: z.string().uuid("Select a class"),
  attendance_date: z.string().min(1, "Date is required"),
  records: z.array(z.object({
    student_id: z.string().uuid(),
    status: z.enum(["present", "absent", "late", "excused", "left_early", "holiday"]),
    check_in_time: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
  })),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;

// Academic year validator
export const academicYearValid = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});
