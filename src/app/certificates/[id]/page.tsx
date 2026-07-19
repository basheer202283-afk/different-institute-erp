"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useCertificate, useIssueCertificate, useRevokeCertificate, useUpdateCertificate } from "@/lib/hooks/use-certificates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Award, User, BookOpen, Calendar, FileText, Send, Ban, Copy, ExternalLink, CheckCircle2, AlertCircle, Printer, Download } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary", active: "success", revoked: "destructive", expired: "warning",
};
const statusLabels: Record<string, string> = {
  draft: "مسودة", active: "صادرة", revoked: "ملغاة", expired: "منتهية",
};

export default function CertificateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: cert, isLoading, error } = useCertificate(id);
  const issueCert = useIssueCertificate();
  const revokeCert = useRevokeCertificate();
  const [showRevoke, setShowRevoke] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  const handleIssue = useCallback(async () => {
    if (window.confirm("هل تريد إصدار هذه الشهادة؟")) await issueCert.mutateAsync(id);
  }, [id, issueCert]);

  const handleRevoke = useCallback(async () => {
    if (!revokeReason) return;
    if (window.confirm("هل أنت متأكد من إلغاء هذه الشهادة؟")) {
      await revokeCert.mutateAsync({ id, reason: revokeReason });
      setShowRevoke(false);
      setRevokeReason("");
    }
  }, [id, revokeReason, revokeCert]);

  const handleCopyUrl = useCallback(() => {
    if (cert?.verification_url) {
      navigator.clipboard.writeText(cert.verification_url);
    }
  }, [cert]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error || !cert) return <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive"><AlertCircle className="h-12 w-12 mb-4" /><h2 className="text-xl font-bold mb-2">خطأ في تحميل البيانات</h2><Button variant="outline" asChild><Link href="/certificates">العودة</Link></Button></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/certificates"><ArrowRight className="h-5 w-5" /></Link></Button>
          <div><h1 className="text-3xl font-bold tracking-tight">تفاصيل الشهادة</h1><p className="text-muted-foreground font-mono">{cert.certificate_number}</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {cert.status === "draft" && <Button onClick={handleIssue} disabled={issueCert.isPending}><Send className="ml-2 h-4 w-4" /> إصدار</Button>}
          {cert.status === "active" && <Button variant="outline" className="text-orange-600" onClick={() => setShowRevoke(!showRevoke)}><Ban className="ml-2 h-4 w-4" /> إلغاء</Button>}
          {cert.verification_url && <Button variant="outline" onClick={handleCopyUrl}><Copy className="ml-2 h-4 w-4" /> نسخ رابط التحقق</Button>}
          <Button variant="outline" onClick={handlePrint}><Printer className="ml-2 h-4 w-4" /> طباعة</Button>
        </div>
      </div>

      {/* Status */}
      <Card><CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={statusColors[cert.status]} className="text-sm px-3 py-1">{statusLabels[cert.status]}</Badge>
            {cert.grade && <Badge variant="default">{cert.grade}</Badge>}
            {cert.score !== null && cert.score !== undefined && <span className="text-sm text-muted-foreground">النتيجة: {cert.score}%</span>}
          </div>
          <div className="text-sm text-muted-foreground">تاريخ الإصدار: {cert.issue_date ? formatDate(cert.issue_date) : "—"}</div>
        </div>
      </CardContent></Card>

      {/* Revoke Panel */}
      {showRevoke && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><Ban className="h-5 w-5" /> إلغاء الشهادة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium mb-2 block">سبب الإلغاء *</label><Input value={revokeReason} onChange={e => setRevokeReason(e.target.value)} placeholder="سبب الإلغاء..." /></div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleRevoke} disabled={!revokeReason || revokeCert.isPending}>{revokeCert.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Ban className="ml-2 h-4 w-4" />} تأكيد الإلغاء</Button>
              <Button variant="ghost" onClick={() => setShowRevoke(false)}>تراجع</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Preview */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="text-center border-b pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center"><Award className="h-10 w-10 text-primary" /></div>
          </div>
          <CardTitle className="text-2xl">{cert.title_ar || cert.title}</CardTitle>
          {cert.title_ar && cert.title !== cert.title_ar && <p className="text-lg text-muted-foreground mt-1">{cert.title}</p>}
          <p className="text-sm text-muted-foreground font-mono mt-2">رقم الشهادة: {cert.certificate_number}</p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Student Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {cert.student?.first_name_ar?.charAt(0) ?? "?"}
            </div>
            <div>
              <p className="text-lg font-semibold">{cert.student?.first_name_ar} {cert.student?.last_name_ar}</p>
              {cert.student?.first_name_en && <p className="text-muted-foreground">{cert.student.first_name_en} {cert.student.last_name_en}</p>}
              <p className="text-sm text-muted-foreground">رقم الطالبة: {cert.student?.student_number}</p>
            </div>
          </div>

          {/* Course Info */}
          {cert.course && (
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><BookOpen className="h-6 w-6 text-blue-600" /></div>
              <div><p className="font-semibold">{cert.course.name}</p><p className="text-sm text-muted-foreground">{cert.course.code}</p></div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Calendar className="h-4 w-4" /> تاريخ الإصدار</div>
              <p className="font-medium">{cert.issue_date ? formatDate(cert.issue_date) : "—"}</p>
            </div>
            {cert.expiry_date && (
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Calendar className="h-4 w-4" /> تاريخ الانتهاء</div>
                <p className="font-medium">{formatDate(cert.expiry_date)}</p>
              </div>
            )}
            {cert.hours_completed !== null && cert.hours_completed !== undefined && (
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><FileText className="h-4 w-4" /> الساعات المكتملة</div>
                <p className="font-medium">{cert.hours_completed} ساعة</p>
              </div>
            )}
            {cert.issuer && (
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><User className="h-4 w-4" /> أصدرها</div>
                <p className="font-medium">{cert.issuer.display_name || `${cert.issuer.first_name ?? ""} ${cert.issuer.last_name ?? ""}`}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {cert.description && (
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm">{cert.description}</p>
            </div>
          )}

          {/* QR / Verification */}
          {cert.verification_url && (
            <div className="p-4 rounded-lg border text-center">
              <p className="text-sm text-muted-foreground mb-2">رابط التحقق من الشهادة:</p>
              <a href={cert.verification_url} target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center justify-center gap-1">
                <ExternalLink className="h-4 w-4" /> التحقق من صحة الشهادة
              </a>
            </div>
          )}

          {/* Revocation Info */}
          {cert.status === "revoked" && (
            <div className="p-4 rounded-lg border border-destructive bg-destructive/5">
              <p className="font-medium text-destructive flex items-center gap-2"><Ban className="h-4 w-4" /> تم إلغاء هذه الشهادة</p>
              {cert.revoke_reason && <p className="text-sm text-destructive/80 mt-1">السبب: {cert.revoke_reason}</p>}
              {cert.revoked_at && <p className="text-xs text-destructive/60 mt-1">تاريخ الإلغاء: {formatDate(cert.revoked_at)}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
