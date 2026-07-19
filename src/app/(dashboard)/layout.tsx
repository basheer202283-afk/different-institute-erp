"use client";

// The enterprise admin layout (sidebar + header) is now provided by
// AdminShell in the root layout.  This file exists only so that the
// (dashboard) route-group folder is still valid; it passes children
// through unchanged.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
