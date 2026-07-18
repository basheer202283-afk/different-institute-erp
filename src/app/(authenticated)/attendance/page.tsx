"use client";

import { useState } from "react";
import { useAttendanceRecords, useAttendanceStats, useMarkAttendance } from "@/lib/hooks/use-attendance";
import { useClasses } from "@/lib/hooks/use-academics";
import { useStudents } from "@/lib/hooks/use-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CalendarCheck, Users, TrendingUp, AlertCircle, Loader2, Save, Check, X, Clock, QrCode } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const statusOptions = [
  { value: "present", label: "Present", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  { value: "absent", label: "Absent", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  { value: "late", label: "Late", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "excused", label: "Excused", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
];

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [taking, setTaking] = useState(false);

  const { data: stats, isLoading: loadingStats } = useAttendanceStats();
  const { data: recordsRaw } = useAttendanceRecords({ class_id: selectedClass || undefined, date: selectedDate });
  const recordsData = (recordsRaw ?? []) as Array<{ id: string; student_id: string | null; class_id: string | null; status: string; check_in_time: string | null; attendance_date: string }>;
  const { data: classesRaw } = useClasses();
  const { data: studentsData } = useStudents({ pageSize: 200 });
  const markAttendance = useMarkAttendance();
  const classes = (classesRaw ?? []) as Array<{ id: string; name: string; code: string }>;
  const students = (studentsData?.data ?? []) as Array<{ id: string; student_number: string; [key: string]: unknown }>;

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    if (!selectedClass) { toast.error("Please select a class"); return; }
    const entries = Object.entries(records).filter(([, status]) => status);
    if (entries.length === 0) { toast.error("No attendance records to save"); return; }
    markAttendance.mutate(
      entries.map(([studentId, status]) => ({
        student_id: studentId,
        class_id: selectedClass,
        attendance_date: selectedDate,
        status,
      })),
      { onSuccess: () => { setRecords({}); setTaking(false); } }
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Attendance</h1><p className="text-muted-foreground">Track and manage student attendance</p></div>
        <div className="flex gap-2">
          {taking ? (
            <><Button variant="outline" onClick={() => setTaking(false)}><X className="mr-2 h-4 w-4" /> Cancel</Button><Button onClick={handleSave} disabled={markAttendance.isPending}>{markAttendance.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Attendance</Button></>
          ) : (
            <Button onClick={() => setTaking(true)}><CalendarCheck className="mr-2 h-4 w-4" /> Take Attendance</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Today's Total", value: stats?.total ?? 0, icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "Present", value: stats?.present ?? 0, icon: Check, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
          { label: "Absent", value: stats?.absent ?? 0, icon: AlertCircle, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
          { label: "Late", value: stats?.late ?? 0, icon: Clock, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3"><div className={`rounded-lg p-2 ${s.color}`}><s.icon className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></CardContent></Card>
        ))}
      </div>

      {taking && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Take Attendance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Class *</label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="">Select a class</option>
                  {(classes).map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1" />
              </div>
            </div>

            {selectedClass && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Students ({students.length})</p>
                  <div className="flex gap-2">
                    {statusOptions.map((s) => (
                      <Button key={s.value} variant="outline" size="sm" onClick={() => { const newRecords: Record<string, string> = {}; students.forEach((st) => { newRecords[st.id] = s.value; }); setRecords(newRecords); }}>
                        Mark All {s.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border divide-y max-h-[400px] overflow-y-auto">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{student.student_number?.slice(0, 2)}</div>
                        <div><p className="text-sm font-medium">{student.student_number}</p></div>
                      </div>
                      <div className="flex gap-1">
                        {statusOptions.map((s) => (
                          <button key={s.value} onClick={() => handleStatusChange(student.id, s.value)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${records[student.id] === s.value ? s.color : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Attendance Records</CardTitle>
          <div className="flex gap-2">
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All Classes</option>
              {(classes).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-auto" />
          </div>
        </CardHeader>
        <CardContent>
          {recordsData && recordsData.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead><tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Student</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Class</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Check In</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                </tr></thead>
                <tbody>
                  {recordsData.map((rec) => (
                    <tr key={rec.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-mono">{rec.student_id?.slice(0, 8)}</td>
                      <td className="py-3 px-4 text-sm font-mono">{rec.class_id?.slice(0, 8)}</td>
                      <td className="py-3 px-4"><Badge variant={rec.status === "present" ? "success" : rec.status === "late" ? "warning" : rec.status === "absent" ? "destructive" : "default"}>{rec.status}</Badge></td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{rec.check_in_time || "—"}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(rec.attendance_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12"><CalendarCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-semibold">No attendance records</h3><p className="text-muted-foreground mt-1">Select a class and date, or take new attendance</p></div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
