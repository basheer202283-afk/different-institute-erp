"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { Moon, Sun, Bell, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  user?: {
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  onSignOut?: () => void;
}

export function Header({ user, onSignOut }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "مستخدم";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
          <span>مرحباً،</span>
          <span className="font-medium text-foreground">{displayName}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        {mounted && (
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={displayName} className="h-full w-full rounded-full object-cover" />
            ) : (
              getInitials(displayName)
            )}
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-[10px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Sign Out */}
        {onSignOut && (
          <Button variant="ghost" size="icon" onClick={onSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
