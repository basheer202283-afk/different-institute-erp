"use client";

import { useState } from "react";
import { useStudents } from "@/lib/hooks/use-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { motion } from "framer-motion";
import { Shield, Users, Phone, Mail, Loader2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GuardiansPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: studentsResult, isLoading } = useStudents({ search, pageSize: 100 });

  const studentsWithGuardians = ((studentsResult?.data ?? []) as Array<Record<string, unknown>>).filter((s) => {
    const st = s as unknown as { guardian_name?: string | null };
    return st.guardian_name;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Guardians</h1><p className="text-muted-foreground">Manage parent and guardian information</p></div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2 text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"><Shield className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{studentsWithGuardians.length}</p><p className="text-xs text-muted-foreground">Total Guardians</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2 text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"><Users className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{studentsResult?.count ?? 0}</p><p className="text-xs text-muted-foreground">Total Students</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2 text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"><Phone className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{studentsWithGuardians.filter((s) => (s as unknown as { guardian_phone?: string | null }).guardian_phone).length}</p><p className="text-xs text-muted-foreground">With Phone</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Guardian Directory</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : studentsWithGuardians.length > 0 ? (
            <div className="space-y-3">
              {studentsWithGuardians.map((student) => {
                const s = student as unknown as { id: string; student_number: string; guardian_name?: string | null; guardian_phone?: string | null; guardian_email?: string | null; guardian_relationship?: string | null; emergency_contact_name?: string | null; emergency_contact_phone?: string | null };
                return (
                  <div key={s.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                      <div>
                        <p className="font-medium">{s.guardian_name}</p>
                        <p className="text-xs text-muted-foreground">Student: {s.student_number} • {s.guardian_relationship || "Guardian"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        {s.guardian_phone && <p className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {s.guardian_phone}</p>}
                        {s.guardian_email && <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" /> {s.guardian_email}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/students/${s.id}`)}><Eye className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12"><Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-semibold">No guardians found</h3><p className="text-muted-foreground mt-1">Guardian information appears when students have guardian data</p></div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
