"use client";

import { useState } from "react";
import { useFinanceStats, useInvoices, usePayments, useScholarships, useDiscounts } from "@/lib/hooks/use-finance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, DollarSign, TrendingUp, AlertCircle, Loader2, Plus, 
  Search, Eye, Edit, Trash2, FileText, Receipt, Award, Percent, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary", sent: "default", viewed: "default", partial: "warning", 
  paid: "success", overdue: "destructive", cancelled: "destructive", refunded: "secondary",
  pending: "warning", failed: "destructive",
};

const statusLabels: Record<string, string> = {
  draft: "مسودة", sent: "مرسل", viewed: "مشاهد", partial: "جزئي",
  paid: "مدفوع", overdue: "متأخر", cancelled: "ملغي", refunded: "مسترد",
  pending: "قيد الانتظار", failed: "فشل",
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: stats, isLoading: loadingStats } = useFinanceStats();
  const { data: invoicesData } = useInvoices({ pageSize: 5 });
  const { data: paymentsData } = usePayments({ pageSize: 5 });
  const { data: scholarships } = useScholarships();
  const { data: discounts } = useDiscounts();

  const invoices = invoicesData?.data ?? [];
  const payments = paymentsData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المالية</h1>
          <p className="text-muted-foreground">إدارة الفواتير والمدفوعات والمنح</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/finance/invoices/new">
              <Plus className="ml-2 h-4 w-4" /> فاتورة جديدة
            </Link>
          </Button>
          <Button asChild>
            <Link href="/finance/payments/new">
              <Plus className="ml-2 h-4 w-4" /> تسجيل دفعة
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "إجمالي الإيرادات", value: formatCurrency(stats?.total_revenue ?? 0), icon: DollarSign, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
          { label: "المبالغ المحصلة", value: formatCurrency(stats?.total_collected ?? 0), icon: TrendingUp, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "المبالغ المستحقة", value: formatCurrency(stats?.total_outstanding ?? 0), icon: AlertCircle, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
          { label: "نسبة التحصيل", value: `${stats?.collection_rate ?? 0}%`, icon: CreditCard, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="scholarships">المنح</TabsTrigger>
          <TabsTrigger value="discounts">الخصومات</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Invoices */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>آخر الفواتير</CardTitle>
                  <CardDescription>أحدث 5 فواتير</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/finance/invoices">عرض الكل</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">لا توجد فواتير</p>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{inv.invoice_number}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(inv.issue_date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(inv.total_amount)}</p>
                          <Badge variant={statusColors[inv.status]}>{statusLabels[inv.status]}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>آخر المدفوعات</CardTitle>
                  <CardDescription>أحدث 5 مدفوعات</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/finance/payments">عرض الكل</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">لا توجد مدفوعات</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((pay) => (
                      <div key={pay.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{pay.payment_number}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(pay.payment_date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(pay.amount)}</p>
                          <Badge variant={statusColors[pay.status]}>{statusLabels[pay.status]}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>الفواتير ({invoicesData?.count ?? 0})</CardTitle>
              <Button size="sm" asChild>
                <Link href="/finance/invoices/new"><Plus className="ml-2 h-4 w-4" /> فاتورة جديدة</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">رقم الفاتورة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الطالبة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التاريخ</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الاستحقاق</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">المبلغ</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">المدفوع</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm font-mono">{inv.invoice_number}</td>
                        <td className="py-3 px-4 text-sm font-mono">{inv.student_id?.slice(0, 8)}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(inv.issue_date)}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(inv.due_date)}</td>
                        <td className="py-3 px-4 text-sm font-medium">{formatCurrency(inv.total_amount)}</td>
                        <td className="py-3 px-4 text-sm">{formatCurrency(inv.paid_amount)}</td>
                        <td className="py-3 px-4"><Badge variant={statusColors[inv.status]}>{statusLabels[inv.status]}</Badge></td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/finance/invoices/${inv.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {invoices.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold">لا توجد فواتير</h3>
                  <p className="text-muted-foreground mt-1">أنشئ أول فاتورة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>المدفوعات ({paymentsData?.count ?? 0})</CardTitle>
              <Button size="sm" asChild>
                <Link href="/finance/payments/new"><Plus className="ml-2 h-4 w-4" /> تسجيل دفعة</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">رقم الدفعة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الطالبة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">التاريخ</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">المبلغ</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الطريقة</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((pay) => (
                      <tr key={pay.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm font-mono">{pay.payment_number}</td>
                        <td className="py-3 px-4 text-sm font-mono">{pay.student_id?.slice(0, 8)}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(pay.payment_date)}</td>
                        <td className="py-3 px-4 text-sm font-medium">{formatCurrency(pay.amount)}</td>
                        <td className="py-3 px-4 text-sm capitalize">{pay.payment_method?.replace("_", " ")}</td>
                        <td className="py-3 px-4"><Badge variant={statusColors[pay.status]}>{statusLabels[pay.status]}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {payments.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold">لا توجد مدفوعات</h3>
                  <p className="text-muted-foreground mt-1">سجل أول دفعة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scholarships Tab */}
        <TabsContent value="scholarships" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>المنح الدراسية</CardTitle>
              <Button size="sm"><Plus className="ml-2 h-4 w-4" /> إضافة منحة</Button>
            </CardHeader>
            <CardContent>
              {(scholarships ?? []).length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold">لا توجد منح</h3>
                  <p className="text-muted-foreground mt-1">أضف أول منحة دراسية</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(scholarships ?? []).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                          <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.code} • {s.type}</p>
                        </div>
                      </div>
                      <Badge variant={s.is_active ? "success" : "secondary"}>
                        {s.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discounts Tab */}
        <TabsContent value="discounts" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>الخصومات</CardTitle>
              <Button size="sm"><Plus className="ml-2 h-4 w-4" /> إضافة خصم</Button>
            </CardHeader>
            <CardContent>
              {(discounts ?? []).length === 0 ? (
                <div className="text-center py-12">
                  <Percent className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold">لا توجد خصومات</h3>
                  <p className="text-muted-foreground mt-1">أضف أول خصم</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(discounts ?? []).map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                          <Percent className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <p className="font-medium">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.code} • {d.type}</p>
                        </div>
                      </div>
                      <Badge variant={d.is_active ? "success" : "secondary"}>
                        {d.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
