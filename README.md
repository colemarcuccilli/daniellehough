# daniellehough.com

Danielle Hough's portfolio + private Atelier — a focus tool for visionaries
who keep starting things they never finish.

## What's here

- **Public site** (`/`, `/about`, `/work`, `/contact`) — editorial portfolio,
  yellow/cream/ink palette, Fraunces display type, ready to fill in with
  real projects when she has them.
- **Atelier** (`/atelier`) — secret admin. Not linked from the public site.
  Magic-link auth, allowlisted to a single email.

## The Atelier mechanic

> Exactly **one** idea may be "in production" at any time.

Sparks are caught and held. None of them are urgent. They sit in a soft
constellation. To start a new one you must finish or archive the active
one. The Postgres layer enforces this with a partial unique index — two
active ideas at once is *literally impossible*.

Statuses: `spark` → `active` → `done` (or → `archived` from anywhere)

## Stack

- Next.js 16 App Router · React 19 · TypeScript
- Tailwind v4 · Fraunces / Geist / Caveat
- Supabase (Postgres + magic-link auth, RLS)
- Motion (animations) · Lucide (icons) · Sonner (toasts)
- Vercel for hosting

## Local development

```sh
npm install
cp .env.local.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ATELIER_OWNER_EMAIL
npm run dev
```

Apply the schema in `supabase/migrations/0001_ideas.sql` via the Supabase
SQL editor or `supabase db push`. After applying, configure Supabase Auth:

1. Authentication → Providers → Email: enable "Magic Link"
2. Authentication → URL Configuration → Site URL: your production URL
3. Authentication → URL Configuration → Redirect URLs:
   `https://your-domain/auth/callback`, `http://localhost:3000/auth/callback`

## Routes

| route                | who                |
|----------------------|--------------------|
| `/`                  | public — homepage  |
| `/about`             | public             |
| `/work`              | public             |
| `/contact`           | public             |
| `/atelier`           | authed — dashboard |
| `/atelier/idea/[id]` | authed — detail    |
| `/atelier/archive`   | authed             |
| `/atelier/login`     | public — sign in   |
| `/auth/callback`     | OAuth/OTP callback |

The `proxy.ts` (Next.js 16's renamed middleware) refreshes Supabase sessions
and bounces unauthenticated visitors away from `/atelier/*`.
