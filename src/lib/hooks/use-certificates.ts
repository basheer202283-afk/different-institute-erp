"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type {
  Certificate,
  CertificateWithRelations,
  CertificateFormData,
  CertificateFilters,
  CertificateStats,
  CertificateTemplate,
  PaginatedResponse,
} from "@/lib/types/certificate";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// CERTIFICATE HOOKS
// ============================================================

export function useCertificates(filters: CertificateFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { search, status, course_id, template_id, date_from, date_to, page = 1, pageSize = 10 } = filters;

  return useQuery({
    queryKey: ["certificates", organization?.id, search, status, course_id, template_id, date_from, date_to, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Certificate>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase
        .from("certificates")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (search) query = query.or(`title.ilike.%${search}%,certificate_number.ilike.%${search}%,title_ar.ilike.%${search}%`);
      if (status) query = query.eq("status", status);
      if (course_id) query = query.eq("course_id", course_id);
      if (template_id) query = query.eq("template_id", template_id);
      if (date_from) query = query.gte("issue_date", date_from);
      if (date_to) query = query.lte("issue_date", date_to);

      const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;

      return {
        data: (data ?? []) as Certificate[],
        count: count ?? 0, page, pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    enabled: !!organization,
  });
}

export function useCertificate(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["certificates", id],
    queryFn: async (): Promise<CertificateWithRelations | null> => {
      const { data, error } = await supabase.from("certificates").select("*").eq("id", id).single();
      if (error) throw error;
      if (!data) return null;

      const cert = data as unknown as Certificate;
      const result: CertificateWithRelations = { ...cert };

      if (cert.student_id) {
        const { data: student } = await supabase
          .from("students")
          .select("id, student_number, first_name_ar, last_name_ar, first_name_en, last_name_en, photo_url")
          .eq("id", cert.student_id).single();
        if (student) result.student = student as any;
      }

      if (cert.course_id) {
        const { data: course } = await supabase
          .from("courses").select("id, name, code").eq("id", cert.course_id).single();
        if (course) result.course = course as any;
      }

      if (cert.template_id) {
        const { data: tpl } = await supabase
          .from("certificate_templates").select("id, name, name_ar").eq("id", cert.template_id).single();
        if (tpl) result.template = tpl as any;
      }

      if (cert.issued_by) {
        const { data: issuer } = await supabase
          .from("profiles").select("id, first_name, last_name, display_name").eq("id", cert.issued_by).single();
        if (issuer) result.issuer = issuer as any;
      }

      return result;
    },
    enabled: !!id,
  });
}

export function useStudentCertificates(studentId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["certificates", "student", studentId],
    queryFn: async (): Promise<Certificate[]> => {
      const { data, error } = await supabase
        .from("certificates").select("*").eq("student_id", studentId)
        .is("deleted_at", null).order("issue_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Certificate[];
    },
    enabled: !!studentId,
  });
}

export function useCreateCertificate() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CertificateFormData) => {
      if (!organization) throw new Error("No organization");

      const certNumber = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const verificationUrl = `${baseUrl}/verify/${certNumber}`;

      const insertData = {
        student_id: formData.student_id,
        course_id: formData.course_id || null,
        enrollment_id: formData.enrollment_id || null,
        template_id: formData.template_id || null,
        organization_id: organization.id,
        certificate_number: certNumber,
        title: formData.title,
        title_ar: formData.title_ar || null,
        description: formData.description || null,
        issue_date: formData.issue_date || new Date().toISOString().split("T")[0],
        expiry_date: formData.expiry_date || null,
        status: formData.status || "draft",
        grade: formData.grade || null,
        score: formData.score || null,
        hours_completed: formData.hours_completed || null,
        qr_code: verificationUrl,
        verification_url: verificationUrl,
      };

      const { data: cert, error } = await (supabase.from("certificates") as any)
        .insert(insertData).select().single();
      if (error) throw error;
      return cert as Certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("تم إنشاء الشهادة بنجاح");
    },
    onError: (error: Error) => {
      toast.error(`خطأ في إنشاء الشهادة: ${error.message}`);
    },
  });
}

export function useUpdateCertificate() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CertificateFormData> }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.course_id !== undefined) updateData.course_id = data.course_id || null;
      if (data.template_id !== undefined) updateData.template_id = data.template_id || null;

      const { data: cert, error } = await (supabase.from("certificates") as any)
        .update(updateData).eq("id", id).select().single();
      if (error) throw error;
      return cert as Certificate;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      queryClient.invalidateQueries({ queryKey: ["certificates", variables.id] });
      toast.success("تم تحديث الشهادة بنجاح");
    },
    onError: (error: Error) => {
      toast.error(`خطأ في تحديث الشهادة: ${error.message}`);
    },
  });
}

export function useIssueCertificate() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const certNumber = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const verificationUrl = `${baseUrl}/verify/${certNumber}`;

      const { error } = await (supabase.from("certificates") as any)
        .update({
          status: "active",
          certificate_number: certNumber,
          qr_code: verificationUrl,
          verification_url: verificationUrl,
          issue_date: new Date().toISOString().split("T")[0],
        }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("تم إصدار الشهادة بنجاح");
    },
    onError: (error: Error) => {
      toast.error(`خطأ في إصدار الشهادة: ${error.message}`);
    },
  });
}

export function useRevokeCertificate() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await (supabase.from("certificates") as any)
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
          revoke_reason: reason,
        }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("تم إلغاء الشهادة بنجاح");
    },
    onError: (error: Error) => {
      toast.error(`خطأ في إلغاء الشهادة: ${error.message}`);
    },
  });
}

export function useDeleteCertificate() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("certificates") as any)
        .update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("تم حذف الشهادة بنجاح");
    },
    onError: (error: Error) => {
      toast.error(`خطأ في حذف الشهادة: ${error.message}`);
    },
  });
}

// ============================================================
// CERTIFICATE VERIFICATION
// ============================================================

export function useVerifyCertificate(certificateNumber: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["certificate-verify", certificateNumber],
    queryFn: async (): Promise<CertificateWithRelations | null> => {
      const { data, error } = await supabase
        .from("certificates").select("*")
        .eq("certificate_number", certificateNumber)
        .eq("status", "active")
        .is("deleted_at", null).single();

      if (error) return null;
      if (!data) return null;

      const cert = data as unknown as Certificate;
      const result: CertificateWithRelations = { ...cert };

      if (cert.student_id) {
        const { data: student } = await supabase
          .from("students")
          .select("id, student_number, first_name_ar, last_name_ar, first_name_en, last_name_en")
          .eq("id", cert.student_id).single();
        if (student) result.student = student as any;
      }
      if (cert.course_id) {
        const { data: course } = await supabase
          .from("courses").select("id, name, code").eq("id", cert.course_id).single();
        if (course) result.course = course as any;
      }
      return result;
    },
    enabled: !!certificateNumber,
  });
}

// ============================================================
// CERTIFICATE TEMPLATES
// ============================================================

export function useCertificateTemplates() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["certificate-templates", organization?.id],
    queryFn: async (): Promise<CertificateTemplate[]> => {
      if (!organization) return [];
      const { data, error } = await supabase
        .from("certificate_templates")
        .select("*")
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("name");
      if (error) throw error;
      return (data ?? []) as CertificateTemplate[];
    },
    enabled: !!organization,
  });
}

export function useCreateTemplate() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; name_ar?: string; description?: string; template_type?: string; layout_html?: string; is_default?: boolean }) => {
      if (!organization) throw new Error("No organization");

      const { data: tpl, error } = await (supabase.from("certificate_templates") as any)
        .insert({
          ...data,
          organization_id: organization.id,
          is_active: true,
          layout_html: data.layout_html || "<div>{{content}}</div>",
        }).select().single();
      if (error) throw error;
      return tpl as CertificateTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
      toast.success("تم إنشاء القالب بنجاح");
    },
    onError: (error: Error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });
}

// ============================================================
// CERTIFICATE STATS
// ============================================================

export function useCertificateStats() {
  const { organization } = useTenant();
  const supabase = createClient();

  return useQuery({
    queryKey: ["certificate-stats", organization?.id],
    queryFn: async (): Promise<CertificateStats> => {
      if (!organization) return { total: 0, active: 0, revoked: 0, expired: 0, issued_this_month: 0, issued_this_year: 0 };

      const { data: certs } = await supabase
        .from("certificates")
        .select("status, issue_date")
        .eq("organization_id", organization.id)
        .is("deleted_at", null);

      const rows = (certs ?? []) as Array<{ status: string; issue_date: string }>;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const stats: CertificateStats = { total: rows.length, active: 0, revoked: 0, expired: 0, issued_this_month: 0, issued_this_year: 0 };

      for (const row of rows) {
        if (row.status === "active") stats.active++;
        if (row.status === "revoked") stats.revoked++;
        if (row.status === "expired") stats.expired++;
        if (row.issue_date) {
          const d = new Date(row.issue_date);
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) stats.issued_this_month++;
          if (d.getFullYear() === currentYear) stats.issued_this_year++;
        }
      }
      return stats;
    },
    enabled: !!organization,
  });
}
