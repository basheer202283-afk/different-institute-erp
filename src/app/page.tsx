import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  { title: "Student Management", desc: "Complete student lifecycle from enrollment to graduation" },
  { title: "Academic Management", desc: "Courses, classes, schedules, and curriculum" },
  { title: "Finance & Billing", desc: "Invoicing, payments, scholarships, and reporting" },
  { title: "Attendance Tracking", desc: "Real-time attendance monitoring with automated alerts" },
  { title: "Reports & Analytics", desc: "Comprehensive dashboards and customizable reports" },
  { title: "Enterprise Security", desc: "Role-based access control with tenant isolation" },
];

const benefits = [
  "Multi-tenant architecture for unlimited institutes",
  "Real-time data synchronization",
  "Role-based access control (RBAC)",
  "Complete audit trail",
  "API-first design",
  "Responsive design for all devices",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Different ERP</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild><Link href="/auth/login">Sign In</Link></Button>
            <Button asChild><Link href="/auth/register">Get Started</Link></Button>
          </div>
        </div>
      </header>

      <section className="container py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Manage Your <span className="text-primary">Institute</span> with Confidence</h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">A comprehensive, multi-tenant ERP platform designed specifically for training institutes.</p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild><Link href="/auth/register">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="#features">Learn More</Link></Button>
          </div>
        </div>
      </section>

      <section id="features" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything You Need</h2>
          <p className="mt-4 text-lg text-muted-foreground">Powerful modules to manage every aspect of your institute</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="group relative rounded-lg border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Built for Scale & Security</h2>
            <p className="mt-4 text-lg text-muted-foreground">Enterprise-grade architecture with complete data isolation.</p>
            <div className="mt-8 space-y-4">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /><span>{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
            <div className="relative rounded-xl border bg-card p-8 shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Active Students", value: "2,847" },
                  { label: "Attendance Rate", value: "94.2%" },
                  { label: "Revenue (MTD)", value: "$128K" },
                  { label: "Active Courses", value: "156" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-24">
        <div className="rounded-2xl bg-primary p-8 md:p-16 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">Ready to Transform Your Institute?</h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">Join hundreds of training institutes already using Different ERP.</p>
          <div className="mt-8"><Button size="lg" variant="secondary" asChild><Link href="/auth/register">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><GraduationCap className="h-6 w-6 text-primary" /><span className="font-bold">Different ERP</span></div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Different Institute ERP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
