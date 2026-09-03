import type { Inquiry } from "@/lib/types";
import { INQUIRY_KINDS } from "@/lib/types";

const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

/**
 * Best-effort email notification for a new inquiry. Silently skipped when
 * RESEND_API_KEY / INQUIRY_NOTIFY_EMAIL are not configured. Never throws.
 */
export async function notifyNewInquiry(inquiry: Inquiry, adminUrl: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFY_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL || "Dani Cams <onboarding@resend.dev>";
  if (!key || !to) return { skipped: true as const };

  const rows: Array<[string, string | null]> = [
    ["Type", INQUIRY_KINDS[inquiry.kind]],
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Company", inquiry.company],
    ["Budget", inquiry.budget],
    ["Timeline", inquiry.timeline],
    ["Location", inquiry.location],
  ];
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1b1d1e">
      <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8a9194;margin:0 0 8px">New inquiry · Dani Cams</p>
      <h1 style="font-size:22px;margin:0 0 16px">${esc(inquiry.name)} — ${esc(INQUIRY_KINDS[inquiry.kind])}</h1>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:6px 8px 6px 0;color:#8a9194;vertical-align:top;width:110px">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`).join("")}
      </table>
      <div style="margin:20px 0;padding:16px;border:1px solid #e4dcc9;border-radius:6px;white-space:pre-wrap;font-size:15px;line-height:1.5">${esc(inquiry.message)}</div>
      <p><a href="${esc(adminUrl)}" style="display:inline-block;background:#f8c858;color:#1b1d1e;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600;border:1px solid #1b1d1e">Open in admin</a></p>
      <p style="font-size:12px;color:#8a9194">Reply directly to this email to answer ${esc(inquiry.name)}.</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: inquiry.email,
        subject: `New inquiry: ${inquiry.name} · ${INQUIRY_KINDS[inquiry.kind]}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("resend error", res.status, await res.text());
      return { skipped: false as const, ok: false as const };
    }
    return { skipped: false as const, ok: true as const };
  } catch (err) {
    console.error("resend request failed", err);
    return { skipped: false as const, ok: false as const };
  }
}
