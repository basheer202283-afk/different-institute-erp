"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Users, BookOpen, CreditCard, CalendarCheck, FileText, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  href: string;
}

const searchTables = [
  { table: "students", type: "Student", icon: Users, href: "/students", titleField: "student_number", subtitleField: "nationality" },
  { table: "courses", type: "Course", icon: BookOpen, href: "/academics", titleField: "name", subtitleField: "code" },
  { table: "invoices", type: "Invoice", icon: CreditCard, href: "/finance", titleField: "invoice_number", subtitleField: "status" },
  { table: "tasks", type: "Task", icon: CalendarCheck, href: "/tasks", titleField: "title", subtitleField: "status" },
  { table: "documents", type: "Document", icon: FileText, href: "/documents", titleField: "name", subtitleField: "type" },
];

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2 || !tenantId) {
      setResults([]);
      return;
    }

    setLoading(true);
    const allResults: SearchResult[] = [];

    for (const config of searchTables) {
      try {
        const { data } = await supabase
          .from(config.table)
          .select(`id, ${config.titleField}, ${config.subtitleField}`)
          .eq("tenant_id", tenantId)
          .is("deleted_at", null)
          .or(`${config.titleField}.ilike.%${q}%`)
          .limit(3);

        if (data) {
          for (const item of data) {
            const record = item as Record<string, unknown>;
            allResults.push({
              id: String(record.id),
              type: config.type,
              title: String(record[config.titleField] ?? ""),
              subtitle: String(record[config.subtitleField] ?? ""),
              icon: config.icon,
              href: `${config.href}/${record.id}`,
            });
          }
        }
      } catch {
        // Skip table on error
      }
    }

    setResults(allResults);
    setSelectedIndex(0);
    setLoading(false);
  }, [tenantId, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl" onKeyDown={handleKeyDown}>
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search students, courses, invoices, tasks..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${index === selectedIndex ? "bg-accent" : "hover:bg-muted"}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground">{result.type} • {result.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.length >= 2 && !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Type to search across all modules...</p>
              <p className="text-xs mt-1">Search students, courses, invoices, tasks, documents</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
