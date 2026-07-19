"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/hooks/use-tenant";
import type { Trainer, TrainerFormData, TrainerFilters, PaginatedResponse } from "@/lib/types/trainer";
import { toast } from "sonner";

// Fetch trainers with pagination and filters
export function useTrainers(filters: TrainerFilters = {}) {
  const { organization } = useTenant();
  const supabase = createClient();
  const { search, status, specialization, page = 1, pageSize = 10 } = filters;

  return useQuery({
    queryKey: ["trainers", organization?.id, search, status, specialization, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Trainer>> => {
      if (!organization) return { data: [], count: 0, page, pageSize, totalPages: 0 };

      let query = supabase
        .from("trainers")
        .select("*", { count: "exact" })
        .eq("organization_id", organization.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,specialization.ilike.%${search}%`
        );
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (specialization) {
        query = query.eq("specialization", specialization);
      }

      const { data, count, error } = await query
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return {
        data: (data ?? []) as Trainer[],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    enabled: !!organization,
  });
}

// Fetch single trainer
export function useTrainer(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["trainers", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Trainer;
    },
    enabled: !!id,
  });
}

// Create trainer
export function useCreateTrainer() {
  const { organization } = useTenant();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TrainerFormData) => {
      if (!organization) throw new Error("No organization");

      const insertData = {
        ...data,
        organization_id: organization.id,
        email: data.email || null,
        phone: data.phone || null,
        employee_number: data.employee_number || null,
        specialization: data.specialization || null,
        qualifications: data.qualifications || null,
        bio: data.bio || null,
        experience_years: data.experience_years ?? 0,
        hourly_rate: data.hourly_rate ?? null,
      };

      const { data: trainer, error } = await (supabase
        .from("trainers") as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return trainer as Trainer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      toast.success("تم إنشاء المدرب بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في إنشاء المدرب: ${error.message}`);
    },
  });
}

// Update trainer
export function useUpdateTrainer() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TrainerFormData> }) => {
      const updateData = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        employee_number: data.employee_number || null,
        specialization: data.specialization || null,
        qualifications: data.qualifications || null,
        bio: data.bio || null,
      };

      const { data: trainer, error } = await (supabase
        .from("trainers") as any)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return trainer as Trainer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      queryClient.invalidateQueries({ queryKey: ["trainers", variables.id] });
      toast.success("تم تحديث بيانات المدرب بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تحديث المدرب: ${error.message}`);
    },
  });
}

// Delete trainer (soft delete)
export function useDeleteTrainer() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from("trainers") as any)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      toast.success("تم حذف المدرب بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في حذف المدرب: ${error.message}`);
    },
  });
}

// Update trainer status
export function useUpdateTrainerStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Trainer['status'] }) => {
      const { error } = await (supabase
        .from("trainers") as any)
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      toast.success("تم تحديث حالة المدرب بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في تحديث الحالة: ${error.message}`);
    },
  });
}
