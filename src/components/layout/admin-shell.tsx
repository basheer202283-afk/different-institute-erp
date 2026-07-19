"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTenant } from "@/lib/hooks/use-tenant";
import { Loader2 } from "lucide-react";

// Paths that render without the admin chrome (sidebar + header).
// Everything else is considered an authenticated admin page.
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
  const router = useRouter();
  const {
    profile,
    role,
    isLoading: authLoading,
    isAuthenticated,
    signOut,
    can,
  } = useAuth();
  const { isLoading: tenantLoading } = useTenant();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showChrome = !isPublicPath(pathname);

  // Redirect unauthenticated users away from protected pages
  useEffect(() => {
    if (showChrome && !authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [showChrome, authLoading, isAuthenticated, router]);

  // Public pages: render as-is, no wrapper
  if (!showChrome) {
    return <>{children}</>;
  }

  // Loading state while checking auth
  if (authLoading || tenantLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated – render nothing while redirect fires
  if (!isAuthenticated) {
    return null;
  }

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
        onSignOut={signOut}
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
