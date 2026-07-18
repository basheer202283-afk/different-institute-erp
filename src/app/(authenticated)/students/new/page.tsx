"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema, type StudentFormData } from "@/lib/validators";
import { useCreateStudent } from "@/lib/hooks/use-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function NewStudentPage() {
  const router = useRouter();
  const createStudent = useCreateStudent();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: { status: "pending", academic_level: "beginner" },
  });

  const onSubmit = async (data: StudentFormData) => {
    createStudent.mutate(data, { onSuccess: () => router.push("/students") });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/students"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div><h1 className="text-2xl font-bold">Add New Student</h1><p className="text-muted-foreground">Create a new student record</p></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Student Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div><label className="text-sm font-medium">Student Number *</label><Input {...register("student_number")} className={errors.student_number ? "border-destructive" : ""} placeholder="STU-001" />{errors.student_number && <p className="text-xs text-destructive mt-1">{errors.student_number.message}</p>}</div>
            <div><label className="text-sm font-medium">Status</label><select {...register("status")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="pending">Pending</option><option value="active">Active</option><option value="enrolled">Enrolled</option></select></div>
            <div><label className="text-sm font-medium">Academic Level</label><select {...register("academic_level")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="beginner">Beginner</option><option value="elementary">Elementary</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="professional">Professional</option><option value="expert">Expert</option></select></div>
            <div><label className="text-sm font-medium">First Name</label><Input {...register("first_name")} placeholder="John" /></div>
            <div><label className="text-sm font-medium">Last Name</label><Input {...register("last_name")} placeholder="Doe" /></div>
            <div><label className="text-sm font-medium">Email</label><Input {...register("email")} type="email" placeholder="john@example.com" className={errors.email ? "border-destructive" : ""} />{errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}</div>
            <div><label className="text-sm font-medium">Phone</label><Input {...register("phone")} placeholder="+1234567890" /></div>
            <div><label className="text-sm font-medium">Date of Birth</label><Input {...register("date_of_birth")} type="date" /></div>
            <div><label className="text-sm font-medium">Gender</label><select {...register("gender")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            <div><label className="text-sm font-medium">Nationality</label><Input {...register("nationality")} placeholder="Country" /></div>
            <div><label className="text-sm font-medium">Blood Group</label><Input {...register("blood_group")} placeholder="A+" /></div>
            <div><label className="text-sm font-medium">Admission Date</label><Input {...register("admission_date")} type="date" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Guardian Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div><label className="text-sm font-medium">Guardian Name</label><Input {...register("guardian_name")} placeholder="Full name" /></div>
            <div><label className="text-sm font-medium">Guardian Phone</label><Input {...register("guardian_phone")} placeholder="+1234567890" /></div>
            <div><label className="text-sm font-medium">Guardian Email</label><Input {...register("guardian_email")} type="email" className={errors.guardian_email ? "border-destructive" : ""} />{errors.guardian_email && <p className="text-xs text-destructive mt-1">{errors.guardian_email.message}</p>}</div>
            <div><label className="text-sm font-medium">Relationship</label><Input {...register("guardian_relationship")} placeholder="Father, Mother, etc." /></div>
            <div><label className="text-sm font-medium">Previous School</label><Input {...register("previous_school")} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Emergency & Medical</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="text-sm font-medium">Emergency Contact Name</label><Input {...register("emergency_contact_name")} /></div>
            <div><label className="text-sm font-medium">Emergency Contact Phone</label><Input {...register("emergency_contact_phone")} /></div>
            <div><label className="text-sm font-medium">Medical Conditions</label><textarea {...register("medical_conditions")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Any medical conditions..." /></div>
            <div><label className="text-sm font-medium">Allergies</label><textarea {...register("allergies")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Any allergies..." /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea {...register("notes")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Additional notes about this student..." />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild><Link href="/students">Cancel</Link></Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : <><Save className="mr-2 h-4 w-4" /> Create Student</>}</Button>
        </div>
      </form>
    </motion.div>
  );
}
