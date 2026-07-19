"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PERMISSIONS, ROLE_LABELS, type PermissionSlug } from "@/lib/permissions";
import type { AppRole } from "@/lib/types/database";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard,
  CalendarCheck, Settings, Shield, Menu, X, LogOut, Bell, BarChart3,
  Award, FileText, ClipboardList, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  titleEn: string;
  href: string;
  icon: React.ElementType;
  permission?: PermissionSlug;
}

const mainNav: NavItem[] = [
  { title: "لوحة التحكم", titleEn: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
  { title: "الطالبات", titleEn: "Students", href: "/students", icon: Users, permission: PERMISSIONS.STUDENTS_VIEW },
  { title: "التسجيلات", titleEn: "Enrollment", href: "/enrollment", icon: ClipboardList, permission: PERMISSIONS.ENROLLMENT_VIEW },
  { title: "المدربات", titleEn: "Trainers", href: "/trainers", icon: GraduationCap, permission: PERMISSIONS.TRAINERS_VIEW },
  { title: "الدورات", titleEn: "Courses", href: "/courses", icon: BookOpen, permission: PERMISSIONS.COURSES_VIEW },
  { title: "الحضور", titleEn: "Attendance", href: "/attendance", icon: CalendarCheck, permission: PERMISSIONS.ATTENDANCE_VIEW },
  { title: "المالية", titleEn: "Finance", href: "/finance", icon: CreditCard, permission: PERMISSIONS.FINANCE_VIEW },
  { title: "الشهادات", titleEn: "Certificates", href: "/certificates", icon: Award, permission: PERMISSIONS.CERTIFICATES_VIEW },
  { title: "التقارير", titleEn: "Reports", href: "/reports", icon: BarChart3, permission: PERMISSIONS.REPORTS_VIEW },
];

const adminNav: NavItem[] = [
  { title: "الإشعارات", titleEn: "Notifications", href: "/notifications", icon: MessageSquare, permission: PERMISSIONS.NOTIFICATIONS_VIEW },
  { title: "المستخدمين", titleEn: "Users", href: "/admin", icon: Shield, permission: PERMISSIONS.USERS_VIEW },
  { title: "الإعدادات", titleEn: "Settings", href: "/settings", icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
];

interface SidebarProps {
  userRole: AppRole | null;
  userName?: string;
  can: (permission: PermissionSlug) => boolean;
  onSignOut?: () => void;
}

export function Sidebar({ userRole, userName, can, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  const filteredMainNav = mainNav.filter((item) => {
    if (!item.permission) return true;
    return can(item.permission);
  });

  const filteredAdminNav = adminNav.filter((item) => {
    if (!item.permission) return true;
    return can(item.permission);
  });

  const roleLabel = userRole ? ROLE_LABELS[userRole] : null;

  return (
    <>
      {!collapsed && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setCollapsed(true)} />
      )}

      <aside className={cn(
        "fixed right-0 top-0 z-50 h-full w-72 border-l bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-transform duration-300 flex flex-col",
        collapsed ? "translate-x-full lg:translate-x-0" : "translate-x-0"
      )}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">معهد المختلفة</h1>
              <p className="text-[10px] text-muted-foreground">لتدريب النسائي</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setCollapsed(true)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">القائمة الرئيسية</p>
          {filteredMainNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setCollapsed(true)}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.title}</span>
                <span className="text-[10px] opacity-60">{item.titleEn}</span>
              </Link>
            );
          })}

          {filteredAdminNav.length > 0 && (
            <>
              <p className="px-3 py-2 mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">الإدارة</p>
              {filteredAdminNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setCollapsed(true)}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    <span className="text-[10px] opacity-60">{item.titleEn}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {userName?.charAt(0) || "م"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName || "مستخدم"}</p>
              <p className="text-[10px] text-muted-foreground">{roleLabel?.ar || ""}</p>
            </div>
          </div>
          {onSignOut && (
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={onSignOut}>
              <LogOut className="h-4 w-4" />
              <span className="text-sm">تسجيل الخروج</span>
            </Button>
          )}
        </div>
      </aside>

      <Button variant="outline" size="icon" className="fixed top-4 right-4 z-30 lg:hidden shadow-md" onClick={() => setCollapsed(false)}>
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}
