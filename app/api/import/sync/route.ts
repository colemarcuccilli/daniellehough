import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getAdmin } from "@/lib/admin";
import { DB_SCHEMA } from "@/lib/supabase/config";
import { syncGalleryFolders } from "@/lib/photos/sync";
import type { Db } from "@/lib/photos/ingest";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const BUDGET_MS = 240_000;
const MAX_HOPS = 60;

/**
 * Reconciles gallery folders in the originals bucket with the site.
 * Called by: the storage trigger (a poke after uploads), the Vercel cron
 * (a sweep), and the admin "Sync now" button. Secret callers run as the
 * import account (an ordinary admin); the admin button runs as that admin.
 * When work remains after the time budget, the run hands off to a new one.
 */
export async function GET(request: Request) {
  return run(request);
}
export async function POST(request: Request) {
  return run(request);
}

async function run(request: Request) {
  const url = new URL(request.url);
  const auth = await authorize(request);
  if (!auth) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const projectId = url.searchParams.get("project") || undefined;
  const hop = Number(url.searchParams.get("hop") || "0");
  const maxFiles = url.searchParams.get("max") ? Number(url.searchParams.get("max")) : undefined;

  try {
    const summary = await syncGalleryFolders(auth.supabase, { projectId, budgetMs: BUDGET_MS, maxFiles });
    if (summary.processed > 0) {
      revalidatePath("/", "layout");
      revalidatePath("/admin", "layout");
    }
    const progressed = summary.processed > 0 || summary.failed.length > 0;
    const secret = process.env.CRON_SECRET;
    if (summary.remaining > 0 && progressed && hop < MAX_HOPS && secret) {
      const next = new URL(url.pathname, process.env.NEXT_PUBLIC_SITE_URL || url.origin);
      if (projectId) next.searchParams.set("project", projectId);
      next.searchParams.set("hop", String(hop + 1));
      after(async () => {
        try {
          await fetch(next, { method: "POST", headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(10_000) });
        } catch {
          // The next run has started; the cron sweep covers anything that didn't.
        }
      });
    }
    return NextResponse.json({ ok: true, via: auth.via, hop, ...summary });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Sync failed" }, { status: 500 });
  }
}

async function authorize(request: Request): Promise<{ supabase: Db; via: "secret" | "admin" } | null> {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (secret && bearer && safeEqual(bearer, secret)) {
    const bot = await importAccountClient();
    return bot ? { supabase: bot, via: "secret" } : null;
  }
  const ctx = await getAdmin();
  return ctx ? { supabase: ctx.supabase as Db, via: "admin" } : null;
}

/** Signs in as the dedicated import account (a row in vh.admins), never a service key. */
async function importAccountClient(): Promise<Db | null> {
  const email = process.env.IMPORT_BOT_EMAIL;
  const password = process.env.IMPORT_BOT_PASSWORD;
  if (!email || !password) return null;
  const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("import account sign-in failed:", error.message);
    return null;
  }
  return supabase as Db;
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
