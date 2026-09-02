import Link from "next/link";
import { ArrowRight, Images, Inbox, LayoutGrid, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INQUIRY_KIND_SHORT, type Inquiry, type Project } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { supabase, admin } = await requireAdmin();
  const [projects, photos, inquiriesNew, recent, drafts] = await Promise.all([
    supabase.from("projects").select("id, is_published", { count: "exact" }),
    supabase.from("photos").select("id", { count: "exact", head: true }),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("projects").select("id, title, slug, updated_at").eq("is_published", false).order("updated_at", { ascending: false }).limit(5),
  ]);

  const published = ((projects.data ?? []) as Pick<Project, "id" | "is_published">[]).filter((p) => p.is_published).length;
  const stats = [
    { label: "Projects", value: projects.count ?? 0, sub: `${published} published`, href: "/admin/projects", icon: <LayoutGrid size={16} /> },
    { label: "Photographs", value: photos.count ?? 0, sub: "in the portfolio", href: "/admin/projects", icon: <Images size={16} /> },
    { label: "New inquiries", value: inquiriesNew.count ?? 0, sub: "waiting for a reply", href: "/admin/inquiries", icon: <Inbox size={16} /> },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{greeting()}, {(admin.display_name ?? admin.email).split(" ")[0]}</p>
          <h1 className="display text-4xl">Studio overview</h1>
        </div>
        <Link href="/admin/projects/new" className={buttonStyles({ variant: "primary" })}>
          <Plus size={16} /> New project
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="outline-card p-5 hover:bg-cream transition-colors">
            <div className="flex items-center justify-between text-ink-faint">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]">{s.label}</span>
              {s.icon}
            </div>
            <p className="display text-4xl mt-3">{s.value}</p>
            <p className="text-xs text-ink-soft mt-1">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="display text-2xl">Recent inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm inline-flex items-center gap-1 hover:text-marigold-deep">
              All inquiries <ArrowRight size={14} />
            </Link>
          </div>
          {(recent.data ?? []).length === 0 ? (
            <p className="outline-card-soft p-6 text-sm text-ink-soft">No inquiries yet. The contact form on the site delivers here.</p>
          ) : (
            <ul className="outline-card divide-y divide-line overflow-hidden">
              {((recent.data ?? []) as Inquiry[]).map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/inquiries/${q.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-cream transition-colors">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${q.status === "new" ? "bg-coral" : q.status === "replied" ? "bg-moss" : "bg-ink-faint"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{q.name}{q.company ? <span className="text-ink-faint"> · {q.company}</span> : null}</p>
                      <p className="text-xs text-ink-soft truncate">{q.message}</p>
                    </div>
                    <Badge tone="cream">{INQUIRY_KIND_SHORT[q.kind]}</Badge>
                    <span className="text-xs text-ink-faint whitespace-nowrap">{relativeTime(q.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="display text-2xl">Drafts</h2>
          {(drafts.data ?? []).length === 0 ? (
            <p className="outline-card-soft p-6 text-sm text-ink-soft">Every project is published.</p>
          ) : (
            <ul className="outline-card divide-y divide-line overflow-hidden">
              {((drafts.data ?? []) as Pick<Project, "id" | "title" | "slug" | "updated_at">[]).map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/projects/${p.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-cream">
                    <span className="truncate">{p.title}</span>
                    <span className="text-xs text-ink-faint">{relativeTime(p.updated_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="outline-card-soft p-5 text-sm text-ink-soft space-y-2">
            <p className="font-medium text-ink">Quick tips</p>
            <p>Open a project to upload originals straight from your computer, or import a folder you already dropped into the <span className="font-mono text-xs">PortfolioPhotos</span> bucket.</p>
            <p>Drag photos to reorder. The starred photo is the cover on the public site.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
