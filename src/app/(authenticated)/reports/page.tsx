"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, Users, BookOpen, CalendarCheck, GraduationCap, Download, FileText, TrendingUp } from "lucide-react";

const reports = [
  { title: "Student Report", desc: "Complete student listing with status and enrollment details", icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  { title: "Enrollment Report", desc: "Enrollment statistics by course, program, and time period", icon: GraduationCap, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
  { title: "Attendance Report", desc: "Attendance rates, trends, and individual student records", icon: CalendarCheck, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
  { title: "Course Report", desc: "Course capacity, enrollment, and completion statistics", icon: BookOpen, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
  { title: "Teacher Report", desc: "Instructor workload, assignments, and schedule overview", icon: Users, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
  { title: "Academic Report", desc: "Academic performance, grades, and progression analysis", icon: TrendingUp, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400" },
];

export default function ReportsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Reports</h1><p className="text-muted-foreground">Generate and export academic reports</p></div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${report.color}`}><report.icon className="h-5 w-5" /></div>
                <div><CardTitle className="text-lg">{report.title}</CardTitle></div>
              </div>
              <CardDescription>{report.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1"><FileText className="mr-2 h-4 w-4" /> Preview</Button>
                <Button size="sm" className="flex-1"><Download className="mr-2 h-4 w-4" /> Export</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
