"use client";

import { useVerifyCertificate } from "@/lib/hooks/use-certificates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Award, CheckCircle2, XCircle, User, BookOpen, Calendar, Shield } from "lucide-react";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function VerifyCertificatePage() {
  const params = useParams();
  const code = params.code as string;
  const { data: cert, isLoading, error } = useVerifyCertificate(code);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحقق من الشهادة...</p>
        </div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">شهادة غير صالحة</h1>
            <p className="text-muted-foreground mb-6">لم يتم العثور على شهادة بهذا الرقم، أو تم إلغاؤها.</p>
            <p className="text-sm text-muted-foreground font-mono mb-4">رقم التحقق: {code}</p>
            <Button asChild><Link href="/">العودة للرئيسية</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Verification Status */}
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">شهادة موثقة ✓</h1>
                <p className="text-muted-foreground">تم التحقق من صحة هذه الشهادة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Details */}
        <Card>
          <CardHeader className="text-center border-b pb-6">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">{cert.title_ar || cert.title}</CardTitle>
            <p className="text-sm text-muted-foreground font-mono mt-2">رقم الشهادة: {cert.certificate_number}</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Student */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {cert.student?.first_name_ar?.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="text-lg font-semibold">{cert.student?.first_name_ar} {cert.student?.last_name_ar}</p>
                {cert.student?.first_name_en && <p className="text-muted-foreground">{cert.student.first_name_en} {cert.student.last_name_en}</p>}
              </div>
            </div>

            {/* Course */}
            {cert.course && (
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div><p className="font-semibold">{cert.course.name}</p><p className="text-sm text-muted-foreground">{cert.course.code}</p></div>
              </div>
            )}

            {/* Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Calendar className="h-4 w-4" /> تاريخ الإصدار</div>
                <p className="font-medium">{cert.issue_date ? formatDate(cert.issue_date) : "—"}</p>
              </div>
              {cert.grade && (
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Shield className="h-4 w-4" /> الدرجة</div>
                  <p className="font-medium">{cert.grade}</p>
                </div>
              )}
            </div>

            {cert.description && <div className="p-4 rounded-lg bg-muted/30"><p className="text-sm">{cert.description}</p></div>}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>معهد المختلفة للتدريب النسائي</p>
          <p>Different Female Training Institute</p>
        </div>
      </div>
    </div>
  );
}
