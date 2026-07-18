"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Settings, Globe, Palette, Bell, Shield, Database, Save, Loader2, Building2, Mail, Clock } from "lucide-react";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    instituteName: "Different Institute",
    email: "admin@differentinstitute.com",
    phone: "+967-123-4567",
    website: "https://differentinstitute.com",
    timezone: "Asia/Aden",
    currency: "YER",
    dateFormat: "YYYY-MM-DD",
    language: "en",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">System Settings</h1><p className="text-muted-foreground">Configure your institution settings</p></div>
        <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes</Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Building2 className="mr-2 h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" /> Appearance</TabsTrigger>
          <TabsTrigger value="localization"><Globe className="mr-2 h-4 w-4" /> Localization</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Institution Information</CardTitle><CardDescription>Basic information about your institution</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium">Institution Name</label><Input value={settings.instituteName} onChange={(e) => setSettings((s) => ({ ...s, instituteName: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={settings.email} onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={settings.phone} onChange={(e) => setSettings((s) => ({ ...s, phone: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-sm font-medium">Website</label><Input value={settings.website} onChange={(e) => setSettings((s) => ({ ...s, website: e.target.value }))} className="mt-1" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>System Health</CardTitle><CardDescription>Current system status</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Database", status: "Connected", ok: true },
                { label: "Authentication", status: "Active", ok: true },
                { label: "Storage", status: "Available", ok: true },
                { label: "Email Service", status: "Not Configured", ok: false },
                { label: "SMS Service", status: "Not Configured", ok: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{item.label}</span>
                  <Badge variant={item.ok ? "success" : "warning"}>{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Branding</CardTitle><CardDescription>Customize your institution appearance</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className="text-sm font-medium">Primary Color</label><div className="flex items-center gap-2 mt-1"><Input type="color" value={settings.primaryColor} onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value }))} className="w-16 h-10 p-1" /><Input value={settings.primaryColor} onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value }))} /></div></div>
              <div><label className="text-sm font-medium">Secondary Color</label><div className="flex items-center gap-2 mt-1"><Input type="color" value={settings.secondaryColor} onChange={(e) => setSettings((s) => ({ ...s, secondaryColor: e.target.value }))} className="w-16 h-10 p-1" /><Input value={settings.secondaryColor} onChange={(e) => setSettings((s) => ({ ...s, secondaryColor: e.target.value }))} /></div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Regional Settings</CardTitle><CardDescription>Configure timezone, currency, and date format</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div><label className="text-sm font-medium">Timezone</label><select value={settings.timezone} onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"><option value="Asia/Aden">Asia/Aden (Yemen)</option><option value="Asia/Dubai">Asia/Dubai (UAE)</option><option value="Asia/Riyadh">Asia/Riyadh (Saudi)</option><option value="UTC">UTC</option></select></div>
              <div><label className="text-sm font-medium">Currency</label><select value={settings.currency} onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"><option value="YER">YER - Yemeni Rial</option><option value="SAR">SAR - Saudi Riyal</option><option value="AED">AED - UAE Dirham</option><option value="USD">USD - US Dollar</option></select></div>
              <div><label className="text-sm font-medium">Date Format</label><select value={settings.dateFormat} onChange={(e) => setSettings((s) => ({ ...s, dateFormat: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"><option value="YYYY-MM-DD">YYYY-MM-DD</option><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option></select></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Notification Settings</CardTitle><CardDescription>Configure notification channels</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Email Notifications", desc: "Send notifications via email", enabled: true },
                { label: "SMS Notifications", desc: "Send notifications via SMS", enabled: false },
                { label: "WhatsApp Notifications", desc: "Send notifications via WhatsApp", enabled: false },
                { label: "Push Notifications", desc: "Send browser push notifications", enabled: false },
                { label: "In-App Notifications", desc: "Show notifications within the app", enabled: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-lg border">
                  <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Badge variant={item.enabled ? "success" : "secondary"}>{item.enabled ? "Enabled" : "Disabled"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Security Settings</CardTitle><CardDescription>Configure security policies</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Two-Factor Authentication", desc: "Require 2FA for all users", enabled: false },
                { label: "Session Timeout", desc: "Auto-logout after inactivity", value: "60 minutes" },
                { label: "Password Policy", desc: "Minimum password requirements", value: "8 chars, mixed case" },
                { label: "Login Attempts", desc: "Max failed login attempts", value: "5 attempts" },
                { label: "Audit Logging", desc: "Log all user actions", enabled: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-lg border">
                  <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  {item.enabled !== undefined ? (
                    <Badge variant={item.enabled ? "success" : "secondary"}>{item.enabled ? "Enabled" : "Disabled"}</Badge>
                  ) : (
                    <span className="text-sm font-medium">{item.value}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
