import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Archive as ArchiveIcon } from "lucide-react";
import type { Idea } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ideas")
    .select("*")
    .in("status", ["done", "archived"])
    .order("completed_at", { ascending: false, nullsFirst: false });

  const rows = (data ?? []) as Idea[];
  const done = rows.filter((r) => r.status === "done");
  const archived = rows.filter((r) => r.status === "archived");

  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10 lg:py-14 space-y-12">
      <div>
        <Link
          href="/atelier"
          className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink"
        >
          <ArrowLeft size={14} />
          studio
        </Link>
      </div>

      <header className="space-y-2">
        <p className="font-hand text-2xl text-marigold-deep">
          proof of finishing —
        </p>
        <h1 className="font-display text-5xl tracking-tight">Archive</h1>
        <p className="text-ink-soft">
          {done.length} finished · {archived.length} let go
        </p>
      </header>

      <Section
        title="Finished"
        empty="Nothing finished yet — but it's coming."
        icon={<CheckCircle2 size={18} className="text-moss" />}
      >
        {done.length > 0 ? (
          <ul className="grid gap-px bg-line rounded-2xl overflow-hidden border border-line">
            {done.map((d) => (
              <Row key={d.id} idea={d} />
            ))}
          </ul>
        ) : null}
      </Section>

      <Section
        title="Let go"
        empty="Nothing's been archived. That's allowed too."
        icon={<ArchiveIcon size={18} className="text-ink-faint" />}
      >
        {archived.length > 0 ? (
          <ul className="grid gap-px bg-line rounded-2xl overflow-hidden border border-line">
            {archived.map((a) => (
              <Row key={a.id} idea={a} />
            ))}
          </ul>
        ) : null}
      </Section>
    </div>
  );
}

function Section({
  title,
  empty,
  icon,
  children,
}: {
  title: string;
  empty: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children ?? <p className="text-ink-faint italic">{empty}</p>}
    </section>
  );
}

function Row({ idea }: { idea: Idea }) {
  const date = idea.completed_at ?? idea.archived_at ?? idea.created_at;
  return (
    <li>
      <Link
        href={`/atelier/idea/${idea.id}`}
        className="group flex items-center gap-4 bg-bg hover:bg-cream px-4 lg:px-5 py-3.5 transition-colors"
      >
        <span
          className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
            idea.status === "done" ? "bg-moss" : "bg-ink-faint"
          }`}
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{idea.title}</p>
          {idea.description ? (
            <p className="text-xs text-ink-faint truncate mt-0.5">
              {idea.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge tone="cream" className="text-[10px]">
            {TYPE_LABELS[idea.type]}
          </Badge>
          <span className="text-xs text-ink-faint tabular-nums">
            {formatDate(date)}
          </span>
        </div>
      </Link>
    </li>
  );
}
