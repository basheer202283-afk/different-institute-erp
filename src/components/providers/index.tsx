"use client";

import { ThemeProvider } from "next-themes";
import { QueryProvider } from "./query-provider";
import { TenantProvider } from "@/lib/hooks/use-tenant";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <TenantProvider>
          {children}
          <Toaster richColors position="top-right" dir="rtl" />
        </TenantProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
