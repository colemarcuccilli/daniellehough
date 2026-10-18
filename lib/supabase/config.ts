/**
 * Postgres schema holding the site's tables. `vh` on the shared FreeWebsites
 * Supabase project; unset means `public` (the original standalone project).
 */
export const DB_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA || "public";
