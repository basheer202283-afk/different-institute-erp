"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Building2, Palette, GraduationCap, CreditCard, Bell, Shield, Database, Save, Loader2 } from "lucide-react";
import { useTenant } from "@/lib/hooks/use-tenant";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function SettingsPage() {
  const { organization, branch, branches } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch organization settings from DB
  const { data: orgData } = useQuery({
    queryKey: ["settings-org", organization?.id],
    queryFn: async () => {
      if (!organization) return null;
      const { data } = await supabase.from("organizations").select("*").eq("id", organization.id).single();
      return data as any;
    },
    enabled: !!organization,
  });

  // Save organization settings
  const saveOrg = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      if (!organization) throw new Error("No organization");
      const { error } = await (supabase.from("organizations") as any).update(updates).eq("id", organization.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings-org"] }); toast.success("تم حفظ الإعدادات بنجاح"); },
    onError: (e: Error) => { toast.error(`خطأ: ${e.message}`); },
  });

  // Fetch academic years
  const { data: academicYears } = useQuery({
    queryKey: ["settings-academic-years", organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const { data } = await supabase.from("academic_years").select("id, name, code, start_date, end_date, is_current, is_active").is("deleted_at", null).order("start_date", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: !!organization,
  });

  // Fetch semesters
  const { data: semesters } = useQuery({
    queryKey: ["settings-semesters", organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const { data } = await supabase.from("semesters").select("id, name, code, start_date, end_date, is_current, is_active, academic_year_id").is("deleted_at", null).order("start_date", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: !!organization,
  });

  // Local form state
  const [orgName, setOrgName] = useState(orgData?.name ?? "");
  const [orgEmail, setOrgEmail] = useState(orgData?.email ?? "");
  const [orgPhone, setOrgPhone] = useState(orgData?.phone ?? "");
  const [orgCity, setOrgCity] = useState(orgData?.city ?? "");
  const [orgCountry, setOrgCountry] = useState(orgData?.country ?? "");
  const [orgTimezone, setOrgTimezone] = useState(orgData?.timezone ?? "Asia/Aden");
  const [orgLocale, setOrgLocale] = useState(orgData?.locale ?? "ar");
  const [orgCurrency, setOrgCurrency] = useState(orgData?.currency ?? "YER");
  const [brandColor, setBrandColor] = useState(orgData?.brand_color ?? "#6366f1");
  const [secondaryColor, setSecondaryColor] = useState(orgData?.secondary_color ?? "#8b5cf6");

  const handleSaveGeneral = useCallback(() => {
    saveOrg.mutate({ name: orgName, email: orgEmail || null, phone: orgPhone || null, city: orgCity || null, country: orgCountry, timezone: orgTimezone, locale: orgLocale, currency: orgCurrency });
  }, [orgName, orgEmail, orgPhone, orgCity, orgCountry, orgTimezone, orgLocale, orgCurrency, saveOrg]);

  const handleSaveBranding = useCallback(() => {
    saveOrg.mutate({ brand_color: brandColor, secondary_color: secondaryColor });
  }, [brandColor, secondaryColor, saveOrg]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1><p className="text-muted-foreground">إعدادات النظام والمعهد</p></div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general"><Settings className="ml-1 h-4 w-4" /> عام</TabsTrigger>
          <TabsTrigger value="branch"><Building2 className="ml-1 h-4 w-4" /> الفروع</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="ml-1 h-4 w-4" /> العلامة التجارية</TabsTrigger>
          <TabsTrigger value="academic"><GraduationCap className="ml-1 h-4 w-4" /> الأكاديمي</TabsTrigger>
          <TabsTrigger value="security"><Shield className="ml-1 h-4 w-4" /> الأمان</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card><CardHeader><CardTitle>الإعدادات العامة</CardTitle><CardDescription>بيانات المعهد الأساسية — محفوظة في Supabase</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">اسم المعهد</label><Input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="معهد المختلفة" /></div>
              <div><label className="text-sm font-medium mb-2 block">البريد الإلكتروني</label><Input type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)} placeholder="info@..." /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">الهاتف</label><Input value={orgPhone} onChange={e => setOrgPhone(e.target.value)} placeholder="+967..." /></div>
              <div><label className="text-sm font-medium mb-2 block">المدينة</label><Input value={orgCity} onChange={e => setOrgCity(e.target.value)} placeholder="عدن" /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div><label className="text-sm font-medium mb-2 block">الدولة</label><Input value={orgCountry} onChange={e => setOrgCountry(e.target.value)} placeholder="اليمن" /></div>
              <div><label className="text-sm font-medium mb-2 block">المنطقة الزمنية</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" value={orgTimezone} onChange={e => setOrgTimezone(e.target.value)}>
                  <option value="Asia/Aden">Asia/Aden</option><option value="Asia/Riyadh">Asia/Riyadh</option><option value="UTC">UTC</option>
                </select>
              </div>
              <div><label className="text-sm font-medium mb-2 block">العملة</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" value={orgCurrency} onChange={e => setOrgCurrency(e.target.value)}>
                  <option value="YER">ريال يمني (YER)</option><option value="SAR">ريال سعودي (SAR)</option><option value="USD">دولار (USD)</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">اللغة</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" value={orgLocale} onChange={e => setOrgLocale(e.target.value)}>
                  <option value="ar">العربية</option><option value="en">English</option>
                </select>
              </div>
            </div>
            <Button onClick={handleSaveGeneral} disabled={saveOrg.isPending}>
              {saveOrg.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ الإعدادات
            </Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="branch">
          <Card><CardHeader><CardTitle>الفروع</CardTitle><CardDescription>الفرع الحالي: {branch?.name ?? "—"}</CardDescription></CardHeader>
          <CardContent>
            {(branches ?? []).length === 0 ? <p className="text-muted-foreground text-sm">لا توجد فروع</p> : (
              <div className="space-y-3">
                {(branches ?? []).map(b => (
                  <div key={b.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div><p className="font-medium">{b.name}</p><p className="text-sm text-muted-foreground">{b.city ?? "—"} • {b.code}</p></div>
                    <Badge variant={b.id === branch?.id ? "success" : "secondary"}>{b.id === branch?.id ? "الفرع الحالي" : b.is_active ? "نشط" : "غير نشط"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card><CardHeader><CardTitle>العلامة التجارية</CardTitle><CardDescription>محفوظة في قاعدة البيانات</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium mb-2 block">اللون الرئيسي</label>
                <div className="flex items-center gap-3"><input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer" /><Input value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-32" /></div>
              </div>
              <div><label className="text-sm font-medium mb-2 block">اللون الثانوي</label>
                <div className="flex items-center gap-3"><input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer" /><Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-32" /></div>
              </div>
            </div>
            <div className="p-4 rounded-lg border flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: brandColor }}><span className="text-white font-bold text-xl">م</span></div>
              <div><p className="font-medium">معاينة</p><p className="text-sm text-muted-foreground">اللون الرئيسي المستخدم في النظام</p></div>
            </div>
            <Button onClick={handleSaveBranding} disabled={saveOrg.isPending}>{saveOrg.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="academic">
          <div className="space-y-6">
            <Card><CardHeader><CardTitle>الأعوام الدراسية</CardTitle><CardDescription>محفوظة في Supabase</CardDescription></CardHeader>
          <CardContent>
            {(academicYears ?? []).length === 0 ? <p className="text-muted-foreground text-sm">لا توجد أعوام دراسية</p> : (
              <div className="space-y-3">
                {(academicYears ?? []).map(y => (
                  <div key={y.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div><p className="font-medium">{y.name}</p><p className="text-sm text-muted-foreground">{y.code} • {y.start_date} إلى {y.end_date}</p></div>
                    <div className="flex gap-2">
                      {y.is_current && <Badge variant="success">الحالي</Badge>}
                      <Badge variant={y.is_active ? "default" : "secondary"}>{y.is_active ? "نشط" : "غير نشط"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>

            <Card><CardHeader><CardTitle>الفصول الدراسية</CardTitle></CardHeader>
          <CardContent>
            {(semesters ?? []).length === 0 ? <p className="text-muted-foreground text-sm">لا توجد فصول دراسية</p> : (
              <div className="space-y-3">
                {(semesters ?? []).map(s => (
                  <div key={s.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div><p className="font-medium">{s.name}</p><p className="text-sm text-muted-foreground">{s.code} • {s.start_date} إلى {s.end_date}</p></div>
                    <div className="flex gap-2">
                      {s.is_current && <Badge variant="success">الحالي</Badge>}
                      <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? "نشط" : "غير نشط"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> الأمان</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><p className="text-sm font-medium">تسجيل محاولات الدخول</p><p className="text-xs text-muted-foreground">حفظ سجل محاولات تسجيل الدخول</p></div>
              <input type="checkbox" className="h-4 w-4 rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><p className="text-sm font-medium">نسخ احتياطي تلقائي</p><p className="text-xs text-muted-foreground">نسخ يومي</p></div>
              <input type="checkbox" className="h-4 w-4 rounded" defaultChecked />
            </div>
            <Button variant="outline"><Database className="ml-2 h-4 w-4" /> إنشاء نسخة احتياطية الآن</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
