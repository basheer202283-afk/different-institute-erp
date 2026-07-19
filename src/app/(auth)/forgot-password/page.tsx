"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap, Loader2, ArrowRight, CheckCircle2, Mail } from "lucide-react";

const schema = z.object({ email: z.string().email("البريد الإلكتروني غير صالح") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4" /> العودة لتسجيل الدخول
        </Link>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">استعادة كلمة المرور</h1>
          <p className="text-muted-foreground mt-1">أدخل بريدك الإلكتروني</p>
        </div>
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold">تحقق من بريدك الإلكتروني</h3>
                <p className="text-sm text-muted-foreground">لقد أرسلنا رابط استعادة كلمة المرور</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login"><Mail className="ml-2 h-4 w-4" /> العودة لتسجيل الدخول</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input type="email" {...register("email")} placeholder="name@example.com" className={errors.email ? "border-destructive" : ""} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الإرسال...</> : "إرسال رابط الاستعادة"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
