"use client";

import { usePrograms, useCourses, useClasses, useDepartments, useInstructors, useAcademicYears, useSemesters } from "@/lib/hooks/use-academics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Layers, Users, Building2, Calendar, Plus, Loader2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AcademicsPage() {
  const router = useRouter();
  const { data: programsRaw, isLoading: loadingPrograms } = usePrograms();
  const { data: coursesRaw, isLoading: loadingCourses } = useCourses();
  const { data: classesRaw, isLoading: loadingClasses } = useClasses();
  const { data: departmentsRaw } = useDepartments();
  const { data: instructorsRaw } = useInstructors();
  const { data: academicYearsRaw } = useAcademicYears();
  const departments = (departmentsRaw ?? []) as Array<{ id: string; name: string; code: string; is_active: boolean }>;
  const instructors = (instructorsRaw ?? []) as Array<{ id: string; employee_number: string | null; specialization: string | null; experience_years: number; is_active: boolean }>;
  const academicYears = (academicYearsRaw ?? []) as Array<{ id: string; name: string; code: string; start_date: string; end_date: string; is_current: boolean; is_active: boolean }>;
  const programs = (programsRaw ?? []) as Array<{ id: string; name: string; code: string; academic_level: string; duration_months: number | null; is_active: boolean }>;
  const courses = (coursesRaw ?? []) as Array<{ id: string; name: string; code: string; credits: number; academic_level: string; status: string }>;
  const classes = (classesRaw ?? []) as Array<{ id: string; name: string; code: string; status: string; current_students: number | null; max_students: number | null }>;
  const [tab, setTab] = useState("programs");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Academics</h1><p className="text-muted-foreground">Manage programs, courses, classes, and academic structure</p></div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        {[
          { label: "Programs", value: programs.length, icon: GraduationCap, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "Courses", value: courses.length, icon: BookOpen, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
          { label: "Classes", value: classes.length, icon: Layers, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
          { label: "Departments", value: departments.length, icon: Building2, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
          { label: "Instructors", value: instructors.length, icon: Users, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
        ].map((s) => (
          <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTab(s.label.toLowerCase())}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
          <TabsTrigger value="years">Academic Years</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Programs</CardTitle>
              <Button size="sm" onClick={() => router.push("/academics/programs?new=true")}><Plus className="mr-2 h-4 w-4" /> Add Program</Button>
            </CardHeader>
            <CardContent>
              {loadingPrograms ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
                <div className="space-y-3">
                  {(programs).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                        <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.code} • {p.academic_level} • {p.duration_months ?? "—"} months</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={p.is_active ? "success" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/academics/programs/${p.id}`)}><Eye className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                {(!programs || programs.length === 0) && <div className="text-center py-8 text-muted-foreground"><GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No programs yet</p></div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Courses</CardTitle>
              <Button size="sm" onClick={() => router.push("/academics/courses?new=true")}><Plus className="mr-2 h-4 w-4" /> Add Course</Button>
            </CardHeader>
            <CardContent>
              {loadingCourses ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
                <div className="space-y-3">
                  {(courses).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
                        <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.code} • {c.credits} credits • {c.academic_level}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.status === "active" ? "success" : c.status === "draft" ? "secondary" : "default"}>{c.status}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/academics/courses/${c.id}`)}><Eye className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                {(!courses || courses.length === 0) && <div className="text-center py-8 text-muted-foreground"><BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No courses yet</p></div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Classes</CardTitle>
              <Button size="sm" onClick={() => router.push("/academics/classes?new=true")}><Plus className="mr-2 h-4 w-4" /> Add Class</Button>
            </CardHeader>
            <CardContent>
              {loadingClasses ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
                <div className="space-y-3">
                  {(classes).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Layers className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
                        <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.code} • {c.current_students ?? 0}/{c.max_students ?? "∞"} students</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.status === "active" ? "success" : c.status === "scheduled" ? "default" : "secondary"}>{c.status}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/academics/classes/${c.id}`)}><Eye className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                {(!classes || classes.length === 0) && <div className="text-center py-8 text-muted-foreground"><Layers className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No classes yet</p></div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Departments</CardTitle>
              <Button size="sm" onClick={() => router.push("/academics/departments?new=true")}><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(departments).map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" /></div>
                      <div><p className="font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.code}</p></div>
                    </div>
                    <Badge variant={d.is_active ? "success" : "secondary"}>{d.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                ))}
                {(!departments || departments.length === 0) && <div className="text-center py-8 text-muted-foreground"><Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No departments yet</p></div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructors" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Instructors</CardTitle>
              <Button size="sm" onClick={() => router.push("/academics/instructors?new=true")}><Plus className="mr-2 h-4 w-4" /> Add Instructor</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(instructors).map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><Users className="h-5 w-5 text-red-600 dark:text-red-400" /></div>
                      <div><p className="font-medium">{i.employee_number ?? i.specialization ?? "Instructor"}</p><p className="text-xs text-muted-foreground">{i.specialization} • {i.experience_years} years exp</p></div>
                    </div>
                    <Badge variant={i.is_active ? "success" : "secondary"}>{i.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                ))}
                {(!instructors || instructors.length === 0) && <div className="text-center py-8 text-muted-foreground"><Users className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No instructors yet</p></div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="years" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Academic Years</CardTitle>
              <Button size="sm" onClick={() => router.push("/academics?newYear=true")}><Plus className="mr-2 h-4 w-4" /> Add Year</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(academicYears).map((y) => (
                  <div key={y.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /></div>
                      <div><p className="font-medium">{y.name}</p><p className="text-xs text-muted-foreground">{y.code} • {y.start_date} to {y.end_date}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      {y.is_current && <Badge variant="default">Current</Badge>}
                      <Badge variant={y.is_active ? "success" : "secondary"}>{y.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>
                ))}
                {(!academicYears || academicYears.length === 0) && <div className="text-center py-8 text-muted-foreground"><Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No academic years yet</p></div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
