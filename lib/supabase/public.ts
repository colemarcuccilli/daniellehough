import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-less client for public reads. Because it never touches request
 * cookies, pages that use it can be statically rendered / ISR'd.
 * Row Level Security only exposes published rows to the anon role.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}
