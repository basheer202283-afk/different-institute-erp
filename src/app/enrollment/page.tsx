"use client";

import { useState, useCallback } from "react";
import {
  useEnrollments,
  useDeleteEnrollment,
  useCancelEnrollment,
  useApproveEnrollment,
  useEnrollmentStats,
} from "@/lib/hooks/use-enrollments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus, Search, Filter, Loader2, ChevronLeft, ChevronRight,
  Eye, Edit, Trash2, ClipboardList, AlertCircle, CheckCircle2,
  XCircle, Clock, Users, CreditCard, TrendingUp, Hourglass,
  UserCheck, UserX, ArrowRightLeft, GraduationCap
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Enrollment, EnrollmentFilters, EnrollmentStatus } from "@/lib/types/enrollment";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  approved: "default",
  active: "success",
  completed: "default",
  cancelled: "destructive",
  rejected: "destructive",
  transferred: "secondary",
  deferred: "secondary",
  expelled: "destructive",
};

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  active: "نشط",
  completed: "مكتمل",
  cancelled: "ملغي",
  rejected: "مرفوض",
  transferred: "منقول",
  deferred: "مؤجل",
  expelled: "مفصول",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "غير مدفوع",
  partial: "مدفوع جزئياً",
  paid: "مدفوع",
  refunded: "مسترد",
  waived: "معفي",
};

const paymentStatusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "destructive",
  partial: "warning",
  paid: "success",
  refunded: "secondary",
  waived: "default",
};

export default function EnrollmentPage() {
  const [tab, setTab] = useState("list");
  const [filters, setFilters] = useState<EnrollmentFilters>({
    page: 1,
    pageSize: 10,
    search: "",
    status: undefined,
    payment_status: undefined,
  });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useEnrollments(filters);
  const { data: stats, isLoading: statsLoading } = useEnrollmentStats();
  const deleteEnrollment = useDeleteEnrollment();
  const cancelEnrollment = useCancelEnrollment();
  const approveEnrollment = useApproveEnrollment();

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleStatusFilter = useCallback((status: EnrollmentStatus | undefined) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const handleApprove = useCallback(
    async (id: string, action: "approve" | "reject") => {
      const msg =
        action === "approve"
          ? "هل أنت متأكد من الموافقة على هذا التسجيل؟"
          : "هل أنت متأكد من رفض هذا التسجيل؟";
      if (window.confirm(msg)) {
        await approveEnrollment.mutateAsync({ id, action });
      }
    },
    [approveEnrollment]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm("هل أنت متأكد من حذف هذا التسجيل؟")) {
        await deleteEnrollment.mutateAsync(id);
      }
    },
    [deleteEnrollment]
  );

  const enrollments = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">التسجيلات</h1>
          <p className="text-muted-foreground">إدارة تسجيلات الطالبات في الدورات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/enrollment/waiting-list">
              <Hourglass className="ml-2 h-4 w-4" /> قائمة الانتظار
            </Link>
          </Button>
          <Button asChild>
            <Link href="/enrollment/new">
              <Plus className="ml-2 h-4 w-4" /> تسجيل جديد
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? "—" : stats?.total ?? 0}</p>
                <p className="text-xs text-muted-foreground">إجمالي التسجيلات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? "—" : stats?.active ?? 0}</p>
                <p className="text-xs text-muted-foreground">نشط</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? "—" : stats?.pending ?? 0}</p>
                <p className="text-xs text-muted-foreground">قيد المراجعة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "—" : formatCurrency(stats?.totalRevenue ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">إجمالي الإيرادات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Hourglass className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? "—" : stats?.waiting ?? 0}</p>
                <p className="text-xs text-muted-foreground">قائمة الانتظار</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="list">قائمة التسجيلات</TabsTrigger>
          <TabsTrigger value="pending">بانتظار الموافقة ({stats?.pending ?? 0})</TabsTrigger>
          <TabsTrigger value="completed">مكتملة ({stats?.completed ?? 0})</TabsTrigger>
        </TabsList>

        {/* All Enrollments Tab */}
        <TabsContent value="list">
          <div className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث..."
                      className="pr-9"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleKeyPress}
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

                {showFilters && (
                  <div className="mt-4 pt-4 border-t space-y-3">
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
                          onClick={() => handleStatusFilter(value as EnrollmentStatus)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enrollments Table */}
            <EnrollmentsTable
              enrollments={enrollments}
              isLoading={isLoading}
              error={error}
              totalPages={totalPages}
              currentPage={currentPage}
              totalCount={data?.count ?? 0}
              pageSize={filters.pageSize ?? 10}
              onPageChange={handlePageChange}
              onApprove={handleApprove}
              onDelete={handleDelete}
            />
          </div>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending">
          <PendingEnrollmentsTab onApprove={handleApprove} />
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed">
          <CompletedEnrollmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function EnrollmentsTable({
  enrollments,
  isLoading,
  error,
  totalPages,
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  onApprove,
  onDelete,
}: {
  enrollments: Enrollment[];
  isLoading: boolean;
  error: unknown;
  totalPages: number;
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onApprove: (id: string, action: "approve" | "reject") => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 text-destructive">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>خطأ في تحميل البيانات</span>
        </CardContent>
      </Card>
    );
  }

  if (enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ClipboardList className="h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">لا توجد تسجيلات</h3>
          <p className="mt-1">ابدأ بتسجيل أول طالبة</p>
          <Button className="mt-4" asChild>
            <Link href="/enrollment/new">
              <Plus className="ml-2 h-4 w-4" /> تسجيل جديد
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة التسجيلات ({totalCount})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">رقم التسجيل</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الطالبة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدورة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدفع</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الرسوم</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التاريخ</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono">
                    {enrollment.id.substring(0, 8)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {enrollment.student_id.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm">{enrollment.student_id.substring(0, 8)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {enrollment.course_id.substring(0, 8)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusColors[enrollment.status]}>
                      {statusLabels[enrollment.status] ?? enrollment.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={paymentStatusColors[enrollment.payment_status]}>
                      {paymentStatusLabels[enrollment.payment_status] ?? enrollment.payment_status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">
                    {formatCurrency(enrollment.total_fees)}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDate(enrollment.enrollment_date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/enrollment/${enrollment.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {enrollment.approval_status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            onClick={() => onApprove(enrollment.id, "approve")}
                            title="موافقة"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => onApprove(enrollment.id, "reject")}
                            title="رفض"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDelete(enrollment.id)}
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
              عرض {(currentPage - 1) * pageSize + 1} إلى{" "}
              {Math.min(currentPage * pageSize, totalCount)} من {totalCount} تسجيل
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
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
                onClick={() => onPageChange(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PendingEnrollmentsTab({
  onApprove,
}: {
  onApprove: (id: string, action: "approve" | "reject") => void;
}) {
  const { data, isLoading, error } = useEnrollments({ status: "pending", pageSize: 50 });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const pending = data?.data ?? [];

  if (pending.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mb-4 text-green-500 opacity-50" />
          <h3 className="text-lg font-semibold">لا توجد تسجيلات بانتظار الموافقة</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((enrollment) => (
        <Card key={enrollment.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">تسجيل #{enrollment.id.substring(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    الطالبة: {enrollment.student_id.substring(0, 8)} • الدورة: {enrollment.course_id.substring(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(enrollment.enrollment_date)} • الرسوم: {formatCurrency(enrollment.total_fees)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => onApprove(enrollment.id, "approve")}
                >
                  <CheckCircle2 className="ml-2 h-4 w-4" /> موافقة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => onApprove(enrollment.id, "reject")}
                >
                  <XCircle className="ml-2 h-4 w-4" /> رفض
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/enrollment/${enrollment.id}`}>
                    <Eye className="ml-2 h-4 w-4" /> تفاصيل
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CompletedEnrollmentsTab() {
  const { data, isLoading } = useEnrollments({ status: "completed", pageSize: 50 });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const completed = data?.data ?? [];

  if (completed.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">لا توجد تسجيلات مكتملة</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التسجيل</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الطالبة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدورة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدرجة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">تاريخ الإتمام</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((enrollment) => (
                <tr key={enrollment.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono">{enrollment.id.substring(0, 8)}</td>
                  <td className="py-3 px-4 text-sm">{enrollment.student_id.substring(0, 8)}</td>
                  <td className="py-3 px-4 text-sm">{enrollment.course_id.substring(0, 8)}</td>
                  <td className="py-3 px-4 text-sm font-medium">{enrollment.grade ?? "—"}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {enrollment.completion_date ? formatDate(enrollment.completion_date) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}


