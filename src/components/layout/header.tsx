"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { TenantSwitcher } from "./tenant-switcher";
import { Moon, Sun, Bell, Search, Menu } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  /** Callback when the mobile hamburger menu is clicked */
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Left side: hamburger (mobile) + tenant switcher + page title */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger – always visible on < lg */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={onMenuClick}
          aria-label="فتح القائمة"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <TenantSwitcher />

        {title && (
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right side: search, notifications, theme toggle */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="بحث">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="الإشعارات">
          <Bell className="h-4 w-4" />
        </Button>
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="تبديل السمة"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        )}
      </div>
    </header>
  );
}
