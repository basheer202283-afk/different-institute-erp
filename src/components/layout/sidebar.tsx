"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard,
  CalendarCheck, Settings, Shield, Menu, X, LogOut, ChevronRight,
  Bell, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const mainNav: NavItem[] = [
  { title: "Dashboard", titleAr: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  { title: "Students", titleAr: "الطالبات", href: "/students", icon: Users },
  { title: "Trainers", titleAr: "المدربات", href: "/trainers", icon: GraduationCap },
  { title: "Courses", titleAr: "الدورات", href: "/courses", icon: BookOpen },
  { title: "Finance", titleAr: "المالية", href: "/finance", icon: CreditCard, roles: ["owner", "admin", "accountant"] },
  { title: "Attendance", titleAr: "الحضور", href: "/attendance", icon: CalendarCheck },
  { title: "Reports", titleAr: "التقارير", href: "/reports", icon: BarChart3, roles: ["owner", "admin"] },
  { title: "Notifications", titleAr: "الإشعارات", href: "/notifications", icon: Bell },
];

const adminNav: NavItem[] = [
  { title: "Settings", titleAr: "الإعدادات", href: "/settings", icon: Settings },
  { title: "Users & Roles", titleAr: "المستخدمين", href: "/users", icon: Shield, roles: ["owner", "admin"] },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole = "trainer" }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  const canAccess = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole) || userRole === "owner";
  };

  const filteredMainNav = mainNav.filter(canAccess);
  const filteredAdminNav = adminNav.filter(canAccess);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setCollapsed(true)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed right-0 top-0 z-50 h-full w-64 border-l bg-background/95 backdrop-blur transition-transform duration-300 lg:translate-x-0",
        collapsed ? "translate-x-full" : "translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-sm font-bold">معهد المختلفة</h1>
                <p className="text-[10px] text-muted-foreground">نظام الإدارة</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setCollapsed(true)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              القائمة الرئيسية
            </p>
            {filteredMainNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setCollapsed(true)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.titleAr}</span>
                  <span className="text-xs opacity-60 mr-auto">{item.title}</span>
                </Link>
              );
            })}

            {filteredAdminNav.length > 0 && (
              <>
                <p className="px-3 py-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  الإدارة
                </p>
                {filteredAdminNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => setCollapsed(true)}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.titleAr}</span>
                      <span className="text-xs opacity-60 mr-auto">{item.title}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t p-3">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              <span className="text-sm">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-30 lg:hidden"
        onClick={() => setCollapsed(false)}
      >
        <Menu className="h-4 w-4" />
      </Button>
    </>
  );
}
