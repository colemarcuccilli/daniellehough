"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(200),
});

export type SignInResult = { ok: true } | { ok: false; error: string };

const GENERIC = "That email and password don't match.";

export async function signIn(formData: FormData): Promise<SignInResult> {
  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, error: "Email and password, please." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });
  if (error || !data.user) return { ok: false, error: GENERIC };

  // Only accounts listed in public.admins may enter. Anyone else is signed
  // straight back out and sees the same generic error as a bad password.
  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, error: GENERIC };
  }
  return { ok: true };
}
