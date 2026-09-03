# Dani Cams

Portfolio and business site for **Danielle Nicole Hough** (Dani Cams; the Supabase project is still named VisionaryHaus), plus a
private admin for managing the portfolio and reading inquiries.

## What's here

- **Public site** — home with stacked category covers, portfolio by category and project, services (content plans, add-ons, one-off work, mini sessions), about, and a pop-up inquiry form (`/contact` redirects into it).
- **Admin** (`/admin`, not linked from the site) — create projects, upload photos
  straight to Supabase Storage, import folders already in the bucket, drag to
  reorder, pick covers, hide photos, edit captions, manage categories, triage
  inquiries, change your password.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Supabase (Postgres, Auth,
Storage, RLS) · sharp (server-side derivatives) · yet-another-react-lightbox ·
dnd-kit · Resend (optional inquiry notifications) · Vercel.

## Local development

```sh
npm install
cp .env.local.example .env.local   # fill in the Supabase values
npm run dev
```

Schema: `supabase/migrations/0001_visionaryhaus.sql` (already applied to the
VisionaryHaus project). Add an admin with `supabase/seed/add_admin.sql`.

## Bulk import from the bucket

Photos dropped into the private `PortfolioPhotos` bucket (one folder per
project) can be imported in two steps:

```sh
npm run import:download   # pulls originals, builds 2400px derivatives + contact sheets into .import-cache
npm run import:run        # uploads derivatives and upserts categories/projects/photos per scripts/import-mapping.json
```

Both need `ADMIN_EMAIL` / `ADMIN_PASSWORD` for an account in `public.admins`.
The admin UI can do the same per project with "Import from bucket folder".

## Routes

| route                                | who    |
|--------------------------------------|--------|
| `/`, `/portfolio`, `/services`, `/about` | public |
| `/contact` → opens the inquiry pop-up on `/` | public |
| `/portfolio/[category]`              | public |
| `/portfolio/[category]/[project]`    | public |
| `/admin/...`                         | admins |
| `/api/admin/photos/process`          | admins (derivative pipeline) |
