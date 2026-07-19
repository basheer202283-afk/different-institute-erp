"use client";

import { use, Suspense } from "react";
import { useInvoice } from "@/lib/hooks/use-finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileText, DollarSign, Calendar, User } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary", sent: "default", viewed: "default", partial: "warning",
  paid: "success", overdue: "destructive", cancelled: "destructive", refunded: "secondary",
};

const statusLabels: Record<string, string> = {
  draft: "مسودة", sent: "مرسل", viewed: "مشاهد", partial: "جزئي",
  paid: "مدفوع", overdue: "متأخر", cancelled: "ملغي", refunded: "مسترد",
};

function InvoiceDetailContent({ id }: { id: string }) {
  const { data: invoice, isLoading } = useInvoice(id);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">الفاتورة غير موجودة</h2>
        <Button className="mt-4" asChild>
          <Link href="/finance">العودة للمالية</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/finance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">فاتورة {invoice.invoice_number}</h1>
          <p className="text-muted-foreground">تفاصيل الفاتورة</p>
        </div>
        <Badge variant={statusColors[invoice.status]}>{statusLabels[invoice.status]}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> بيانات الفاتورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "رقم الفاتورة", value: invoice.invoice_number },
              { label: "تاريخ الإصدار", value: formatDate(invoice.issue_date) },
              { label: "تاريخ الاستحقاق", value: formatDate(invoice.due_date) },
              { label: "الحالة", value: statusLabels[invoice.status] },
              { label: "العملة", value: invoice.currency },
            ].map((f) => (
              <div key={f.label} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{f.label}</span>
                <span className="text-sm font-medium">{f.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> المبالغ المالية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "المبلغ الفرعي", value: formatCurrency(invoice.subtotal) },
              { label: "الضريبة", value: formatCurrency(invoice.tax_amount) },
              { label: "الخصم", value: formatCurrency(invoice.discount_amount) },
              { label: "المبلغ الإجمالي", value: formatCurrency(invoice.total_amount) },
              { label: "المبلغ المدفوع", value: formatCurrency(invoice.paid_amount) },
              { label: "الرصيد", value: formatCurrency(invoice.balance) },
            ].map((f) => (
              <div key={f.label} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{f.label}</span>
                <span className="text-sm font-medium">{f.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {invoice.notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <InvoiceDetailContent id={id} />
    </Suspense>
  );
}
