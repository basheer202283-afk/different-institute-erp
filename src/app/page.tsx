import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Shield, Users, BookOpen } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold">معهد المختلفة</h1>
              <p className="text-[10px] text-muted-foreground">لتدريب النسائي</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild><Link href="/login">تسجيل الدخول</Link></Button>
            <Button asChild><Link href="/register">إنشاء حساب</Link></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl space-y-8">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-14 w-14 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold">معهد المختلفة للتدريب النسائي</h1>
            <p className="mt-4 text-lg text-muted-foreground">نظام إدارة متكامل لإدارة المعهد بكفاءة واحترافية</p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="p-4 rounded-xl bg-muted/50">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-medium">إدارة الطالبات</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-medium">الدورات</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-medium">الأمان</p>
            </div>
          </div>
          <Button size="lg" asChild>
            <Link href="/login">ابدأ الآن <ArrowLeft className="mr-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} معهد المختلفة للتدريب النسائي
      </footer>
    </div>
  );
}
