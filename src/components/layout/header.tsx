"use client";

import { useState } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { GlobalSearch } from "@/components/search/global-search";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import {
  Bell, Moon, Sun, Search, ChevronDown,
  User, Settings, LogOut, HelpCircle
} from "lucide-react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function Header() {
  const { user, profile, signOut, hasRole } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications] = useState(3);

  useEffect(() => setMounted(true), []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const displayName = profile?.display_name || profile?.first_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Welcome back,</span>
            <span className="font-medium text-foreground">{displayName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setShowSearch(true)}>
            <Search className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 text-muted-foreground" onClick={() => setShowSearch(true)}>
            <Search className="h-3 w-3" />
            <span className="text-xs">Search...</span>
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">⌘K</kbd>
          </Button>

          {mounted && (
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          )}

          <LanguageSwitcher />

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/notifications">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="hidden md:flex">
            <HelpCircle className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  getInitials(displayName)
                )}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{profile?.status || "Active"}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border bg-card shadow-lg">
                    <div className="p-3 border-b">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors" onClick={() => setShowUserMenu(false)}>
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link href="/admin/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors" onClick={() => setShowUserMenu(false)}>
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      {hasRole("super_admin") && (
                        <Link href="/admin/audit" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors" onClick={() => setShowUserMenu(false)}>
                          <Settings className="h-4 w-4" /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t p-1">
                      <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors" onClick={() => { setShowUserMenu(false); signOut(); }}>
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <GlobalSearch open={showSearch} onOpenChange={setShowSearch} />
    </>
  );
}
