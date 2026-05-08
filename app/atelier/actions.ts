"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_STEPS, type IdeaStep, type IdeaType } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return { supabase, user };
}

const captureSchema = z.object({
  title: z.string().trim().min(1, "Give it a name").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  type: z.enum(["photo", "video", "series", "mixed", "other"]).default("other"),
  energy: z.coerce.number().int().min(1).max(5).optional(),
  tags: z.string().trim().optional(),
});

export async function captureSpark(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const parsed = captureSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type") || "other",
    energy: formData.get("energy") || undefined,
    tags: formData.get("tags"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "invalid input");
  }
  const tags = parsed.data.tags
    ? parsed.data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const { error } = await supabase.from("ideas").insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    type: parsed.data.type as IdeaType,
    energy: parsed.data.energy ?? null,
    tags,
    steps: DEFAULT_STEPS,
    status: "spark",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/atelier");
}

export async function activateIdea(id: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: existingActive } = await supabase
    .from("ideas")
    .select("id, title")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (existingActive) {
    throw new Error(
      `One thing at a time. Finish or archive "${existingActive.title}" first.`,
    );
  }

  const { error } = await supabase
    .from("ideas")
    .update({
      status: "active",
      activated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/atelier");
  revalidatePath(`/atelier/idea/${id}`);
}

export async function completeIdea(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("ideas")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/atelier");
  revalidatePath("/atelier/archive");
}

export async function archiveIdea(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("ideas")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/atelier");
  revalidatePath("/atelier/archive");
}

export async function unarchiveIdea(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("ideas")
    .update({ status: "spark", archived_at: null })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/atelier");
  revalidatePath("/atelier/archive");
}

export async function deleteIdea(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/atelier");
  revalidatePath("/atelier/archive");
}

const updateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  type: z.enum(["photo", "video", "series", "mixed", "other"]),
  weekly_step: z.string().trim().max(280).optional().or(z.literal("")),
  notes: z.string().trim().max(8000).optional().or(z.literal("")),
  energy: z.coerce.number().int().min(1).max(5).optional(),
  tags: z.string().trim().optional(),
  inspiration_urls: z.string().trim().optional(),
});

export async function updateIdea(id: string, formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const parsed = updateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    weekly_step: formData.get("weekly_step"),
    notes: formData.get("notes"),
    energy: formData.get("energy") || undefined,
    tags: formData.get("tags"),
    inspiration_urls: formData.get("inspiration_urls"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "invalid input");
  }
  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const inspiration_urls = parsed.data.inspiration_urls
    ? parsed.data.inspiration_urls
        .split(/\s+|,/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const { error } = await supabase
    .from("ideas")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type,
      weekly_step: parsed.data.weekly_step || null,
      notes: parsed.data.notes || null,
      energy: parsed.data.energy ?? null,
      tags,
      inspiration_urls,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/atelier");
  revalidatePath(`/atelier/idea/${id}`);
}

export async function toggleStep(
  id: string,
  stepIndex: number,
): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data: idea } = await supabase
    .from("ideas")
    .select("steps, step_index")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!idea) throw new Error("not found");

  const steps = (idea.steps as IdeaStep[]) || [];
  if (!steps[stepIndex]) throw new Error("step out of range");
  steps[stepIndex] = { ...steps[stepIndex], done: !steps[stepIndex].done };
  const newIndex = steps.findIndex((s) => !s.done);

  const { error } = await supabase
    .from("ideas")
    .update({
      steps,
      step_index: newIndex === -1 ? steps.length - 1 : newIndex,
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/atelier");
  revalidatePath(`/atelier/idea/${id}`);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/atelier/login");
}
