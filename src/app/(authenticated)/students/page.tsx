"use client";

import { useState } from "react";
import { useStudents, useStudentStats, useDeleteStudent } from "@/lib/hooks/use-students";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { formatDate, getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import { Users, GraduationCap, Clock, AlertCircle, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type StudentRow = { id: string; student_number: string; status: string; academic_level: string; guardian_name: string | null; admission_date: string | null; [key: string]: unknown };

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary" | "outline"> = {
  active: "success", enrolled: "default", pending: "warning", graduated: "secondary",
  dropped: "destructive", suspended: "destructive", on_leave: "warning", transferred: "secondary",
};

export default function StudentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const { data, isLoading } = useStudents({ search, status, page });
  const { data: stats } = useStudentStats();
  const deleteStudent = useDeleteStudent();
  const students = (data?.data ?? []) as StudentRow[];
  const count = data?.count ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage student records and enrollments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats?.total ?? 0, icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "Active", value: stats?.active ?? 0, icon: GraduationCap, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
          { label: "Pending", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" },
          { label: "On Leave", value: stats?.onLeave ?? 0, icon: AlertCircle, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            {["all", "active", "pending", "enrolled", "on_leave", "graduated"].map((s) => (
              <Button key={s} variant={status === s ? "default" : "outline"} size="sm" onClick={() => { setStatus(s); setPage(0); }}>
                {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <DataTable
            data={students}
            isLoading={isLoading}
            totalCount={count}
            page={page}
            onPageChange={setPage}
            search={search}
            onSearchChange={(s) => { setSearch(s); setPage(0); }}
            searchPlaceholder="Search by student number, guardian, nationality..."
            onAdd={() => router.push("/students/new")}
            addLabel="Add Student"
            emptyIcon={<Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />}
            emptyTitle="No students found"
            emptyDescription={search ? "Try adjusting your search" : "Get started by adding your first student"}
            columns={[
              {
                key: "student_number", title: "Student",
                render: (item) => {
                  const s = item as unknown as StudentRow;
                  return (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{getInitials(String(s.student_number))}</div>
                      <div>
                        <p className="font-medium">{String(s.student_number)}</p>
                        <p className="text-xs text-muted-foreground capitalize">{String(s.academic_level)}</p>
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "status", title: "Status",
                render: (item) => {
                  const s = item as unknown as StudentRow;
                  return <Badge variant={statusColors[s.status] ?? "secondary"}>{s.status?.replace("_", " ")}</Badge>;
                },
              },
              { key: "guardian_name", title: "Guardian", render: (item) => String((item as unknown as StudentRow).guardian_name ?? "—") },
              { key: "admission_date", title: "Enrolled", render: (item) => { const d = (item as unknown as StudentRow).admission_date; return d ? formatDate(d) : "—"; } },
              {
                key: "actions", title: "", className: "w-[50px]",
                render: (item) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/students/${item.id}`)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/students/${item.id}?edit=true`)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this student?")) deleteStudent.mutate(item.id); }}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
