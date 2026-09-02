import { createClient } from "@/lib/supabase/server";

export type AdminContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email: string | undefined };
  admin: { user_id: string; email: string; display_name: string | null };
};

/** Returns the signed-in admin, or null when the visitor is anonymous or not in `admins`. */
export async function getAdmin(): Promise<AdminContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id, email, display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return null;
  return { supabase, user: { id: user.id, email: user.email }, admin };
}

export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdmin();
  if (!ctx) throw new Error("Not authorized");
  return ctx;
}
