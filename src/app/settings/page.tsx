"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/lib/hooks/use-tenant";
import { useAuth } from "@/lib/hooks/use-auth";
import { Settings, Building2, MapPin, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const { organization, branch } = useTenant();
  const { can } = useAuth();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [orgForm, setOrgForm] = useState({
    name: organization?.name || "",
    email: organization?.email || "",
    phone: organization?.phone || "",
    website: organization?.website || "",
    brand_color: organization?.brand_color || "#3B82F6",
    address: organization?.address || "",
    city: organization?.city || "",
    country: organization?.country || "YE",
  });

  const handleSaveOrg = async () => {
    if (!organization) return;
    setSaving(true);
    const { error } = await (supabase.from("organizations") as unknown as { update: (data: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } })
      .update(orgForm as Record<string, unknown>)
      .eq("id", organization.id);
    
    if (error) {
      toast.error("فشل حفظ الإعدادات");
    } else {
      toast.success("تم حفظ الإعدادات بنجاح");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground">إعدادات النظام والمعهد</p>
      </div>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            إعدادات المنظمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">اسم المنظمة</label>
              <Input
                value={orgForm.name}
                onChange={(e) => setOrgForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <Input
                type="email"
                value={orgForm.email}
                onChange={(e) => setOrgForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">رقم الهاتف</label>
              <Input
                value={orgForm.phone}
                onChange={(e) => setOrgForm((f) => ({ ...f, phone: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">الموقع الإلكتروني</label>
              <Input
                value={orgForm.website}
                onChange={(e) => setOrgForm((f) => ({ ...f, website: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">لون العلامة التجارية</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="color"
                  value={orgForm.brand_color}
                  onChange={(e) => setOrgForm((f) => ({ ...f, brand_color: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={orgForm.brand_color}
                  onChange={(e) => setOrgForm((f) => ({ ...f, brand_color: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">العنوان</label>
              <Input
                value={orgForm.address}
                onChange={(e) => setOrgForm((f) => ({ ...f, address: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">المدينة</label>
              <Input
                value={orgForm.city}
                onChange={(e) => setOrgForm((f) => ({ ...f, city: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">الدولة</label>
              <Input
                value={orgForm.country}
                onChange={(e) => setOrgForm((f) => ({ ...f, country: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveOrg} disabled={saving}>
              {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
              حفظ الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Branch Info */}
      {branch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              معلومات الفرع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">اسم الفرع</p>
                <p className="font-medium">{branch.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الرمز</p>
                <p className="font-medium">{branch.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المدينة</p>
                <p className="font-medium">{branch.city || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">العنوان</p>
                <p className="font-medium">{branch.address_line1 || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            معلومات النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">إصدار النظام</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المنطقة الزمنية</p>
              <p className="font-medium">{organization?.timezone || "Asia/Aden"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">العملة</p>
              <p className="font-medium">{organization?.currency || "YER"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">اللغة</p>
              <p className="font-medium">{organization?.locale === "ar" ? "العربية" : "English"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
