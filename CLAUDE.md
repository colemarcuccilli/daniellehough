@AGENTS.md

# Project: Dani Cams (Danielle Hough)

Photography business site + private admin. Danielle Hough is a photographer and
a current member of the Indiana National Guard / United States Air Force. The
business is built around ongoing **content plans for businesses** (quarterly and
monthly), with headshot days, event coverage, and consumer mini sessions around
them. See `lib/content.ts` for the offers copy.

Brand rules from the owner (2026-09-03): the name is **Dani Cams** (the Supabase
project is still called VisionaryHaus); never use the words "retainer" or
"seniors" in public copy; keep copy short and plain, no piled-up adjectives; do
not name families or clients anywhere public (titles, URLs, image paths, alt
text); the inquiry form is a pop-up (`components/public/inquiry-modal.tsx`), not
a page.

## Two halves

1. **Public site** (`app/(public)`) — `/`, `/portfolio`, `/portfolio/[category]`,
   `/portfolio/[category]/[project]`, `/services`, `/about`. `/contact` only
   redirects to `/?inquire=<kind>`, which opens the pop-up form.
   Reads through the cookie-less client in `lib/supabase/public.ts` so pages
   are ISR (`revalidate = 600`); admin mutations call `revalidatePath("/", "layout")`.
2. **Admin** (`app/admin`, not linked publicly) — projects, photos (upload,
   import from bucket, drag order, cover, hide, alt/caption), categories,
   inquiries, account. `proxy.ts` guards `/admin/*` and `/api/admin/*`.

## Data model (Supabase project "VisionaryHaus", ref hcirwveiubnxglzitats)

`categories` → `projects` → `photos`, plus `inquiries` and `admins`.
Schema + RLS in `supabase/migrations/0001_visionaryhaus.sql`.

- Storage: originals in the **private** `PortfolioPhotos` bucket (one folder
  per project). Web derivatives (≤2400px progressive JPEG) in the **public**
  `portfolio-web` bucket. `photos.width/height/blur_data_url/dominant_color`
  are stored so grids render with zero layout shift.
- No service-role key anywhere. Everything runs as the signed-in admin through
  RLS (`public.is_admin()` checks the `admins` table). Adding an admin is a SQL
  step: `supabase/seed/add_admin.sql`.
- Upload flow: browser → Supabase Storage directly (no Vercel body limit), then
  `POST /api/admin/photos/process` downloads the original, runs `sharp`
  (`lib/photos/derive.ts`), uploads the derivative, inserts the row.
- Bulk import of folders already in the bucket: `npm run import:download`
  then `npm run import:run` (see `scripts/import-storage.mjs` and
  `scripts/import-mapping.json`), or "Import from bucket folder" in the admin.

## Design

- Palette from the light-bulb logo: marigold `#f8c858`, cream, ink, plus teal,
  purple, and green accents (category bands rotate through them; business
  sections are teal, mini sessions purple, process steps green). Tokens in
  `app/globals.css` (`@theme inline`, Tailwind v4).
- "Simple outlines": 1px ink borders, hard offset shadows on primary buttons,
  hairline grids. Photos never cropped in galleries.
- Galleries use the CSS justified grid (`.jg` in globals.css): every row fills
  the width exactly and every photo keeps its native ratio. Reuse
  `components/public/justified-grid.tsx` (server) / `photo-grid.tsx` (client
  with lightbox) instead of inventing new grids. Category browsing uses
  `components/public/category-stack.tsx` (full-width stacked covers).
- Fonts: Fraunces (display), Geist (body), Geist Mono (labels).

## Stack notes

- Next.js 16 (`proxy.ts`, async `params`/`searchParams`, `images.qualities`
  must list every `quality` used: currently 70, 75 and 85).
- Server actions return `{ ok, data | error }` — never throw to the client;
  production masks thrown messages.
- `lucide-react` v1 has no brand icons.
- Inquiry email notifications go through Resend REST (`lib/email.ts`) only when
  `RESEND_API_KEY` + `INQUIRY_NOTIFY_EMAIL` are set; failures never block the form.
- Cloudflare Turnstile guards the inquiry form when `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  + `TURNSTILE_SECRET_KEY` are set (`components/public/turnstile.tsx`,
  `lib/turnstile.ts`); without them the form works with just the honeypot. Widget
  config errors (1102xx, e.g. hostname missing from the widget's allowlist) also
  fall back to the honeypot instead of blocking the form.

## Deploy

Vercel project `daniellehough` (team "Sweet Dreams' projects"). Env vars:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key),
`NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `INQUIRY_NOTIFY_EMAIL`, `INQUIRY_FROM_EMAIL`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
