"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(200),
  next: z.string().optional().default("/atelier"),
});

export async function signIn(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || "/atelier",
  });
  if (!parsed.success) {
    throw new Error("Email and password please.");
  }

  const owner = process.env.ATELIER_OWNER_EMAIL?.trim().toLowerCase();
  const requested = parsed.data.email.toLowerCase();

  // Allowlist enforcement — non-owners get a generic failure so we don't
  // leak who has access. We never even hit Supabase for them.
  if (!owner || requested !== owner) {
    throw new Error("That email and password don't match.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: requested,
    password: parsed.data.password,
  });

  if (error) {
    // Generic message — same shape regardless of which thing failed.
    throw new Error("That email and password don't match.");
  }
}
