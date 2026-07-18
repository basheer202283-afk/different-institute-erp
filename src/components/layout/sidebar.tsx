"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, BookOpen, CreditCard, CalendarCheck,
  Award, BarChart3, Library, Contact, Megaphone, CheckSquare,
  FileText, CalendarDays, Bell, Settings, UserCog,
  Shield, ChevronRight, GraduationCap, Menu, X, LogOut,
  Search, Activity, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
  roles?: string[];
}

const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Students", href: "/students", icon: Users },
  {
    title: "Academics", icon: BookOpen, children: [
      { title: "Programs", href: "/academics" },
      { title: "Courses", href: "/academics" },
      { title: "Classes", href: "/academics" },
      { title: "Departments", href: "/academics" },
      { title: "Instructors", href: "/academics" },
    ],
  },
  {
    title: "Finance", icon: CreditCard, roles: ["tenant_admin", "manager", "accountant"],
  },
  { title: "Attendance", href: "/attendance", icon: CalendarCheck },
  { title: "Enrollment", href: "/enrollment", icon: GraduationCap },
  { title: "Guardians", href: "/guardians", icon: Contact },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Announcements", href: "/announcements", icon: Megaphone },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Certificates", href: "/certificates", icon: Award },
];

const adminNav: NavItem[] = [
  { title: "Settings", href: "/admin/settings", icon: Settings },
  { title: "Audit Log", href: "/admin/audit", icon: Activity },
  { title: "System Health", href: "/admin/health", icon: Database },
  { title: "Users", href: "/admin/users", icon: UserCog },
  { title: "Roles", href: "/admin/roles", icon: Shield },
];

function NavItemComponent({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
  const hasActiveChild = item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent",
            hasActiveChild ? "text-primary bg-primary/5" : "text-muted-foreground"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.title}</span>
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="ml-4 border-l pl-2 space-y-0.5 py-1">
                {item.children.map((child) => (
                  <Link key={child.href + child.title} href={child.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent", pathname === child.href ? "text-primary font-medium bg-primary/5" : "text-muted-foreground")}>
                    {child.title}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link href={item.href!} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
      <item.icon className="h-4 w-4 shrink-0" />
      <span>{item.title}</span>
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const { hasAnyRole, signOut } = useAuthContext();

  const filteredMainNav = mainNav.filter((item) => {
    if (!item.roles) return true;
    return hasAnyRole(item.roles);
  });

  return (
    <>
      <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setCollapsed(true)} style={{ display: collapsed ? "none" : "block" }} />

      <aside className={cn("fixed left-0 top-0 z-50 h-full w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 lg:translate-x-0", collapsed ? "-translate-x-full" : "translate-x-0")}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">Different ERP</span>
              <span className="text-[10px] text-muted-foreground">Enterprise v4.0</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setCollapsed(true)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-3">
            <Link href="/dashboard" className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
              <Search className="h-4 w-4" />
              <span>Quick search...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌘K</kbd>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Main Menu</p>
            {filteredMainNav.map((item) => (
              <NavItemComponent key={item.title} item={item} />
            ))}

            <p className="px-3 py-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Administration</p>
            {adminNav.map((item) => (
              <NavItemComponent key={item.title} item={item} />
            ))}
          </nav>

          <div className="border-t p-3">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      <Button variant="outline" size="icon" className="fixed top-4 left-4 z-30 lg:hidden" onClick={() => setCollapsed(false)}>
        <Menu className="h-4 w-4" />
      </Button>
    </>
  );
}
