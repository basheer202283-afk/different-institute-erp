import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-14 w-14 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            معهد المختلفة
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            نظام إدارة المعهد - منصة متكاملة لإدارة التدريب والتعليم
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/login">
              تسجيل الدخول
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
