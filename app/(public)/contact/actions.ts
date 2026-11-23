"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { notifyNewInquiry } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { ALL_INQUIRY_KINDS, PACKAGE_EXTRAS, type Inquiry, type InquiryKind } from "@/lib/types";

const schema = z.object({
  kind: z.enum(ALL_INQUIRY_KINDS as [InquiryKind, ...InquiryKind[]]).default("other"),
  name: z.string().trim().min(1, "Please add your name.").max(120),
  email: z.string().trim().email("That email doesn't look right.").max(200),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(160).optional(),
  message: z.string().trim().max(4500),
  partner: z.string().trim().max(120).optional(),
  budget: z.string().trim().max(80).optional(),
  timeline: z.string().trim().max(200).optional(),
  location: z.string().trim().max(160).optional(),
  source: z.string().trim().max(200).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export type InquiryResult = { ok: true } | { ok: false; error: string };

export async function submitInquiry(formData: FormData): Promise<InquiryResult> {
  const raw = Object.fromEntries(
    ["kind", "name", "email", "phone", "company", "message", "partner", "budget", "timeline", "location", "source", "website"].map((k) => [
      k,
      (formData.get(k) as string | null) ?? "",
    ]),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  if (parsed.data.website) return { ok: true }; // bot — pretend success

  // Cloudflare Turnstile, active only when the secret is configured.
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = (formData.get("cf-turnstile-response") as string | null) ?? "";
    const clientError = (formData.get("cf-turnstile-error") as string | null) ?? "";
    const h = await headers();
    if (!token) {
      // Widget configuration errors (1102xx: bad site key or hostname not on the
      // widget's allowlist) are not bot verdicts. Fall back to the honeypot so the
      // form never goes dead on an address that was not added in Cloudflare yet.
      if (/^1102\d{2}$/.test(clientError)) {
        console.warn(`turnstile skipped: widget error ${clientError} on host ${h.get("host") ?? "?"}`);
      } else {
        return { ok: false, error: "Please complete the verification and try again." };
      }
    } else {
      const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
      const valid = await verifyTurnstile(turnstileSecret, token, ip);
      if (!valid) return { ok: false, error: "Verification failed. Please try again." };
    }
  }

  // Partner name and package add-ons have no columns of their own; they travel
  // at the end of the message so the admin and the email both show them.
  const couple = ["wedding", "engagement", "save_the_date"].includes(parsed.data.kind);
  const picked = formData.getAll("extras").map(String);
  const extras = PACKAGE_EXTRAS.filter((e) => picked.includes(e.value)).map((e) => e.label);
  const details = [
    parsed.data.partner ? `Partner: ${parsed.data.partner}` : null,
    extras.length ? `Also interested in: ${extras.join(", ")}` : null,
  ].filter(Boolean);
  if (!couple && parsed.data.message.length < 10) {
    return { ok: false, error: "Tell me a little more (at least a sentence)." };
  }
  const message = [parsed.data.message || (couple ? "No message added." : ""), details.join("\n")].filter(Boolean).join("\n\n");

  const id = crypto.randomUUID();
  const row: Inquiry = {
    id,
    kind: parsed.data.kind,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone || null,
    company: parsed.data.company || null,
    message,
    budget: parsed.data.budget || null,
    timeline: parsed.data.timeline || null,
    location: parsed.data.location || null,
    source: parsed.data.source || null,
    status: "new",
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = createPublicClient();
  const { error } = await supabase.from("inquiries").insert({
    id: row.id,
    kind: row.kind,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    message: row.message,
    budget: row.budget,
    timeline: row.timeline,
    location: row.location,
    source: row.source,
  });
  if (error) {
    console.error("inquiry insert failed", error);
    return { ok: false, error: "Something went wrong sending that. Please email me directly instead." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://danicams.com";
  after(async () => {
    await notifyNewInquiry(row, `${siteUrl}/admin/inquiries/${id}`);
  });

  return { ok: true };
}
