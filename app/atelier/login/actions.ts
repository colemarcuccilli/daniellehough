"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().email(),
  next: z.string().optional().default("/atelier"),
});

export async function sendMagicLink(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") || "/atelier",
  });
  if (!parsed.success) {
    throw new Error("Please give a valid email.");
  }

  const owner = process.env.ATELIER_OWNER_EMAIL?.trim().toLowerCase();
  const requested = parsed.data.email.toLowerCase();

  // Allowlist enforcement: silently succeed for non-owners so we don't
  // leak who has access. Only actually send the link if it matches.
  if (!owner || requested !== owner) {
    // small artificial delay would normally guard timing — Supabase already
    // returns generic responses, but we skip the call entirely here.
    return;
  }

  const h = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: requested,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
        parsed.data.next,
      )}`,
      shouldCreateUser: true,
    },
  });

  if (error) throw new Error(error.message);
}
