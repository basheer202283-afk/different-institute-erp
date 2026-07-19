"use client";

import { useState, useCallback } from "react";
import { useCertificates, useDeleteCertificate, useIssueCertificate, useRevokeCertificate, useCertificateStats } from "@/lib/hooks/use-certificates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Search, Filter, Loader2, ChevronLeft, ChevronRight, Eye, Trash2, Award, AlertCircle, CheckCircle2, XCircle, Clock, FileText, Send, Ban, ExternalLink, Copy } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Certificate, CertificateFilters, CertificateStatus } from "@/lib/types/certificate";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary", active: "success", revoked: "destructive", expired: "warning",
};

const statusLabels: Record<string, string> = {
  draft: "مسودة", active: "صادرة", revoked: "ملغاة", expired: "منتهية",
};

export default function CertificatesPage() {
  const [tab, setTab] = useState("list");
  const [filters, setFilters] = useState<CertificateFilters>({ page: 1, pageSize: 10, search: "", status: undefined });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useCertificates(filters);
  const { data: stats } = useCertificateStats();
  const deleteCert = useDeleteCertificate();
  const issueCert = useIssueCertificate();
  const revokeCert = useRevokeCertificate();

  const handleSearch = useCallback(() => { setFilters(p => ({ ...p, search: searchInput, page: 1 })); }, [searchInput]);
  const handlePageChange = useCallback((p: number) => { setFilters(prev => ({ ...prev, page: p })); }, []);
  const handleStatusFilter = useCallback((s: CertificateStatus | undefined) => { setFilters(prev => ({ ...prev, status: s, page: 1 })); }, []);

  const handleIssue = useCallback(async (id: string) => {
    if (window.confirm("هل تريد إصدار هذه الشهادة؟")) await issueCert.mutateAsync(id);
  }, [issueCert]);

  const handleRevoke = useCallback(async (id: string) => {
    const reason = window.prompt("سبب الإلغاء:");
    if (reason) await revokeCert.mutateAsync({ id, reason });
  }, [revokeCert]);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الشهادة؟")) await deleteCert.mutateAsync(id);
  }, [deleteCert]);

  const certificates = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الشهادات</h1>
          <p className="text-muted-foreground">إنشاء وإدارة شهادات الطالبات</p>
        </div>
        <Button asChild>
          <Link href="/certificates/new"><Plus className="ml-2 h-4 w-4" /> إصدار شهادة</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Award className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.total ?? 0}</p><p className="text-xs text-muted-foreground">إجمالي الشهادات</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.active ?? 0}</p><p className="text-xs text-muted-foreground">صادرة</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Clock className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.issued_this_month ?? 0}</p><p className="text-xs text-muted-foreground">هذا الشهر</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><Ban className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.revoked ?? 0}</p><p className="text-xs text-muted-foreground">ملغاة</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="list">كل الشهادات</TabsTrigger>
          <TabsTrigger value="draft">مسودات</TabsTrigger>
          <TabsTrigger value="active">صادرة</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="space-y-4">
            <Card><CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث بالعنوان أو الرقم..." className="pr-9" value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSearch}><Search className="ml-2 h-4 w-4" /> بحث</Button>
                  <Button variant="outline" onClick={() => setShowFilters(!showFilters)}><Filter className="ml-2 h-4 w-4" /> فلتر</Button>
                </div>
              </div>
              {showFilters && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    <Button variant={filters.status === undefined ? "default" : "outline"} size="sm" onClick={() => handleStatusFilter(undefined)}>الكل</Button>
                    {Object.entries(statusLabels).map(([v, l]) => (
                      <Button key={v} variant={filters.status === v ? "default" : "outline"} size="sm" onClick={() => handleStatusFilter(v as CertificateStatus)}>{l}</Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent></Card>

            {isLoading ? (
              <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>
            ) : error ? (
              <Card><CardContent className="flex items-center justify-center py-12 text-destructive"><AlertCircle className="h-6 w-6 mr-2" /><span>خطأ في تحميل البيانات</span></CardContent></Card>
            ) : certificates.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-semibold">لا توجد شهادات</h3><p className="mt-1">ابدأ بإصدار أول شهادة</p>
                <Button className="mt-4" asChild><Link href="/certificates/new"><Plus className="ml-2 h-4 w-4" /> إصدار شهادة</Link></Button>
              </CardContent></Card>
            ) : (
              <Card>
                <CardHeader><CardTitle>قائمة الشهادات ({data?.count ?? 0})</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b">
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الشهادة</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الطالبة</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الدورة</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">تاريخ الإصدار</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
                      </tr></thead>
                      <tbody>
                        {certificates.map(cert => (
                          <tr key={cert.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4">
                              <div><p className="text-sm font-medium">{cert.title}</p><p className="text-xs text-muted-foreground font-mono">{cert.certificate_number}</p></div>
                            </td>
                            <td className="py-3 px-4 text-sm">{cert.student_id?.substring(0, 8) ?? "—"}</td>
                            <td className="py-3 px-4 text-sm">{cert.course_id?.substring(0, 8) ?? "—"}</td>
                            <td className="py-3 px-4"><Badge variant={statusColors[cert.status]}>{statusLabels[cert.status] ?? cert.status}</Badge></td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{cert.issue_date ? formatDate(cert.issue_date) : "—"}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href={`/certificates/${cert.id}`}><Eye className="h-4 w-4" /></Link></Button>
                                {cert.status === "draft" && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleIssue(cert.id)} title="إصدار"><Send className="h-4 w-4" /></Button>
                                )}
                                {cert.status === "active" && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600" onClick={() => handleRevoke(cert.id)} title="إلغاء"><Ban className="h-4 w-4" /></Button>
                                )}
                                {cert.verification_url && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyUrl(cert.verification_url!)} title="نسخ رابط التحقق"><Copy className="h-4 w-4" /></Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cert.id)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">عرض {(currentPage - 1) * 10 + 1} إلى {Math.min(currentPage * 10, data?.count ?? 0)} من {data?.count ?? 0}</p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                        <span className="text-sm">{currentPage} / {totalPages}</span>
                        <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)}><ChevronRight className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="draft"><CertificateListByStatus status="draft" onIssue={handleIssue} onDelete={handleDelete} /></TabsContent>
        <TabsContent value="active"><CertificateListByStatus status="active" onRevoke={handleRevoke} onDelete={handleDelete} /></TabsContent>
      </Tabs>
    </div>
  );
}

function CertificateListByStatus({ status, onIssue, onRevoke, onDelete }: { status: CertificateStatus; onIssue?: (id: string) => void; onRevoke?: (id: string) => void; onDelete: (id: string) => void }) {
  const { data, isLoading } = useCertificates({ status, pageSize: 50 });
  if (isLoading) return <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>;
  const certs = data?.data ?? [];
  if (certs.length === 0) return <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Award className="h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-semibold">لا توجد شهادات</h3></CardContent></Card>;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b">
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الشهادة</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التاريخ</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
            </tr></thead>
            <tbody>
              {certs.map(cert => (
                <tr key={cert.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4"><p className="text-sm font-medium">{cert.title}</p><p className="text-xs text-muted-foreground font-mono">{cert.certificate_number}</p></td>
                  <td className="py-3 px-4"><Badge variant={statusColors[cert.status]}>{statusLabels[cert.status]}</Badge></td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{cert.issue_date ? formatDate(cert.issue_date) : "—"}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href={`/certificates/${cert.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      {onIssue && <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => onIssue(cert.id)}><Send className="h-4 w-4" /></Button>}
                      {onRevoke && <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600" onClick={() => onRevoke(cert.id)}><Ban className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(cert.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
