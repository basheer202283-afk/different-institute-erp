"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTenant } from "@/lib/hooks/use-tenant";

// Public paths that render without the admin chrome (sidebar + header).
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    profile,
    role,
    isAuthenticated,
    signOut,
    can,
  } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showChrome = !isPublicPath(pathname);

  // Public pages: render as-is, no wrapper
  if (!showChrome) {
    return <>{children}</>;
  }

  // Always render the admin layout for non-public pages.
  // If not authenticated, pages will show their content with
  // empty data states (Supabase queries fail gracefully).
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        userRole={role}
        userName={profile?.display_name ?? undefined}
        can={can}
        onSignOut={isAuthenticated ? signOut : undefined}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:pr-72 transition-[padding] duration-300">
        {/* Top header with hamburger for mobile */}
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
