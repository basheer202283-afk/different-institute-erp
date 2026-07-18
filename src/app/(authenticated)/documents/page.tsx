"use client";

import { useState } from "react";
import { useDocuments } from "@/lib/hooks/use-operations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { FileText, Upload, Download, Search, Loader2, Eye, File, Image, FileSpreadsheet } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";

type DocRow = { id: string; name: string; type: string; file_size: number | null; mime_type: string | null; created_at: string; is_public: boolean; description: string | null };

const typeColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary" | "outline"> = {
  contract: "default", agreement: "default", certificate: "success", receipt: "secondary", invoice: "warning", id_document: "outline", academic_record: "secondary", medical: "destructive", other: "outline",
};

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const { data: docsRaw, isLoading } = useDocuments({ type: type === "all" ? undefined : type, search });
  const docs = (docsRaw ?? []) as DocRow[];

  const getFileIcon = (mime: string | null) => {
    if (!mime) return File;
    if (mime.startsWith("image/")) return Image;
    if (mime.includes("spreadsheet") || mime.includes("excel")) return FileSpreadsheet;
    return FileText;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Documents</h1><p className="text-muted-foreground">Manage documents and files</p></div>
        <Button><Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search documents..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <div className="flex gap-2 flex-wrap">
              {["all", "contract", "certificate", "invoice", "receipt", "academic_record", "other"].map((t) => (
                <Button key={t} variant={type === t ? "default" : "outline"} size="sm" onClick={() => setType(t)}>
                  {t === "all" ? "All" : t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">All Documents ({docs.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : docs.length > 0 ? (
            <div className="space-y-2">
              {docs.map((doc) => {
                const FileIcon = getFileIcon(doc.mime_type);
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><FileIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={typeColors[doc.type] ?? "outline"} className="text-[10px]">{doc.type.replace("_", " ")}</Badge>
                          {doc.file_size && <span className="text-[10px] text-muted-foreground">{formatFileSize(doc.file_size)}</span>}
                          <span className="text-[10px] text-muted-foreground">{formatDate(doc.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.is_public && <Badge variant="outline" className="text-[10px]">Public</Badge>}
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12"><FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-semibold">No documents found</h3><p className="text-muted-foreground mt-1">Upload your first document to get started</p></div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
