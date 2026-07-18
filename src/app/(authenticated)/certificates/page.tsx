"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Award, Plus, FileText, Download, QrCode, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CertificatesPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Certificates</h1><p className="text-muted-foreground">Generate and manage student certificates</p></div>
        <Button><Plus className="mr-2 h-4 w-4" /> Generate Certificate</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2 text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"><Award className="h-5 w-5" /></div><div><p className="text-2xl font-bold">0</p><p className="text-xs text-muted-foreground">Total Certificates</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2 text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"><FileText className="h-5 w-5" /></div><div><p className="text-2xl font-bold">0</p><p className="text-xs text-muted-foreground">Issued</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2 text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400"><QrCode className="h-5 w-5" /></div><div><p className="text-2xl font-bold">0</p><p className="text-xs text-muted-foreground">QR Verified</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2 text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"><Download className="h-5 w-5" /></div><div><p className="text-2xl font-bold">0</p><p className="text-xs text-muted-foreground">Downloaded</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Certificate Management</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search certificates..." className="pl-9" /></div>
          </div>
          <div className="text-center py-16">
            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-xl font-semibold">Certificate Management</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">Generate certificates for completed courses and programs. Each certificate includes QR verification for authenticity.</p>
            <Button className="mt-6"><Plus className="mr-2 h-4 w-4" /> Generate First Certificate</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
