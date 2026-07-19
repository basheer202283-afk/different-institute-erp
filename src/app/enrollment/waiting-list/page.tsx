"use client";

import { useState, useCallback } from "react";
import {
  useWaitingList,
  useAddToWaitingList,
  useUpdateWaitingListStatus,
  useRemoveFromWaitingList,
} from "@/lib/hooks/use-enrollments";
import { useStudents } from "@/lib/hooks/use-students";
import { useCourses } from "@/lib/hooks/use-courses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowRight, Plus, Loader2, Search, Clock, CheckCircle2,
  XCircle, Trash2, AlertCircle, Send, UserPlus, Hourglass, Users, ListOrdered
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { WaitingListEntry, WaitingListStatus } from "@/lib/types/enrollment";

const waitingStatusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  waiting: "warning",
  offered: "default",
  accepted: "success",
  declined: "destructive",
  expired: "secondary",
};

const waitingStatusLabels: Record<string, string> = {
  waiting: "منتظر",
  offered: "تم تقديم العرض",
  accepted: "مقبول",
  declined: "مرفوض",
  expired: "منتهي الصلاحية",
};

export default function WaitingListPage() {
  const [tab, setTab] = useState("list");
  const [showAdd, setShowAdd] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [priority, setPriority] = useState(5);
  const [notes, setNotes] = useState("");

  const { data, isLoading, error } = useWaitingList({ search: searchInput });
  const addToWaitingList = useAddToWaitingList();
  const updateStatus = useUpdateWaitingListStatus();
  const removeFromList = useRemoveFromWaitingList();
  const { data: studentsData } = useStudents({ search: studentSearch, pageSize: 20 });
  const { data: coursesData } = useCourses({ search: courseSearch, pageSize: 20, status: "active" });

  const waitingEntries = data?.data ?? [];
  const waitingOnly = waitingEntries.filter((e) => e.status === "waiting");
  const offeredOnly = waitingEntries.filter((e) => e.status === "offered");

  const handleAdd = useCallback(async () => {
    if (!selectedStudent || !selectedCourse) return;
    try {
      await addToWaitingList.mutateAsync({
        student_id: selectedStudent,
        course_id: selectedCourse,
        priority,
        notes: notes || undefined,
      });
      setShowAdd(false);
      setSelectedStudent("");
      setSelectedCourse("");
      setPriority(5);
      setNotes("");
      setStudentSearch("");
      setCourseSearch("");
    } catch {
      // Error handled by mutation
    }
  }, [selectedStudent, selectedCourse, priority, notes, addToWaitingList]);

  const handleOffer = useCallback(
    async (id: string) => {
      if (window.confirm("هل تريد تقديم عرض لهذه الطالبة؟")) {
        await updateStatus.mutateAsync({ id, status: "offered" });
      }
    },
    [updateStatus]
  );

  const handleDecline = useCallback(
    async (id: string) => {
      await updateStatus.mutateAsync({ id, status: "declined", reason: "رفض من الإدارة" });
    },
    [updateStatus]
  );

  const handleRemove = useCallback(
    async (id: string) => {
      if (window.confirm("هل أنت متأكد من الإزالة من قائمة الانتظار؟")) {
        await removeFromList.mutateAsync(id);
      }
    },
    [removeFromList]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/enrollment">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">قائمة الانتظار</h1>
            <p className="text-muted-foreground">إدارة طلبات الانتظار للدورات الممتلئة</p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="ml-2 h-4 w-4" /> إضافة إلى القائمة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Hourglass className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{waitingOnly.length}</p>
                <p className="text-xs text-muted-foreground">في الانتظار</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{offeredOnly.length}</p>
                <p className="text-xs text-muted-foreground">تم تقديم العرض</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {waitingEntries.filter((e) => e.status === "accepted").length}
                </p>
                <p className="text-xs text-muted-foreground">مقبول</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                <ListOrdered className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{waitingEntries.length}</p>
                <p className="text-xs text-muted-foreground">الإجمالي</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAdd && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              إضافة إلى قائمة الانتظار
            </CardTitle>
            <CardDescription>أضف طالبة إلى قائمة انتظار دورة ممتلئة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">الطالبة</label>
                <Input
                  placeholder="بحث عن الطالبة..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                {selectedStudent && (
                  <p className="text-xs text-green-600 mt-1">✓ تم الاختيار</p>
                )}
                {studentsData && !selectedStudent && studentsData.data.length > 0 && (
                  <div className="max-h-32 overflow-y-auto mt-1 space-y-1 border rounded-lg">
                    {studentsData.data.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full p-2 text-right text-sm hover:bg-accent"
                        onClick={() => {
                          setSelectedStudent(s.id);
                          setStudentSearch(`${s.first_name_ar} ${s.last_name_ar}`);
                        }}
                      >
                        {s.first_name_ar} {s.last_name_ar} ({s.student_number})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الدورة</label>
                <Input
                  placeholder="بحث عن الدورة..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                />
                {selectedCourse && (
                  <p className="text-xs text-green-600 mt-1">✓ تم الاختيار</p>
                )}
                {coursesData && !selectedCourse && coursesData.data.length > 0 && (
                  <div className="max-h-32 overflow-y-auto mt-1 space-y-1 border rounded-lg">
                    {coursesData.data.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full p-2 text-right text-sm hover:bg-accent"
                        onClick={() => {
                          setSelectedCourse(c.id);
                          setCourseSearch(c.name);
                        }}
                      >
                        {c.name} ({c.code})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">الأولوية (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">ملاحظات</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات..."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                disabled={!selectedStudent || !selectedCourse || addToWaitingList.isPending}
              >
                {addToWaitingList.isPending ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="ml-2 h-4 w-4" />
                )}
                إضافة
              </Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="list">الكل ({waitingEntries.length})</TabsTrigger>
          <TabsTrigger value="waiting">منتظرة ({waitingOnly.length})</TabsTrigger>
          <TabsTrigger value="offered">عروض ({offeredOnly.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <WaitingListTable
            entries={waitingEntries}
            isLoading={isLoading}
            error={error}
            onOffer={handleOffer}
            onDecline={handleDecline}
            onRemove={handleRemove}
          />
        </TabsContent>

        <TabsContent value="waiting">
          <WaitingListTable
            entries={waitingOnly}
            isLoading={isLoading}
            error={error}
            onOffer={handleOffer}
            onDecline={handleDecline}
            onRemove={handleRemove}
          />
        </TabsContent>

        <TabsContent value="offered">
          <WaitingListTable
            entries={offeredOnly}
            isLoading={isLoading}
            error={error}
            onOffer={handleOffer}
            onDecline={handleDecline}
            onRemove={handleRemove}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WaitingListTable({
  entries,
  isLoading,
  error,
  onOffer,
  onDecline,
  onRemove,
}: {
  entries: WaitingListEntry[];
  isLoading: boolean;
  error: unknown;
  onOffer: (id: string) => void;
  onDecline: (id: string) => void;
  onRemove: (id: string) => void;
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

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Hourglass className="h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">قائمة الانتظار فارغة</h3>
          <p className="mt-1">لا توجد طلبات انتظار حالياً</p>
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
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الترتيب</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الطالبة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدورة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الأولوية</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التاريخ</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-sm font-bold text-yellow-700 dark:text-yellow-400">
                      {entry.position}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {entry.student_id.substring(0, 8)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {entry.course_id.substring(0, 8)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={waitingStatusColors[entry.status]}>
                      {waitingStatusLabels[entry.status] ?? entry.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm">{entry.priority}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDate(entry.requested_date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {entry.status === "waiting" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => onOffer(entry.id)}
                            title="تقديم عرض"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => onRemove(entry.id)}
                            title="إزالة"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {entry.status === "offered" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDecline(entry.id)}
                          title="رفض"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
