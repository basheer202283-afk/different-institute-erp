"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">401</h1>
          <h2 className="text-xl font-semibold mt-2">Unauthorized Access</h2>
          <p className="text-muted-foreground mt-2">You need to be signed in to access this page.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" asChild><Link href="/auth/login"><ArrowLeft className="mr-2 h-4 w-4" /> Sign In</Link></Button>
          <Button asChild><Link href="/"><Home className="mr-2 h-4 w-4" /> Home</Link></Button>
        </div>
      </motion.div>
    </div>
  );
}
