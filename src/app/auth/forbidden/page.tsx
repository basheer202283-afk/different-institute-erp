"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-orange-500/5 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
          <ShieldOff className="h-12 w-12 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">403</h1>
          <h2 className="text-xl font-semibold mt-2">Access Forbidden</h2>
          <p className="text-muted-foreground mt-2">You don&apos;t have permission to access this resource. Contact your administrator for access.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" asChild><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link></Button>
          <Button asChild><Link href="/"><Home className="mr-2 h-4 w-4" /> Home</Link></Button>
        </div>
      </motion.div>
    </div>
  );
}
