"use client";

import { use, useState, useEffect } from "react";
import { useStudent, useStudentEnrollments, useUpdateStudent } from "@/lib/hooks/use-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Save, Loader2, Shield, BookOpen, FileText, User, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema, type StudentFormData } from "@/lib/validators";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  active: "success", enrolled: "default", pending: "warning", graduated: "secondary", dropped: "destructive", suspended: "destructive", on_leave: "warning",
};

function StudentDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";
  const { data: studentRaw, isLoading } = useStudent(id);
  const { data: enrollments } = useStudentEnrollments(id);
  const updateStudent = useUpdateStudent();
  const [editing, setEditing] = useState(isEditing);
  const s = (studentRaw ?? null) as Record<string, unknown> | null;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    if (s) {
      reset({
        student_number: String(s.student_number ?? ""),
        status: String(s.status ?? "pending") as StudentFormData["status"],
        academic_level: String(s.academic_level ?? "beginner") as StudentFormData["academic_level"],
        guardian_name: String(s.guardian_name ?? ""),
        guardian_phone: String(s.guardian_phone ?? ""),
        guardian_email: String(s.guardian_email ?? ""),
        guardian_relationship: String(s.guardian_relationship ?? ""),
        emergency_contact_name: String(s.emergency_contact_name ?? ""),
        emergency_contact_phone: String(s.emergency_contact_phone ?? ""),
        medical_conditions: String(s.medical_conditions ?? ""),
        allergies: String(s.allergies ?? ""),
        blood_group: String(s.blood_group ?? ""),
        nationality: String(s.nationality ?? ""),
        previous_school: String(s.previous_school ?? ""),
        notes: String(s.notes ?? ""),
        first_name: "", last_name: "", email: "", phone: "", date_of_birth: "", gender: undefined, admission_date: "",
      });
    }
  }, [s, reset]);

  const onSubmit = async (data: StudentFormData) => {
    updateStudent.mutate({ id, data }, { onSuccess: () => setEditing(false) });
  };

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!s) return <div className="text-center py-16"><h2 className="text-xl font-semibold">Student not found</h2><Button className="mt-4" asChild><Link href="/students">Back to Students</Link></Button></div>;

  const enrollmentsList = (enrollments ?? []) as Array<{ id: string; enrollment_date: string; status: string }>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/students"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Student: {String(s.student_number ?? "")}</h1>
          <p className="text-muted-foreground">View and manage student details</p>
        </div>
        {!editing && <Button onClick={() => setEditing(true)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">{getInitials(String(s.student_number ?? ""))}</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{String(s.student_number ?? "")}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusColors[String(s.status ?? "")] ?? "secondary"}>{String(s.status ?? "").replace("_", " ")}</Badge>
                <span className="text-sm text-muted-foreground capitalize">{String(s.academic_level ?? "")}</span>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {s.admission_date ? <p>Enrolled: {formatDate(String(s.admission_date))}</p> : null}
              <p>Created: {formatDate(String(s.created_at ?? ""))}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div><label className="text-sm font-medium">Student Number</label><Input {...register("student_number")} className={errors.student_number ? "border-destructive" : ""} />{errors.student_number && <p className="text-xs text-destructive mt-1">{errors.student_number.message}</p>}</div>
              <div><label className="text-sm font-medium">Status</label><select {...register("status")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="pending">Pending</option><option value="active">Active</option><option value="enrolled">Enrolled</option><option value="on_leave">On Leave</option><option value="graduated">Graduated</option><option value="dropped">Dropped</option></select></div>
              <div><label className="text-sm font-medium">Academic Level</label><select {...register("academic_level")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="beginner">Beginner</option><option value="elementary">Elementary</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="professional">Professional</option><option value="expert">Expert</option></select></div>
              <div><label className="text-sm font-medium">Nationality</label><Input {...register("nationality")} /></div>
              <div><label className="text-sm font-medium">Blood Group</label><Input {...register("blood_group")} /></div>
              <div><label className="text-sm font-medium">Previous School</label><Input {...register("previous_school")} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Guardian Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div><label className="text-sm font-medium">Guardian Name</label><Input {...register("guardian_name")} /></div>
              <div><label className="text-sm font-medium">Guardian Phone</label><Input {...register("guardian_phone")} /></div>
              <div><label className="text-sm font-medium">Guardian Email</label><Input {...register("guardian_email")} type="email" className={errors.guardian_email ? "border-destructive" : ""} />{errors.guardian_email && <p className="text-xs text-destructive mt-1">{errors.guardian_email.message}</p>}</div>
              <div><label className="text-sm font-medium">Relationship</label><Input {...register("guardian_relationship")} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Emergency & Medical</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium">Emergency Contact Name</label><Input {...register("emergency_contact_name")} /></div>
              <div><label className="text-sm font-medium">Emergency Contact Phone</label><Input {...register("emergency_contact_phone")} /></div>
              <div><label className="text-sm font-medium">Medical Conditions</label><textarea {...register("medical_conditions")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" /></div>
              <div><label className="text-sm font-medium">Allergies</label><textarea {...register("allergies")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" /></div>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent><textarea {...register("notes")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Additional notes..." /></CardContent></Card>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}</Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Student Number", value: String(s.student_number ?? "") },
                { label: "Nationality", value: String(s.nationality ?? "") },
                { label: "Blood Group", value: String(s.blood_group ?? "") },
                { label: "Previous School", value: String(s.previous_school ?? "") },
                { label: "Academic Level", value: String(s.academic_level ?? "") },
                { label: "Status", value: String(s.status ?? "").replace("_", " ") },
              ].filter((f) => f.value).map((f) => (
                <div key={f.label} className="flex justify-between"><span className="text-sm text-muted-foreground">{f.label}</span><span className="text-sm font-medium capitalize">{f.value}</span></div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Guardian Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {s.guardian_name ? <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-medium">{String(s.guardian_name)}</span></div> : null}
              {s.guardian_phone ? <div className="flex justify-between"><span className="text-sm text-muted-foreground">Phone</span><span className="text-sm font-medium">{String(s.guardian_phone)}</span></div> : null}
              {s.guardian_email ? <div className="flex justify-between"><span className="text-sm text-muted-foreground">Email</span><span className="text-sm font-medium">{String(s.guardian_email)}</span></div> : null}
              {s.guardian_relationship ? <div className="flex justify-between"><span className="text-sm text-muted-foreground">Relationship</span><span className="text-sm font-medium">{String(s.guardian_relationship)}</span></div> : null}
              {!s.guardian_name ? <p className="text-sm text-muted-foreground text-center py-4">No guardian information</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" /> Emergency & Medical</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {s.emergency_contact_name ? <div className="flex justify-between"><span className="text-sm text-muted-foreground">Emergency Contact</span><span className="text-sm font-medium">{String(s.emergency_contact_name)}</span></div> : null}
              {s.emergency_contact_phone ? <div className="flex justify-between"><span className="text-sm text-muted-foreground">Emergency Phone</span><span className="text-sm font-medium">{String(s.emergency_contact_phone)}</span></div> : null}
              {s.medical_conditions ? <div><span className="text-sm text-muted-foreground">Medical Conditions</span><p className="text-sm mt-1">{String(s.medical_conditions)}</p></div> : null}
              {s.allergies ? <div><span className="text-sm text-muted-foreground">Allergies</span><p className="text-sm mt-1">{String(s.allergies)}</p></div> : null}
              {!s.emergency_contact_name && !s.medical_conditions ? <p className="text-sm text-muted-foreground text-center py-4">No emergency/medical info</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Enrollment History</CardTitle></CardHeader>
            <CardContent>
              {enrollmentsList.length > 0 ? (
                <div className="space-y-3">
                  {enrollmentsList.map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div><p className="text-sm font-medium">Enrollment</p><p className="text-xs text-muted-foreground">{formatDate(e.enrollment_date)}</p></div>
                      <Badge variant={e.status === "active" ? "success" : "secondary"}>{e.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No enrollments found</p>
              )}
            </CardContent>
          </Card>
          {s.notes ? (
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{String(s.notes)}</p></CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}><StudentDetailContent id={id} /></Suspense>;
}
