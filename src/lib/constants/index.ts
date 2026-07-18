// ============================================================
// Different Institute ERP Platform
// Constants
// ============================================================

// App Configuration
export const APP_NAME = "Different Institute ERP";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "Enterprise-grade Multi-Tenant ERP Platform for Training Institutes";

// Navigation
export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Students",
    href: "/students",
    icon: "Users",
  },
  {
    title: "Academics",
    href: "/academics",
    icon: "BookOpen",
    children: [
      { title: "Programs", href: "/academics/programs" },
      { title: "Courses", href: "/academics/courses" },
      { title: "Classes", href: "/academics/classes" },
      { title: "Departments", href: "/academics/departments" },
      { title: "Instructors", href: "/academics/instructors" },
    ],
  },
  {
    title: "Finance",
    href: "/finance",
    icon: "CreditCard",
    children: [
      { title: "Invoices", href: "/finance/invoices" },
      { title: "Payments", href: "/finance/payments" },
      { title: "Scholarships", href: "/finance/scholarships" },
      { title: "Fee Structures", href: "/finance/fee-structures" },
    ],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: "CalendarCheck",
  },
  {
    title: "Certificates",
    href: "/certificates",
    icon: "Award",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "BarChart3",
  },
  {
    title: "Library",
    href: "/library",
    icon: "Library",
  },
  {
    title: "CRM",
    href: "/crm",
    icon: "Contact",
  },
  {
    title: "Marketing",
    href: "/marketing",
    icon: "Megaphone",
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: "CheckSquare",
  },
  {
    title: "Documents",
    href: "/documents",
    icon: "FileText",
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: "CalendarDays",
  },
  {
    title: "Announcements",
    href: "/announcements",
    icon: "Megaphone",
  },
  {
    title: "Messaging",
    href: "/messaging",
    icon: "MessageSquare",
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: "Bell",
  },
];

// Admin Navigation
export const ADMIN_NAV_ITEMS = [
  {
    title: "Users",
    href: "/users",
    icon: "UserCog",
  },
  {
    title: "Roles",
    href: "/roles",
    icon: "Shield",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "Settings",
  },
];

// Status Colors
export const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-800",
  published: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  partial: "bg-yellow-100 text-yellow-800",
} as const;

// Priority Colors
export const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
  critical: "bg-red-200 text-red-900",
} as const;

// Date Formats
export const DATE_FORMATS = {
  short: "MM/dd/yyyy",
  medium: "MMM dd, yyyy",
  long: "MMMM dd, yyyy",
  full: "EEEE, MMMM dd, yyyy",
  iso: "yyyy-MM-dd",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
];

// API Configuration
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    RESET_PASSWORD: "/api/auth/reset-password",
    UPDATE_PASSWORD: "/api/auth/update-password",
  },
  STUDENTS: "/api/students",
  COURSES: "/api/courses",
  CLASSES: "/api/classes",
  INVOICES: "/api/invoices",
  PAYMENTS: "/api/payments",
  ATTENDANCE: "/api/attendance",
  REPORTS: "/api/reports",
  NOTIFICATIONS: "/api/notifications",
} as const;

// Role Display Names
export const ROLE_LABELS = {
  super_admin: "Super Admin",
  tenant_admin: "Tenant Admin",
  manager: "Manager",
  instructor: "Instructor",
  student: "Student",
  staff: "Staff",
  accountant: "Accountant",
  librarian: "Librarian",
  crm_agent: "CRM Agent",
  marketing_agent: "Marketing Agent",
  viewer: "Viewer",
} as const;

// Modules
export const MODULES = [
  { id: "core", name: "Core Platform", icon: "Settings" },
  { id: "students", name: "Student Management", icon: "Users" },
  { id: "academics", name: "Academic Management", icon: "BookOpen" },
  { id: "finance", name: "Finance", icon: "CreditCard" },
  { id: "attendance", name: "Attendance", icon: "CalendarCheck" },
  { id: "certificates", name: "Certificates", icon: "Award" },
  { id: "reports", name: "Reports", icon: "BarChart3" },
  { id: "library", name: "Library", icon: "Library" },
  { id: "crm", name: "CRM", icon: "Contact" },
  { id: "marketing", name: "Marketing", icon: "Megaphone" },
  { id: "tasks", name: "Tasks", icon: "CheckSquare" },
  { id: "documents", name: "Documents", icon: "FileText" },
  { id: "calendar", name: "Calendar", icon: "CalendarDays" },
  { id: "announcements", name: "Announcements", icon: "Megaphone" },
  { id: "messaging", name: "Messaging", icon: "MessageSquare" },
] as const;
