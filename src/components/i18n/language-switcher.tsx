"use client";

import { useI18n } from "@/lib/i18n/context";
import { localeConfig, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.entries(localeConfig) as [Locale, typeof localeConfig.en][]).map(([code, config]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLocale(code)}
            className={locale === code ? "bg-accent" : ""}
          >
            <span className="mr-2">{config.flag}</span>
            {config.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
