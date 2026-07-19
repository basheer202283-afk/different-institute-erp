"use client";

import { useState, useCallback } from "react";
import { useExams, useDeleteExam, useExamStats } from "@/lib/hooks/use-exams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus, Search, Filter, Loader2, ChevronLeft, ChevronRight,
  Eye, Trash2, FileCheck, AlertCircle, CheckCircle2, Clock,
  BarChart3, Users, Percent
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Exam, ExamFilters, ExamStatus, ExamType } from "@/lib/types/exam";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary", scheduled: "default", in_progress: "warning", completed: "success", cancelled: "destructive",
};
const statusLabels: Record<string, string> = {
  draft: "مسودة", scheduled: "مجدول", in_progress: "جاري", completed: "مكتمل", cancelled: "ملغي",
};
const typeLabels: Record<string, string> = {
  quiz: "اختبار قصير", midterm: "اختبار نصف فصلي", final: "اختبار نهائي",
  assignment: "واجب", practical: "عملي", oral: "شفهي",
};

export default function ExamsPage() {
  const [tab, setTab] = useState("list");
  const [filters, setFilters] = useState<ExamFilters>({ page: 1, pageSize: 10, search: "" });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useExams(filters);
  const { data: stats } = useExamStats();
  const deleteExam = useDeleteExam();

  const handleSearch = useCallback(() => setFilters(p => ({ ...p, search: searchInput, page: 1 })), [searchInput]);
  const handlePageChange = useCallback((p: number) => setFilters(prev => ({ ...prev, page: p })), []);
  const handleStatusFilter = useCallback((s: ExamStatus | undefined) => setFilters(prev => ({ ...prev, status: s, page: 1 })), []);
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الاختبار؟")) await deleteExam.mutateAsync(id);
  }, [deleteExam]);

  const exams = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الاختبارات</h1>
          <p className="text-muted-foreground">إدارة الاختبارات والامتحانات</p>
        </div>
        <Button asChild>
          <Link href="/exams/new"><Plus className="ml-2 h-4 w-4" /> اختبار جديد</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><FileCheck className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.total ?? 0}</p><p className="text-xs text-muted-foreground">إجمالي</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><Clock className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.scheduled ?? 0}</p><p className="text-xs text-muted-foreground">مجدول</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.completed ?? 0}</p><p className="text-xs text-muted-foreground">مكتمل</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.average_score ?? 0}%</p><p className="text-xs text-muted-foreground">المعدل</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><Percent className="h-5 w-5 text-indigo-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.pass_rate ?? 0}%</p><p className="text-xs text-muted-foreground">نسبة النجاح</p></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Search */}
      <Card><CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث بالعنوان..." className="pr-9" value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSearch}><Search className="ml-2 h-4 w-4" /> بحث</Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}><Filter className="ml-2 h-4 w-4" /> فلتر</Button>
          </div>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Button variant={filters.status === undefined ? "default" : "outline"} size="sm" onClick={() => handleStatusFilter(undefined)}>الكل</Button>
              {Object.entries(statusLabels).map(([v, l]) => (
                <Button key={v} variant={filters.status === v ? "default" : "outline"} size="sm" onClick={() => handleStatusFilter(v as ExamStatus)}>{l}</Button>
              ))}
            </div>
          </div>
        )}
      </CardContent></Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="list">كل الاختبارات</TabsTrigger>
          <TabsTrigger value="upcoming">القادمة</TabsTrigger>
          <TabsTrigger value="completed">المكتملة</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ExamTable exams={exams} isLoading={isLoading} totalPages={totalPages} currentPage={currentPage}
            totalCount={data?.count ?? 0} pageSize={filters.pageSize ?? 10}
            onPageChange={handlePageChange} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="upcoming"><ExamListByStatus status="scheduled" onDelete={handleDelete} /></TabsContent>
        <TabsContent value="completed"><ExamListByStatus status="completed" onDelete={handleDelete} /></TabsContent>
      </Tabs>
    </div>
  );
}

function ExamTable({ exams, isLoading, totalPages, currentPage, totalCount, pageSize, onPageChange, onDelete }: {
  exams: Exam[]; isLoading: boolean; totalPages: number; currentPage: number; totalCount: number; pageSize: number;
  onPageChange: (p: number) => void; onDelete: (id: string) => void;
}) {
  if (isLoading) return <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>;
  if (exams.length === 0) return <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
    <FileCheck className="h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-semibold">لا توجد اختبارات</h3>
    <Button className="mt-4" asChild><Link href="/exams/new"><Plus className="ml-2 h-4 w-4" /> اختبار جديد</Link></Button>
  </CardContent></Card>;

  return (
    <Card>
      <CardHeader><CardTitle>قائمة الاختبارات ({totalCount})</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b">
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الاختبار</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">النوع</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدرجة</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">المدة</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التاريخ</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
            </tr></thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div><p className="text-sm font-medium">{exam.title}</p><p className="text-xs text-muted-foreground">{exam.title_ar ?? ""}</p></div>
                  </td>
                  <td className="py-3 px-4"><Badge variant="secondary">{typeLabels[exam.exam_type] ?? exam.exam_type}</Badge></td>
                  <td className="py-3 px-4"><Badge variant={statusColors[exam.status]}>{statusLabels[exam.status]}</Badge></td>
                  <td className="py-3 px-4 text-sm">{exam.passing_marks}/{exam.total_marks}</td>
                  <td className="py-3 px-4 text-sm">{exam.duration_minutes} د</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{exam.exam_date ? formatDate(exam.exam_date) : "—"}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href={`/exams/${exam.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(exam.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">عرض {(currentPage - 1) * pageSize + 1} إلى {Math.min(currentPage * pageSize, totalCount)} من {totalCount}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExamListByStatus({ status, onDelete }: { status: ExamStatus; onDelete: (id: string) => void }) {
  const { data, isLoading } = useExams({ status, pageSize: 50 });
  if (isLoading) return <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>;
  const exams = data?.data ?? [];
  if (exams.length === 0) return <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
    <FileCheck className="h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-semibold">لا توجد اختبارات</h3></CardContent></Card>;
  return <ExamTable exams={exams} isLoading={false} totalPages={1} currentPage={1} totalCount={exams.length} pageSize={50} onPageChange={() => {}} onDelete={onDelete} />;
}
