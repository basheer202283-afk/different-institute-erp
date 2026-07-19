"use client";

import { useState } from "react";
import { useTrainers, useDeleteTrainer } from "@/lib/hooks/use-trainers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Search, Filter, Loader2, ChevronLeft, ChevronRight,
  Eye, Edit, Trash2, Users, GraduationCap, AlertCircle, Clock
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Trainer, TrainerFilters } from "@/lib/types/trainer";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  inactive: "secondary",
  suspended: "destructive",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  inactive: "غير نشط",
  suspended: "معلق",
};

export default function TrainersPage() {
  const [filters, setFilters] = useState<TrainerFilters>({
    page: 1,
    pageSize: 10,
    search: "",
    status: undefined,
  });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useTrainers(filters);
  const deleteTrainer = useDeleteTrainer();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (status: Trainer['status'] | undefined) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المدرب؟")) {
      await deleteTrainer.mutateAsync(id);
    }
  };

  const trainers = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المدربات</h1>
          <p className="text-muted-foreground">إدارة بيانات المدربات والمعلمين</p>
        </div>
        <Button asChild>
          <Link href="/trainers/new">
            <Plus className="ml-2 h-4 w-4" /> إضافة مدرب
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم، الهاتف، التخصص..."
                className="pr-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSearch}>
                <Search className="ml-2 h-4 w-4" /> بحث
              </Button>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="ml-2 h-4 w-4" /> فلتر
              </Button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.status === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(undefined)}
                >
                  الكل
                </Button>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <Button
                    key={value}
                    variant={filters.status === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusFilter(value as Trainer['status'])}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>قائمة المدربات ({data?.count ?? 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>خطأ في تحميل البيانات</span>
            </div>
          ) : trainers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">لا توجد مدربات</h3>
              <p className="mt-1">ابدأ بإضافة أول مدرب</p>
              <Button className="mt-4" asChild>
                <Link href="/trainers/new">
                  <Plus className="ml-2 h-4 w-4" /> إضافة مدرب
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">المدرب</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">رقم الموظف</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التخصص</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الخبرة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الهاتف</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainers.map((trainer) => (
                      <tr key={trainer.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-medium text-purple-600">
                              {trainer.first_name?.charAt(0) ?? "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{trainer.first_name} {trainer.last_name}</p>
                              {trainer.email && (
                                <p className="text-xs text-muted-foreground">{trainer.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{trainer.employee_number ?? "—"}</td>
                        <td className="py-3 px-4">
                          <Badge variant={statusColors[trainer.status]}>
                            {statusLabels[trainer.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{trainer.specialization ?? "—"}</td>
                        <td className="py-3 px-4 text-sm">
                          {trainer.experience_years ? `${trainer.experience_years} سنوات` : "—"}
                        </td>
                        <td className="py-3 px-4 text-sm">{trainer.phone ?? "—"}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/trainers/${trainer.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/trainers/${trainer.id}?edit=true`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(trainer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    عرض {((currentPage - 1) * filters.pageSize!) + 1} إلى{" "}
                    {Math.min(currentPage * filters.pageSize!, data?.count ?? 0)} من{" "}
                    {data?.count ?? 0} مدرب
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
