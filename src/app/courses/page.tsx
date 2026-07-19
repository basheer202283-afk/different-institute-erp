"use client";

import { useState } from "react";
import { useCourses, useDeleteCourse } from "@/lib/hooks/use-courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Search, Filter, Loader2, ChevronLeft, ChevronRight,
  Eye, Edit, Trash2, BookOpen, AlertCircle, Clock, Users, GraduationCap
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Course, CourseFilters } from "@/lib/types/course";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary",
  published: "default",
  active: "success",
  completed: "default",
  cancelled: "destructive",
  archived: "secondary",
};

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  published: "منشور",
  active: "نشط",
  completed: "مكتمل",
  cancelled: "ملغي",
  archived: "مؤرشف",
};

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  elementary: "أساسي",
  intermediate: "متوسط",
  advanced: "متقدم",
  professional: "احترافي",
  expert: "خبير",
};

export default function CoursesPage() {
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    pageSize: 10,
    search: "",
    status: undefined,
    academic_level: undefined,
  });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useCourses(filters);
  const deleteCourse = useDeleteCourse();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (status: Course['status'] | undefined) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الدورة؟")) {
      await deleteCourse.mutateAsync(id);
    }
  };

  const courses = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الدورات</h1>
          <p className="text-muted-foreground">إدارة الدورات التدريبية</p>
        </div>
        <Button asChild>
          <Link href="/courses/new">
            <Plus className="ml-2 h-4 w-4" /> إضافة دورة
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
                placeholder="بحث بالاسم، الرمز، الوصف..."
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
                <span className="text-sm font-medium mr-2">الحالة:</span>
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
                    onClick={() => handleStatusFilter(value as Course['status'])}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>قائمة الدورات ({data?.count ?? 0})</span>
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
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">لا توجد دورات</h3>
              <p className="mt-1">ابدأ بإضافة أول دورة</p>
              <Button className="mt-4" asChild>
                <Link href="/courses/new">
                  <Plus className="ml-2 h-4 w-4" /> إضافة دورة
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدورة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الرمز</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">المستوى</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">السعر</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الساعات</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{course.name}</p>
                              {course.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {course.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-mono">{course.code}</td>
                        <td className="py-3 px-4">
                          <Badge variant={statusColors[course.status]}>
                            {statusLabels[course.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {levelLabels[course.academic_level] ?? course.academic_level}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          {formatCurrency(course.price, course.currency)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {course.duration_hours ? `${course.duration_hours} ساعة` : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/courses/${course.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/courses/${course.id}?edit=true`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(course.id)}
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
                    {data?.count ?? 0} دورة
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
