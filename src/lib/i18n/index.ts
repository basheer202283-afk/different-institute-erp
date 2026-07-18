export type Locale = "en" | "ar";

export const locales: Locale[] = ["en", "ar"];
export const defaultLocale: Locale = "en";

export const localeConfig: Record<Locale, { name: string; nativeName: string; dir: "ltr" | "rtl"; flag: string }> = {
  en: { name: "English", nativeName: "English", dir: "ltr", flag: "🇺🇸" },
  ar: { name: "Arabic", nativeName: "العربية", dir: "rtl", flag: "🇸🇦" },
};

type TranslationKeys = {
  common: Record<string, string>;
  nav: Record<string, string>;
  dashboard: Record<string, string>;
  students: Record<string, string>;
  finance: Record<string, string>;
  attendance: Record<string, string>;
  academics: Record<string, string>;
  tasks: Record<string, string>;
  settings: Record<string, string>;
  auth: Record<string, string>;
};

const en: TranslationKeys = {
  common: {
    save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", view: "View",
    create: "Create", update: "Update", search: "Search", filter: "Filter",
    export: "Export", import: "Import", loading: "Loading...", noData: "No data found",
    confirm: "Confirm", back: "Back", next: "Next", submit: "Submit",
    actions: "Actions", status: "Status", date: "Date", amount: "Amount",
    name: "Name", description: "Description", type: "Type", category: "Category",
    active: "Active", inactive: "Inactive", pending: "Pending", completed: "Completed",
    success: "Success", error: "Error", warning: "Warning", info: "Info",
    total: "Total", count: "Count", all: "All", none: "None",
    welcome: "Welcome", signOut: "Sign Out", profile: "Profile", settings: "Settings",
  },
  nav: {
    dashboard: "Dashboard", students: "Students", academics: "Academics",
    finance: "Finance", attendance: "Attendance", tasks: "Tasks",
    documents: "Documents", calendar: "Calendar", notifications: "Notifications",
    announcements: "Announcements", analytics: "Analytics", reports: "Reports",
    certificates: "Certificates", enrollment: "Enrollment", guardians: "Guardians",
    users: "Users", roles: "Roles", settings: "Settings", search: "Search",
  },
  dashboard: {
    title: "Dashboard", welcome: "Welcome back", totalStudents: "Total Students",
    activeCourses: "Active Courses", monthlyRevenue: "Monthly Revenue",
    attendanceRate: "Attendance Rate", recentActivity: "Recent Activity",
    upcomingEvents: "Upcoming Events", tasks: "Tasks", announcements: "Announcements",
    quickActions: "Quick Actions", revenueChart: "Revenue Chart",
    enrollmentTrends: "Enrollment Trends", financialOverview: "Financial Overview",
  },
  students: {
    title: "Students", newStudent: "New Student", studentNumber: "Student Number",
    firstName: "First Name", lastName: "Last Name", email: "Email", phone: "Phone",
    dateOfBirth: "Date of Birth", gender: "Gender", status: "Status",
    guardianName: "Guardian Name", guardianPhone: "Guardian Phone",
    academicLevel: "Academic Level", admissionDate: "Admission Date",
    enrollments: "Enrollments", documents: "Documents", notes: "Notes",
  },
  finance: {
    title: "Finance", invoices: "Invoices", payments: "Payments",
    newInvoice: "New Invoice", recordPayment: "Record Payment",
    invoiceNumber: "Invoice Number", totalAmount: "Total Amount",
    paidAmount: "Paid Amount", outstanding: "Outstanding", dueDate: "Due Date",
    paymentMethod: "Payment Method", feeStructures: "Fee Structures",
    scholarships: "Scholarships", discounts: "Discounts", transactions: "Transactions",
    totalRevenue: "Total Revenue", thisMonth: "This Month", overdue: "Overdue",
  },
  attendance: {
    title: "Attendance", takeAttendance: "Take Attendance", present: "Present",
    absent: "Absent", late: "Late", excused: "Excused", rate: "Attendance Rate",
    todayTotal: "Today's Total", records: "Attendance Records",
  },
  academics: {
    title: "Academics", programs: "Programs", courses: "Courses", classes: "Classes",
    departments: "Departments", instructors: "Instructors", academicYears: "Academic Years",
    semesters: "Semesters", newProgram: "New Program", newCourse: "New Course",
  },
  tasks: {
    title: "Tasks", newTask: "New Task", myTasks: "My Tasks", allTasks: "All Tasks",
    todo: "To Do", inProgress: "In Progress", review: "Review", done: "Done",
    priority: "Priority", dueDate: "Due Date", assignee: "Assignee",
    low: "Low", medium: "Medium", high: "High", urgent: "Urgent", critical: "Critical",
  },
  settings: {
    title: "Settings", general: "General", security: "Security", notifications: "Notifications",
    appearance: "Appearance", language: "Language", theme: "Theme", timezone: "Timezone",
    currency: "Currency", dateFormat: "Date Format", branding: "Branding",
  },
  auth: {
    login: "Sign In", register: "Sign Up", forgotPassword: "Forgot Password",
    resetPassword: "Reset Password", email: "Email Address", password: "Password",
    rememberMe: "Remember Me", noAccount: "Don't have an account?",
    hasAccount: "Already have an account?", signUp: "Sign up", signIn: "Sign in",
    unauthorized: "Unauthorized", forbidden: "Forbidden",
  },
};

const ar: TranslationKeys = {
  common: {
    save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل", view: "عرض",
    create: "إنشاء", update: "تحديث", search: "بحث", filter: "تصفية",
    export: "تصدير", import: "استيراد", loading: "جاري التحميل...", noData: "لا توجد بيانات",
    confirm: "تأكيد", back: "رجوع", next: "التالي", submit: "إرسال",
    actions: "إجراءات", status: "الحالة", date: "التاريخ", amount: "المبلغ",
    name: "الاسم", description: "الوصف", type: "النوع", category: "الفئة",
    active: "نشط", inactive: "غير نشط", pending: "قيد الانتظار", completed: "مكتمل",
    success: "نجاح", error: "خطأ", warning: "تحذير", info: "معلومات",
    total: "الإجمالي", count: "العدد", all: "الكل", none: "لا شيء",
    welcome: "مرحباً", signOut: "تسجيل الخروج", profile: "الملف الشخصي", settings: "الإعدادات",
  },
  nav: {
    dashboard: "لوحة التحكم", students: "الطلاب", academics: "الأكاديمي",
    finance: "المالية", attendance: "الحضور", tasks: "المهام",
    documents: "المستندات", calendar: "التقويم", notifications: "الإشعارات",
    announcements: "الإعلانات", analytics: "التحليلات", reports: "التقارير",
    certificates: "الشهادات", enrollment: "التسجيل", guardians: "الأولياء",
    users: "المستخدمين", roles: "الأدوار", settings: "الإعدادات", search: "البحث",
  },
  dashboard: {
    title: "لوحة التحكم", welcome: "مرحباً بعودتك", totalStudents: "إجمالي الطلاب",
    activeCourses: "الدورات النشطة", monthlyRevenue: "الإيرادات الشهرية",
    attendanceRate: "نسبة الحضور", recentActivity: "النشاط الأخير",
    upcomingEvents: "الأحداث القادمة", tasks: "المهام", announcements: "الإعلانات",
    quickActions: "إجراءات سريعة", revenueChart: "رسم الإيرادات",
    enrollmentTrends: "اتجاهات التسجيل", financialOverview: "نظرة مالية",
  },
  students: {
    title: "الطلاب", newStudent: "طالب جديد", studentNumber: "رقم الطالب",
    firstName: "الاسم الأول", lastName: "اسم العائلة", email: "البريد الإلكتروني",
    phone: "الهاتف", dateOfBirth: "تاريخ الميلاد", gender: "الجنس", status: "الحالة",
    guardianName: "اسم ولي الأمر", guardianPhone: "هاتف ولي الأمر",
    academicLevel: "المستوى الأكاديمي", admissionDate: "تاريخ القبول",
    enrollments: "التسجيلات", documents: "المستندات", notes: "ملاحظات",
  },
  finance: {
    title: "المالية", invoices: "الفواتير", payments: "المدفوعات",
    newInvoice: "فاتورة جديدة", recordPayment: "تسجيل دفعة",
    invoiceNumber: "رقم الفاتورة", totalAmount: "المبلغ الإجمالي",
    paidAmount: "المبلغ المدفوع", outstanding: "المستحق", dueDate: "تاريخ الاستحقاق",
    paymentMethod: "طريقة الدفع", feeStructures: "هيكل الرسوم",
    scholarships: "المنح الدراسية", discounts: "الخصومات", transactions: "المعاملات",
    totalRevenue: "إجمالي الإيرادات", thisMonth: "هذا الشهر", overdue: "المتأخرة",
  },
  attendance: {
    title: "الحضور", takeAttendance: "تسجيل الحضور", present: "حاضر",
    absent: "غائب", late: "متأخر", excused: "معذور", rate: "نسبة الحضور",
    todayTotal: "إجمالي اليوم", records: "سجلات الحضور",
  },
  academics: {
    title: "الأكاديمي", programs: "البرامج", courses: "الدورات", classes: "الفصول",
    departments: "الأقسام", instructors: "المعلمون", academicYears: "السنوات الأكاديمية",
    semesters: "الفصول الدراسية", newProgram: "برنامج جديد", newCourse: "دورة جديدة",
  },
  tasks: {
    title: "المهام", newTask: "مهمة جديدة", myTasks: "مهامي", allTasks: "جميع المهام",
    todo: "للقيام", inProgress: "قيد التنفيذ", review: "مراجعة", done: "مكتمل",
    priority: "الأولوية", dueDate: "تاريخ الاستحقاق", assignee: "المسؤول",
    low: "منخفض", medium: "متوسط", high: "عالي", urgent: "عاجل", critical: "حرج",
  },
  settings: {
    title: "الإعدادات", general: "عام", security: "الأمان", notifications: "الإشعارات",
    appearance: "المظهر", language: "اللغة", theme: "السمة", timezone: "المنطقة الزمنية",
    currency: "العملة", dateFormat: "تنسيق التاريخ", branding: "العلامة التجارية",
  },
  auth: {
    login: "تسجيل الدخول", register: "إنشاء حساب", forgotPassword: "نسيت كلمة المرور",
    resetPassword: "إعادة تعيين كلمة المرور", email: "البريد الإلكتروني", password: "كلمة المرور",
    rememberMe: "تذكرني", noAccount: "ليس لديك حساب؟",
    hasAccount: "لديك حساب بالفعل؟", signUp: "إنشاء حساب", signIn: "تسجيل الدخول",
    unauthorized: "غير مصرح", forbidden: "محظور",
  },
};

export const translations: Record<Locale, TranslationKeys> = { en, ar };

export function t(locale: Locale, section: keyof TranslationKeys, key: string): string {
  return translations[locale]?.[section]?.[key] ?? translations.en[section]?.[key] ?? key;
}
