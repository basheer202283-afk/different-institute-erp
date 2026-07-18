"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Download, Plus, Loader2 } from "lucide-react";

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addLabel?: string;
  onExport?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  header?: React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  data, columns, isLoading, totalCount = 0, page = 0, pageSize = 20,
  onPageChange, search, onSearchChange, searchPlaceholder = "Search...",
  onAdd, addLabel = "Add New", onExport, emptyTitle = "No data found",
  emptyDescription = "Get started by adding a new record", emptyIcon, header,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      {(onSearchChange || onAdd || onExport || header) && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={searchPlaceholder} className="pl-9" value={search ?? ""} onChange={(e) => onSearchChange(e.target.value)} />
            </div>
          )}
          <div className="flex gap-2">
            {onExport && <Button variant="outline" size="sm" onClick={onExport}><Download className="mr-2 h-4 w-4" /> Export</Button>}
            {onAdd && <Button size="sm" onClick={onAdd}><Plus className="mr-2 h-4 w-4" /> {addLabel}</Button>}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : data.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.map((col) => (
                    <th key={col.key} className={`text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase ${col.className ?? ""}`}>{col.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className={`py-3 px-4 text-sm ${col.className ?? ""}`}>
                        {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {onPageChange && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm">{page + 1} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 border rounded-lg">
          {emptyIcon}
          <h3 className="text-lg font-semibold mt-4">{emptyTitle}</h3>
          <p className="text-muted-foreground mt-1">{emptyDescription}</p>
          {onAdd && <Button className="mt-4" onClick={onAdd}><Plus className="mr-2 h-4 w-4" /> {addLabel}</Button>}
        </div>
      )}
    </div>
  );
}
