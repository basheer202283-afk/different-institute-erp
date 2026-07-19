"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Building2, Palette, GraduationCap, CreditCard, Bell, Shield, Database, Users, Mail, Globe, Save, Loader2, CheckCircle2, Lock, Key } from "lucide-react";
import { useTenant } from "@/lib/hooks/use-tenant";

export default function SettingsPage() {
  const { organization, branch, branches } = useTenant();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
          <p className="text-muted-foreground">إعدادات النظام والمعهد</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general"><Settings className="ml-1 h-4 w-4" /> عام</TabsTrigger>
          <TabsTrigger value="branch"><Building2 className="ml-1 h-4 w-4" /> الفرع</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="ml-1 h-4 w-4" /> العلامة التجارية</TabsTrigger>
          <TabsTrigger value="academic"><GraduationCap className="ml-1 h-4 w-4" /> الأكاديمي</TabsTrigger>
          <TabsTrigger value="finance"><CreditCard className="ml-1 h-4 w-4" /> المالية</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="ml-1 h-4 w-4" /> الإشعارات</TabsTrigger>
          <TabsTrigger value="security"><Shield className="ml-1 h-4 w-4" /> الأمان</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>إعدادات المعهد الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="text-sm font-medium mb-2 block">اسم المعهد</label><Input defaultValue={organization?.name ?? ""} placeholder="معهد المختلفة للتدريب النسائي" /></div>
                <div><label className="text-sm font-medium mb-2 block">الاسم القانوني</label><Input defaultValue={organization?.legal_name ?? ""} placeholder="..." /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="text-sm font-medium mb-2 block">البريد الإلكتروني</label><Input type="email" defaultValue={organization?.email ?? ""} placeholder="info@..." /></div>
                <div><label className="text-sm font-medium mb-2 block">الهاتف</label><Input defaultValue={organization?.phone ?? ""} placeholder="+967..." /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="text-sm font-medium mb-2 block">الموقع الإلكتروني</label><Input defaultValue={organization?.website ?? ""} placeholder="https://..." /></div>
                <div><label className="text-sm font-medium mb-2 block">الشعار</label><Input defaultValue={organization?.tagline ?? ""} placeholder="شعار المعهد" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div><label className="text-sm font-medium mb-2 block">المدينة</label><Input defaultValue={organization?.city ?? ""} placeholder="عدن" /></div>
                <div><label className="text-sm font-medium mb-2 block">الدولة</label><Input defaultValue={organization?.country ?? ""} placeholder="اليمن" /></div>
                <div><label className="text-sm font-medium mb-2 block">المنطقة الزمنية</label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" defaultValue={organization?.timezone ?? "Asia/Aden"}>
                    <option value="Asia/Aden">Asia/Aden</option><option value="Asia/Riyadh">Asia/Riyadh</option><option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="text-sm font-medium mb-2 block">اللغة</label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" defaultValue={organization?.locale ?? "ar"}>
                    <option value="ar">العربية</option><option value="en">English</option>
                  </select>
                </div>
                <div><label className="text-sm font-medium mb-2 block">العملة</label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm" defaultValue={organization?.currency ?? "YER"}>
                    <option value="YER">ريال يمني (YER)</option><option value="SAR">ريال سعودي (SAR)</option><option value="USD">دولار (USD)</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ الإعدادات</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branch Settings */}
        <TabsContent value="branch">
          <Card>
            <CardHeader><CardTitle>إعدادات الفرع</CardTitle><CardDescription>الفرع الحالي: {branch?.name ?? "—"}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {(branches ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">لا توجد فروع مسجلة</p>
              ) : (
                <div className="space-y-3">
                  {(branches ?? []).map(b => (
                    <div key={b.id} className="p-4 rounded-lg border flex items-center justify-between">
                      <div>
                        <p className="font-medium">{b.name}</p>
                        <p className="text-sm text-muted-foreground">{b.city ?? "—"} • {b.code}</p>
                      </div>
                      <Badge variant={b.id === branch?.id ? "success" : "secondary"}>{b.id === branch?.id ? "الفرع الحالي" : b.is_active ? "نشط" : "غير نشط"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <Card>
            <CardHeader><CardTitle>العلامة التجارية</CardTitle><CardDescription>تخصيص مظهر النظام</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="text-sm font-medium mb-2 block">اللون الرئيسي</label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue={organization?.brand_color ?? "#6366f1"} className="h-10 w-10 rounded cursor-pointer" />
                    <Input defaultValue={organization?.brand_color ?? "#6366f1"} className="w-32" />
                  </div>
                </div>
                <div><label className="text-sm font-medium mb-2 block">اللون الثانوي</label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue={organization?.secondary_color ?? "#8b5cf6"} className="h-10 w-10 rounded cursor-pointer" />
                    <Input defaultValue={organization?.secondary_color ?? "#8b5cf6"} className="w-32" />
                  </div>
                </div>
              </div>
              <div><label className="text-sm font-medium mb-2 block">شعار المعهد (URL)</label><Input defaultValue={organization?.logo_url ?? ""} placeholder="https://..." /></div>
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Settings */}
        <TabsContent value="academic">
          <Card>
            <CardHeader><CardTitle>الإعدادات الأكاديمية</CardTitle><CardDescription>إعدادات الفصول والبرامج</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="text-sm font-medium mb-2 block">الحد الأقصى للطالبات لكل فصل</label><Input type="number" defaultValue="30" /></div>
                <div><label className="text-sm font-medium mb-2 block">الحد الأدنى للطالبات لكل فصل</label><Input type="number" defaultValue="5" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="text-sm font-medium mb-2 block">مدة الفصل الدراسي (أيام)</label><Input type="number" defaultValue="90" /></div>
                <div><label className="text-sm font-medium mb-2 block">نسبة الحضور المطلوبة %</label><Input type="number" defaultValue="75" /></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <input type="checkbox" id="auto-enroll" className="h-4 w-4 rounded" defaultChecked />
                <label htmlFor="auto-enroll" className="text-sm">التسجيل التلقائي للطالبات في الدورات</label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <input type="checkbox" id="waiting-list" className="h-4 w-4 rounded" defaultChecked />
                <label htmlFor="waiting-list" className="text-sm">تفعيل قائمة الانتظار للدورات الممتلئة</label>
              </div>
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Settings */}
        <TabsContent value="finance">
          <Card>
            <CardHeader><CardTitle>الإعدادات المالية</CardTitle><CardDescription>إعدادات الفواتير والمدفوعات</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="text-sm font-medium mb-2 block">بادئة رقم الفاتورة</label><Input defaultValue="INV" placeholder="INV" /></div>
                <div><label className="text-sm font-medium mb-2 block">بادئة رقم الدفعة</label><Input defaultValue="PAY" placeholder="PAY" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="text-sm font-medium mb-2 block">مهلة الدفع (أيام)</label><Input type="number" defaultValue="30" /></div>
                <div><label className="text-sm font-medium mb-2 block">نسبة الضريبة %</label><Input type="number" defaultValue="0" /></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <input type="checkbox" id="auto-invoice" className="h-4 w-4 rounded" defaultChecked />
                <label htmlFor="auto-invoice" className="text-sm">إنشاء فاتورة تلقائية عند التسجيل</label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <input type="checkbox" id="late-fee" className="h-4 w-4 rounded" />
                <label htmlFor="late-fee" className="text-sm">تطبيق رسوم التأخير</label>
              </div>
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>إعدادات الإشعارات</CardTitle><CardDescription>تخصيص الإشعارات</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">إشعارات الحضور</p><p className="text-xs text-muted-foreground">إشعار عند غياب الطالبة</p></div>
                <input type="checkbox" className="h-4 w-4 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">تذكيرات الدفع</p><p className="text-xs text-muted-foreground">تذكير قبل موعد الدفع</p></div>
                <input type="checkbox" className="h-4 w-4 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">إشعارات التسجيل</p><p className="text-xs text-muted-foreground">إشعار عند التسجيل أو الإلغاء</p></div>
                <input type="checkbox" className="h-4 w-4 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">إشعارات البريد الإلكتروني</p><p className="text-xs text-muted-foreground">إرسال نسخة بالبريد</p></div>
                <input type="checkbox" className="h-4 w-4 rounded" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">إشعارات SMS</p><p className="text-xs text-muted-foreground">إرسال رسائل نصية</p></div>
                <input type="checkbox" className="h-4 w-4 rounded" />
              </div>
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> الأمان والمصادقة</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><label className="text-sm font-medium mb-2 block">مدة صلاحية الجلسة (دقيقة)</label><Input type="number" defaultValue="480" /></div>
                  <div><label className="text-sm font-medium mb-2 block">الحد الأقصى لمحاولات تسجيل الدخول</label><Input type="number" defaultValue="5" /></div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">المصادقة الثنائية</p><p className="text-xs text-muted-foreground">تفعيل 2FA للمستخدمين</p></div>
                  <input type="checkbox" className="h-4 w-4 rounded" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">فرض تغيير كلمة المرور</p><p className="text-xs text-muted-foreground">كل 90 يوم</p></div>
                  <input type="checkbox" className="h-4 w-4 rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">تسجيل محاولات الدخول</p><p className="text-xs text-muted-foreground">حفظ سجل محاولات تسجيل الدخول</p></div>
                  <input type="checkbox" className="h-4 w-4 rounded" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> النسخ الاحتياطي</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">نسخ احتياطي تلقائي</p><p className="text-xs text-muted-foreground">نسخ يومي</p></div>
                  <input type="checkbox" className="h-4 w-4 rounded" defaultChecked />
                </div>
                <Button variant="outline"><Database className="ml-2 h-4 w-4" /> إنشاء نسخة احتياطية الآن</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> سجل التدقيق</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">آخر الأنشطة في النظام</p>
                <div className="space-y-2">
                  {["تسجيل دخول - مدير النظام", "تحديث بيانات طالبة", "إنشاء فاتورة جديدة", "إلغاء شهادة"].map((action, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded border text-sm">
                      <span>{action}</span>
                      <span className="text-xs text-muted-foreground">منذ {i + 1} ساعة</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
