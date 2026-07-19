"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBulkCreateAttendance, useClasses, useStudents } from "@/lib/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Save, Loader2, Users, CalendarCheck, CheckCircle2, 
  XCircle, Clock, AlertCircle
} from "lucide-react";
import Link from "next/link";
import type { AttendanceFormData } from "@/lib/types/attendance";

const statusOptions = [
  { value: "present" as const, label: "حاضر", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  { value: "absent" as const, label: "غائب", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  { value: "late" as const, label: "متأخر", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "excused" as const, label: "معذور", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
];

type StudentRecord = { id: string; first_name_ar: string | null; last_name_ar: string | null; student_number: string | null };
type ClassRecord = { id: string; name: string; code: string; course_id: string | null };

export default function TakeAttendancePage() {
  const router = useRouter();
  const { data: classesData, isLoading: loadingClasses } = useClasses();
  const { data: studentsData, isLoading: loadingStudents } = useStudents();
  const bulkCreate = useBulkCreateAttendance();

  const classes = (classesData ?? []) as ClassRecord[];
  const students = (studentsData ?? []) as StudentRecord[];

  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<Record<string, { status: string; check_in_time: string; notes: string }>>({});

  // Initialize records when students load
  useEffect(() => {
    if (students && students.length > 0) {
      const initialRecords: typeof records = {};
      students.forEach((student) => {
        initialRecords[student.id] = {
          status: "present",
          check_in_time: "",
          notes: "",
        };
      });
      setRecords(initialRecords);
    }
  }, [students]);

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleCheckInChange = (studentId: string, time: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], check_in_time: time },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      alert("الرجاء اختيار الفصل");
      return;
    }

    const attendanceRecords: AttendanceFormData[] = Object.entries(records).map(
      ([studentId, data]) => ({
        student_id: studentId,
        class_id: selectedClass,
        attendance_date: attendanceDate,
        status: data.status as AttendanceFormData["status"],
        check_in_time: data.check_in_time || undefined,
        notes: data.notes || undefined,
      })
    );

    try {
      await bulkCreate.mutateAsync(attendanceRecords);
      router.push("/attendance");
    } catch (error) {
      // Error handled by hook
    }
  };

  const markAllAs = (status: string) => {
    const newRecords: typeof records = {};
    Object.keys(records).forEach((studentId) => {
      newRecords[studentId] = { ...records[studentId], status };
    });
    setRecords(newRecords);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">تسجيل الحضور</h1>
          <p className="text-muted-foreground">تسجيل حضور الطالبات للفصل</p>
        </div>
      </div>

      {/* Class and Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>اختيار الفصل والتاريخ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">الفصل *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="">اختر الفصل</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">التاريخ *</label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium mr-2">تحديد الكل:</span>
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                onClick={() => markAllAs(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>الطالبات ({Object.keys(records).length})</span>
            <Badge variant="outline">حاضر: {Object.values(records).filter((r) => r.status === "present").length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : Object.keys(records).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">لا توجد طالبات</h3>
              <p className="mt-1">لا توجد طالبات نشطات لتسجيل الحضور</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {student.first_name_ar?.charAt(0) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {student.first_name_ar} {student.last_name_ar}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.student_number}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(student.id, option.value)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          records[student.id]?.status === option.value
                            ? option.color
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="time"
                    className="w-32"
                    placeholder="وقت الدخول"
                    value={records[student.id]?.check_in_time ?? ""}
                    onChange={(e) => handleCheckInChange(student.id, e.target.value)}
                  />
                  <Input
                    className="w-48"
                    placeholder="ملاحظات"
                    value={records[student.id]?.notes ?? ""}
                    onChange={(e) => handleNotesChange(student.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" asChild>
          <Link href="/attendance">إلغاء</Link>
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={bulkCreate.isPending || !selectedClass || Object.keys(records).length === 0}
        >
          {bulkCreate.isPending ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" /> حفظ الحضور
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
