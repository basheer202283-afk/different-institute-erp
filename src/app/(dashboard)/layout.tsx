"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTenant } from "@/lib/hooks/use-tenant";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, role, isLoading: authLoading, isAuthenticated, signOut, can } = useAuth();
  const { isLoading: tenantLoading } = useTenant();

  // Show loading while checking auth
  if (authLoading || tenantLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, show loading (middleware will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Sidebar
        userRole={role}
        userName={profile?.display_name ?? undefined}
        can={can}
        onSignOut={signOut}
      />
      <div className="lg:pr-72">
        <Header />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
