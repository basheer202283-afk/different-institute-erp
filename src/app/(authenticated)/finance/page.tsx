"use client";

import { useState } from "react";
import { useInvoices, usePayments, useFinanceStats, useFeeStructures, useScholarships, useDiscounts, useTransactions } from "@/lib/hooks/use-finance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { CreditCard, DollarSign, TrendingUp, AlertCircle, Loader2, Plus, Search, Download, Eye, FileText, Receipt, Award, Percent } from "lucide-react";
import { useRouter } from "next/navigation";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary" | "outline"> = {
  draft: "secondary", sent: "default", viewed: "default", partial: "warning", paid: "success", overdue: "destructive", cancelled: "destructive", refunded: "secondary",
  pending: "warning", failed: "destructive",
};

export default function FinancePage() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const { data: stats, isLoading: loadingStats } = useFinanceStats();
  const { data: invoices } = useInvoices();
  const { data: payments } = usePayments();
  const { data: feeStructures } = useFeeStructures();
  const { data: scholarships } = useScholarships();
  const { data: discounts } = useDiscounts();
  const { data: transactions } = useTransactions();

  if (loadingStats) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Finance</h1><p className="text-muted-foreground">Manage invoices, payments, and financial operations</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/finance/invoices/new")}><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
          <Button onClick={() => router.push("/finance/new-payment")}><Plus className="mr-2 h-4 w-4" /> Record Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: formatCurrency(stats?.totalRevenue ?? 0), icon: DollarSign, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
          { label: "Outstanding", value: formatCurrency(stats?.outstanding ?? 0), icon: AlertCircle, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
          { label: "This Month", value: formatCurrency(stats?.thisMonth ?? 0), icon: TrendingUp, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "Overdue", value: String(stats?.overdueCount ?? 0), icon: CreditCard, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3"><div className={`rounded-lg p-2 ${s.color}`}><s.icon className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="fees">Fee Structures</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-lg">Recent Invoices</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(invoices ?? []).slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                      <div><p className="text-sm font-medium">{inv.invoice_number}</p><p className="text-xs text-muted-foreground">{formatDate(inv.issue_date)}</p></div>
                    </div>
                    <div className="text-right"><p className="text-sm font-medium">{formatCurrency(inv.total_amount)}</p><Badge variant={statusColors[inv.status] ?? "secondary"} className="text-[10px]">{inv.status}</Badge></div>
                  </div>
                ))}
                {(!invoices || invoices.length === 0) && <div className="text-center py-8 text-muted-foreground"><FileText className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No invoices yet</p></div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Recent Payments</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(payments ?? []).slice(0, 5).map((pay) => (
                  <div key={pay.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Receipt className="h-4 w-4 text-green-600 dark:text-green-400" /></div>
                      <div><p className="text-sm font-medium">{pay.payment_number}</p><p className="text-xs text-muted-foreground">{formatDate(pay.payment_date)}</p></div>
                    </div>
                    <div className="text-right"><p className="text-sm font-medium">{formatCurrency(pay.amount)}</p><Badge variant={statusColors[pay.status] ?? "secondary"} className="text-[10px]">{pay.status}</Badge></div>
                  </div>
                ))}
                {(!payments || payments.length === 0) && <div className="text-center py-8 text-muted-foreground"><Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No payments yet</p></div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">All Invoices</CardTitle>
              <Button size="sm" onClick={() => router.push("/finance/invoices/new")}><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Invoice #</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Student</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Due Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Total</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Paid</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  </tr></thead>
                  <tbody>
                    {(invoices ?? []).map((inv) => (
                      <tr key={inv.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/finance/invoices/${inv.id}`)}>
                        <td className="py-3 px-4 text-sm font-medium">{inv.invoice_number}</td>
                        <td className="py-3 px-4 text-sm font-mono">{inv.student_id?.slice(0, 8)}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(inv.issue_date)}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(inv.due_date)}</td>
                        <td className="py-3 px-4 text-sm font-medium">{formatCurrency(inv.total_amount)}</td>
                        <td className="py-3 px-4 text-sm">{formatCurrency(inv.paid_amount)}</td>
                        <td className="py-3 px-4"><Badge variant={statusColors[inv.status] ?? "secondary"}>{inv.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!invoices || invoices.length === 0) && <div className="text-center py-12"><FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-semibold">No invoices yet</h3><p className="text-muted-foreground mt-1">Create your first invoice to get started</p></div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">All Payments</CardTitle>
              <Button size="sm" onClick={() => router.push("/finance/new-payment")}><Plus className="mr-2 h-4 w-4" /> Record Payment</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Payment #</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Student</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Method</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  </tr></thead>
                  <tbody>
                    {(payments ?? []).map((pay) => (
                      <tr key={pay.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm font-medium">{pay.payment_number}</td>
                        <td className="py-3 px-4 text-sm font-mono">{pay.student_id?.slice(0, 8)}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(pay.payment_date)}</td>
                        <td className="py-3 px-4 text-sm font-medium">{formatCurrency(pay.amount)}</td>
                        <td className="py-3 px-4 text-sm capitalize">{pay.payment_method?.replace("_", " ")}</td>
                        <td className="py-3 px-4"><Badge variant={statusColors[pay.status] ?? "secondary"}>{pay.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!payments || payments.length === 0) && <div className="text-center py-12"><Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-semibold">No payments yet</h3><p className="text-muted-foreground mt-1">Record your first payment</p></div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Fee Structures</CardTitle>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Fee Structure</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(feeStructures ?? []).map((fs) => (
                  <div key={fs.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
                      <div><p className="font-medium">{fs.name}</p><p className="text-xs text-muted-foreground">{fs.code} • {fs.fee_type}</p></div>
                    </div>
                    <div className="text-right"><p className="font-bold">{formatCurrency(fs.amount)}</p><Badge variant={fs.is_active ? "success" : "secondary"}>{fs.is_active ? "Active" : "Inactive"}</Badge></div>
                  </div>
                ))}
                {(!feeStructures || feeStructures.length === 0) && <div className="text-center py-8 text-muted-foreground"><CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No fee structures yet</p></div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarships" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Scholarships</CardTitle>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Scholarship</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(scholarships ?? []).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" /></div>
                      <div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.code} • {s.type}</p></div>
                    </div>
                    <div className="text-right"><p className="font-bold">{s.value_type === "percentage" ? `${s.value}%` : formatCurrency(s.value)}</p><Badge variant={s.is_active ? "success" : "secondary"}>{s.is_active ? "Active" : "Inactive"}</Badge></div>
                  </div>
                ))}
                {(!scholarships || scholarships.length === 0) && <div className="text-center py-8 text-muted-foreground"><Award className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No scholarships yet</p></div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Discounts</CardTitle>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Discount</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(discounts ?? []).map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center"><Percent className="h-5 w-5 text-teal-600 dark:text-teal-400" /></div>
                      <div><p className="font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.code} • {d.type}</p></div>
                    </div>
                    <div className="text-right"><p className="font-bold">{d.type === "percentage" ? `${d.value}%` : formatCurrency(d.value)}</p><Badge variant={d.is_active ? "success" : "secondary"}>{d.is_active ? "Active" : "Inactive"}</Badge></div>
                  </div>
                ))}
                {(!discounts || discounts.length === 0) && <div className="text-center py-8 text-muted-foreground"><Percent className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No discounts yet</p></div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Financial Transactions</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Description</th>
                  </tr></thead>
                  <tbody>
                    {(transactions ?? []).map((t) => (
                      <tr key={t.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">{formatDate(t.transaction_date)}</td>
                        <td className="py-3 px-4"><Badge variant={t.type === "income" ? "success" : t.type === "expense" ? "destructive" : "default"}>{t.type}</Badge></td>
                        <td className="py-3 px-4 text-sm capitalize">{t.category}</td>
                        <td className="py-3 px-4 text-sm font-medium">{formatCurrency(t.amount)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{t.description ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!transactions || transactions.length === 0) && <div className="text-center py-12"><DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-semibold">No transactions yet</h3></div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
