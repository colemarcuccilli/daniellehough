@AGENTS.md

# Project: Dani Cams (Danielle Hough)

Wedding photography site + private admin. Danielle Hough is a photographer and
a current member of the Indiana National Guard / United States Air Force.

**Direction since 2026-11-23 (branch `weddings-redesign`): the site sells to
couples.** Weddings, engagements, and save the dates are the three services
(`SERVICES` in `lib/content.ts`). Two add-ons combine with them: a partner
**video team** (photo + video booked together cost less) and a **wedding
website with RSVP and evites** (package rate). Packages differ per couple, so
there are no prices; the offer and pricing come later. Rules for this direction:

- Premium, colour-blocked, few sections. The home page is five blocks: photo
  hero (rotates one photo per shoot), `CouplesStrip` (four equal frames, one
  couple each; never a grid that reads as one project's portfolio), `Films`
  (plum, one row: wedding film, save-the-date video, social media recap),
  `Offer` (green), `CtaBand` (marigold). Page ground is cream, never white;
  no peach or blush backgrounds (owner dislikes them).
- The offer (2026-11-23): two photo packages, **Wedding** and **Wedding +
  engagement** (engagement or save-the-date session). Every wedding package
  includes the **social media recap** video free. Wedding + engagement also
  includes the **wedding website** free. A full **wedding film** is a separate
  team (Sweet Dreams) hired in addition. `PACKAGES` / `FILM_ADD_ON` in
  `lib/content.ts`. No prices yet.
- Copy states what it is and stops. No adjectives, no selling verbs, no
  metaphors, and never the word "simple" (owner, 2026-11-23). Headings are
  nouns: "Wedding photography", "Films", "Packages", "Check your date".
- Films are Cloudflare Stream embeds (`FILMS` in `lib/content.ts`,
  `film-player.tsx` loads the player on click). The wedding film and
  save-the-date film are made with partner **Sweet Dreams**; the vertical
  "social recap" is the lower-cost option.
- The military service stays visible (hero line, closing band, About, footer),
  but business and military *work* is not up front.
- Wedding planners get a side door: `/planners`, the blush `PlannerBand`, and
  the `planner` inquiry kind. Never let it compete with the couples' path.
- **Portfolio is projects, not mixed photos** (owner, 2026-11-23). Four
  groups: "Wedding projects" (`#weddings`), "Engagement and save-the-date
  projects" (`#engagements`, includes `COUPLES_PROJECT_SLUGS`), "Family
  projects" (`#families`, `FAMILY_PROJECT_SLUGS`: newborn, baby shower, family
  in the woods, fall family session), then "Side projects". No category bands, no mixed grid. The home page shows only three
  small dimmed tiles with a card over each (Weddings, Engagements, Save the
  dates) that jump to those groups; engagements and save the dates share a
  portfolio group but stay separate on the home and services pages.
- **Every project opens in the gallery format** (`/gallery/<token>`: sections,
  full-quality downloads). All projects have `gallery_enabled` on;
  `projectHref` returns the gallery link. Galleries are publicly linked from
  the portfolio now. The gallery grid is 2 / 3 / 4 / 5 columns (phone, tablet,
  laptop, wide). "Newborn at Home" has downloads off: its originals are not in
  the bucket.
- `/about` is hidden for now (redirects home; old page kept as
  `_page.hidden.tsx.txt`).
- Greenery art is `components/public/greenery.tsx` (`Branch`, `Wreath`,
  `Garland`); arched photo frames are `.arch` / `.arch-ring`; blush tokens pair
  with sage. Teal and purple are no longer used on the couples' pages.
- **Bottom form dock** (2026-11-23, after Sweet Dreams' `docs/BOTTOM-FORM-DOCK.md`):
  `InquiryProvider` in `components/public/inquiry-modal.tsx` draws a bar along
  the bottom of every public page with the form's first question ("What do
  you need?": Wedding, Engagement, Save the date; on `/planners` one button,
  "Partner with Dani Cams") and the whole form as a sheet that rises from the
  bottom (full width on phones, a centered 600px panel from `lg`). Every
  `InquiryButton`, every `<a href="#start">` (optional `data-kind`) and
  `?inquire=<kind>` open the same sheet with the answer chosen; what was typed
  stays until reload; the bar goes away after the form is sent. Layers: bar
  z-30 (under nav 40 and phone menu 50), dimming 70, sheet 80. The provider
  adds a spacer under the footer, and the home hero has extra bottom padding
  so the bar never covers its buttons. Galleries and the admin have no dock.
- Inquiry kinds added: `wedding`, `engagement`, `save_the_date`, `planner`
  (check constraint widened in `supabase/freewebsites/0004`). Partner name and
  package add-ons are appended to the message; wedding date uses `timeline`,
  venue uses `location`. The budget field is gone from the public form.

Brand rules from the owner (2026-09-03): the name is **Dani Cams** (the Supabase
project is still called VisionaryHaus); never use the words "retainer" or
"seniors" in public copy; keep copy short and plain, no piled-up adjectives; do
not name families or clients anywhere public (titles, URLs, image paths, alt
text); the inquiry form is a pop-up (`components/public/inquiry-modal.tsx`), not
a page; never say "content plan" (the offers are Quarterly / Monthly Photography);
no pricing anywhere public (2026-10-14): no dollar amounts, rates, or "per day /
per quarter" price lines, so the `Offer` type has no price field. The only dollar
figures left are the visitor's budget options on the inquiry form.

Layout rules: every page opens on a dark masthead (home: full-bleed military
photo via `getHeroPhoto()`; inner pages: sage `PageHeader`) so the transparent
nav (`NavShell`, sage bar after scroll) always sits on a dark ground. Category bands
(`category-stack.tsx`, `.band*` in globals.css) are black-and-white until hover,
number/info top-left, arrow bottom-left, title right; on touch screens
`BandSpotlight` gives the band nearest the viewport centre the hover state.

## Two halves

1. **Public site** (`app/(public)`) — `/`, `/portfolio`, `/portfolio/[category]`,
   `/portfolio/[category]/[project]`, `/services`, `/about`. `/contact` only
   redirects to `/?inquire=<kind>`, which opens the pop-up form.
   Reads through the cookie-less client in `lib/supabase/public.ts` so pages
   are ISR (`revalidate = 600`); admin mutations call `revalidatePath("/", "layout")`.
2. **Admin** (`app/admin`, not linked publicly) — projects, photos (upload,
   import from bucket, drag order, cover, hide, alt/caption), categories,
   inquiries, account. `proxy.ts` guards `/admin/*` and `/api/admin/*`.

## Data model (shared Supabase project "FreeWebsites", ref nxhwqtqroyerbbklywyn, schema `vh`)

`categories` → `projects` → `photos`, plus `inquiries` and `admins`, all in the
`vh` schema (moved from the standalone "VisionaryHaus" project, ref
hcirwveiubnxglzitats, on 2026-10-17). Schema + RLS in
`supabase/freewebsites/0001_vh_schema.sql`; `supabase/migrations/` is the
original project's history. Schema and bucket names come from env
(`NEXT_PUBLIC_SUPABASE_DB_SCHEMA`, `..._WEB_BUCKET`, `..._ORIGINALS_BUCKET`).

- Storage: originals in the **private** `vh-originals` bucket (one folder
  per project). Web derivatives (≤2400px progressive JPEG) in the **public**
  `vh-web` bucket. `photos.width/height/blur_data_url/dominant_color`
  are stored so grids render with zero layout shift.
- No service-role key anywhere. Everything runs as the signed-in admin through
  RLS (`vh.is_admin()` checks the `admins` table). Other sites share this
  Supabase project, so never add policies that trust any signed-in user. Adding an admin is a SQL
  step: `supabase/seed/add_admin.sql`.
- Upload flow: browser → Supabase Storage directly (no Vercel body limit), then
  `POST /api/admin/photos/process` downloads the original, runs `sharp`
  (`lib/photos/derive.ts`), uploads the derivative, inserts the row.
- Bulk import of folders already in the bucket: `npm run import:download`
  then `npm run import:run` (see `scripts/import-storage.mjs` and
  `scripts/import-mapping.json`), or "Import from bucket folder" in the admin.

## Client galleries (2026-10-31)

Weddings and events are shared with guests by an **unlisted link**, separate
from the portfolio: `/gallery/<gallery_slug>` (`app/gallery/[slug]`, its own
quiet layout, `noindex`). `vh.projects` carries `gallery_slug` (random 12-char
token minted by `updateGallery` the first time the gallery is enabled),
`gallery_enabled`, `gallery_downloads`, `gallery_intro`. A gallery project is
normally `is_published = false` so it never shows in the portfolio; the
`projects: public read` policy is `is_published or gallery_enabled`.

- **Sections** (`vh.sections`: ceremony, cocktail hour, reception…) group the
  photos; `photos.section_id` is nullable, loose photos fall into a trailing
  "More" group (`getGalleryBySlug` in `lib/queries.ts`). Admin manages them in
  `components/admin/gallery-panel.tsx`; the photo manager has a "New photos go
  to" section picker (passed as `sectionId` to `/api/admin/photos/process`),
  section filter chips, and a Select → Move-to-section bulk action.
- **Grid** is the stacked-columns "VSCO" layout (`lib/masonry.ts`, 2 columns on
  phones, 3 from `md`), rendered by `components/gallery/gallery-view.tsx` with
  the lightbox (swipe, zoom, a download button in the toolbar), hover download
  per tile, and a desktop-only Select → "Download zip" flow built in the
  browser with `client-zip` (streams to disk via `showSaveFilePicker` when the
  browser has it, else a blob).
- **Downloads are the originals.** `GET /api/gallery/<slug>/<photoId>` checks
  the gallery is live with downloads on, then 302s to a 1-hour signed URL with
  `Content-Disposition: attachment` (`?format=json` returns the URL for the
  zipper). The storage policy `vh originals: gallery download` lets anon sign
  only objects for which `vh.can_download_original(name)` is true, so switching
  the gallery or downloads off closes access immediately. Still no service
  role key anywhere.
- **Masthead image**: `gallery_cover_url` (a path under `public/`, e.g.
  `/galleries/hunkin-wedding-cover.jpg`, or a URL) wins over the cover photo.
  The project's cover photo never appears in the grid unless it is in a
  section. New uploads/imports with a section picked go to the originals
  folder `<project-slug>/<section-slug>/`, so each section has its own bucket
  folder for bulk drops.
- **Automatic bucket import** (2026-10-31): a trigger on `storage.objects`
  (`vh.poke_import_sync`, debounced through `vh.sync_state`, pg_net) POSTs
  to `/api/import/sync` after uploads; a Vercel cron (`vercel.json`, every 5
  min) sweeps; the gallery panel has "Sync now". The route reconciles each
  gallery project's `<slug>/` and `<slug>/<section-slug>/` folders against
  `photos` (`lib/photos/sync.ts`), processes what is missing through
  `lib/photos/ingest.ts` (shared with the admin uploader), coordinates
  overlapping runs with `vh.import_claims`, and hands off to a new run via
  `after()` when the 240 s budget runs out. Secret callers (cron, trigger)
  sign in as the **import account** `gallery-import@danicams.com`, an
  ordinary row in `vh.admins` (`IMPORT_BOT_EMAIL` / `IMPORT_BOT_PASSWORD`
  env), so RLS still gates everything and there is no service-role key.
  `CRON_SECRET` is the bearer for the route; the same value sits in
  `vh.sync_state.secret` for the trigger. Unknown folders are reported as
  `skipped_folders`, never imported.
- `reorderPhotos` accepts a subset (the filtered view) and keeps the rest of
  the project in place; `sortPhotosByTakenAt` orders a whole project by EXIF
  time. Schema: `supabase/freewebsites/0002_vh_galleries.sql`.

## Design

- Direction (2026-10-21, from Dani's wedding-quote stationery): elegant and
  quiet. Cream paper (`bg`, `paper`, `cream`), a charcoal-green ink, and
  **sage green** (`sage`, `sage-deep`) as the structural colour. Hairline
  rules, square corners (radius tokens are 2–4px), and the double-line frame
  (`.frame`, `.frame-inset`) from the quote's "Total" band. Botanical line-art
  sprigs (`components/public/sprig.tsx`) sit in the corners of mastheads, the
  CTA band, the footer, and the mobile menu.
- The bright four stay, as accents only, so the site remains memorable:
  marigold (bulb, primary buttons, hero italic, band 01), teal (business
  cards, checks), purple (mini sessions), green (process steps). Framed cards
  take a 3px coloured top rule via `.ribbon` + `.ribbon-<colour>`. Category
  bands rotate accents for the number and the hover arrow.
- Type: Cormorant Garamond for every heading (`.display`, weight 500) and for
  italic emphasis (`.serif-accent`); the wordmark is letter-spaced serif caps
  (`.wordmark`, "DANI CAMS"); Jost for body and for tracked small caps
  (`.eyebrow`, `.caps`, buttons, chips, metadata). Geist Mono is only for
  genuinely monospace admin text. Never reintroduce `font-mono` labels on the
  public site.
- Buttons are square, uppercase, tracked; no hard offset shadows anywhere.
- Galleries use the CSS justified grid: every row fills the width exactly and
  every photo keeps its native ratio. Reuse `justified-grid.tsx` (server) /
  `photo-grid.tsx` (client with lightbox) instead of inventing new grids.
  Category browsing uses `category-stack.tsx` (full-width stacked bands).

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
  `lib/turnstile.ts`); both are set on production. With the secret set, an
  inquiry without a valid token is always refused (2026-11-23: the old
  fallback that skipped the check on a browser-reported 1102xx error was a
  bypass and is gone). The widget's hostname list covers danicams.com, so
  public pages on `daniellehough.vercel.app` redirect there (`next.config.ts`).
  Previews have no keys and run on the honeypot alone.

## Deploy

Vercel project `daniellehough` (team "Sweet Dreams' projects"). Env vars:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key),
`NEXT_PUBLIC_SUPABASE_DB_SCHEMA` (`vh`), `NEXT_PUBLIC_SUPABASE_WEB_BUCKET` (`vh-web`),
`NEXT_PUBLIC_SUPABASE_ORIGINALS_BUCKET` (`vh-originals`),
`NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `INQUIRY_NOTIFY_EMAIL`, `INQUIRY_FROM_EMAIL`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
