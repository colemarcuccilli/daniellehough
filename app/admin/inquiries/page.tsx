import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { INQUIRY_KIND_SHORT, INQUIRY_STATUSES, type Inquiry, type InquiryStatus } from "@/lib/types";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS: Array<{ key: string; label: string }> = [
  { key: "open", label: "Open" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
];

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "open" } = await searchParams;
  const { supabase } = await requireAdmin();
  let q = supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(200);
  if (status === "open") q = q.in("status", ["new", "read"]);
  else if (status !== "all" && status in INQUIRY_STATUSES) q = q.eq("status", status as InquiryStatus);
  const { data } = await q;
  const rows = (data ?? []) as Inquiry[];

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-2">From the contact form</p>
        <h1 className="display text-4xl">Inquiries</h1>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filter">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "open" ? "/admin/inquiries" : `/admin/inquiries?status=${f.key}`}
            className={cn(
              "rounded-xs border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
              status === f.key ? "border-ink bg-ink text-cream" : "border-ink hover:bg-marigold",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="outline-card-soft p-10 text-center text-ink-soft">Nothing here.</p>
      ) : (
        <ul className="outline-card divide-y divide-line overflow-hidden">
          {rows.map((q) => (
            <li key={q.id}>
              <Link href={`/admin/inquiries/${q.id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-cream transition-colors">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", q.status === "new" ? "bg-coral" : q.status === "replied" ? "bg-moss" : q.status === "archived" ? "bg-line-strong" : "bg-marigold-deep")} />
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate", q.status === "new" && "font-semibold")}>
                    {q.name}
                    {q.company ? <span className="text-ink-faint font-normal"> · {q.company}</span> : null}
                  </p>
                  <p className="text-xs text-ink-soft truncate">{q.message}</p>
                </div>
                <Badge tone="cream" className="hidden sm:inline-flex">{INQUIRY_KIND_SHORT[q.kind]}</Badge>
                {q.budget ? <span className="hidden md:inline text-xs text-ink-faint">{q.budget}</span> : null}
                <span className="text-xs text-ink-faint whitespace-nowrap">{relativeTime(q.created_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
