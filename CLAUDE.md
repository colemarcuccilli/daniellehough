@AGENTS.md

# Project: daniellehough.com

Danielle Hough is a photographer/videographer. Her site has two halves:

1. A simple public portfolio.
2. A private Atelier (admin) — the actual point of the project — that
   helps her finish ideas instead of starting new ones.

## Design philosophy

- Editorial calm. Yellow + cream + ink. Fraunces (display) + Geist + Caveat.
- The marigold yellow is the brand voice. Use sparingly as accent, never
  as wallpaper.
- Never theme the public site to compete with photographs that will live
  on it later. Cream backgrounds and big quiet whitespace.

## The Atelier focus mechanic — DO NOT WEAKEN IT

The whole point of the Atelier is that **only one idea can be `active` at
a time**. This is enforced three ways:

1. UI: spark → active button is disabled if there's already an active idea.
2. Server Action `activateIdea` checks for an existing active idea before
   the update.
3. Postgres partial unique index `ideas_one_active_per_user` makes a
   second active row literally fail at insert/update.

If you're tempted to add a "favorite multiple" or "second priority" feature
— that's the antithesis. The friction is the feature. Talk to the user
before relaxing the constraint.

## Auth model

- Email + password via Supabase Auth (`signInWithPassword`).
- A single allowlist (`ATELIER_OWNER_EMAIL`) is checked in
  `app/atelier/login/actions.ts` BEFORE calling Supabase. Non-owners get
  the same generic "email and password don't match" error as bad
  credentials, so we never leak who has access.
- The owner is pre-created via SQL (see `0001_ideas.sql` siblings) — no
  signup flow exists in the app. Adding a second owner means another
  manual SQL insert + updating the allowlist.
- `proxy.ts` redirects unauthenticated visitors hitting `/atelier/*` to
  `/atelier/login`, and authed visitors hitting `/atelier/login` to
  `/atelier`.
- `app/auth/callback/route.ts` exists for future magic-link / OAuth
  flows but is not wired into the password path.

## Stack notes

- Next.js 16 (`middleware.ts` is now `proxy.ts`, exported function must
  be named `proxy`)
- Tailwind v4 — design tokens defined in `app/globals.css` via `@theme
  inline`. Add new colors there, not a config file.
- `lucide-react` v1.x has removed brand icons (Instagram, Twitter, etc.).
  Use generic glyphs (AtSign, Globe, Send) for social links.
- Supabase SSR via `@supabase/ssr` — three clients: browser, server, proxy.
  Don't bypass the proxy client or sessions go stale.

## Folder convention

- `app/(public)/*` — public site under route group
- `app/atelier/*` — admin (auth-protected by `proxy.ts`)
- `app/auth/*` — auth callbacks
- `components/ui/*` — neutral primitives (Button, Input, etc.)
- `components/public/*` — public-only widgets
- `components/atelier/*` — admin widgets
- `lib/supabase/*` — three clients
- `supabase/migrations/*` — schema

## Adding a new field to ideas

1. Migration in `supabase/migrations/`
2. Update `Idea` type in `lib/types.ts`
3. Update Zod schema in `app/atelier/actions.ts`
4. Render input on `app/atelier/idea/[id]/page.tsx`
5. Render display somewhere meaningful in dashboard or active canvas
