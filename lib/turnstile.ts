/**
 * Cloudflare Turnstile server-side validation (siteverify). Returns true when
 * the token is valid. Callers should skip the check entirely when
 * TURNSTILE_SECRET_KEY is not configured.
 */
export async function verifyTurnstile(secret: string, token: string, remoteIp?: string): Promise<boolean> {
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) console.warn("turnstile rejected", data["error-codes"]);
    return data.success === true;
  } catch (err) {
    console.error("turnstile siteverify failed", err);
    return false;
  }
}
