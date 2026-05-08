import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ActiveCanvas } from "@/components/atelier/active-canvas";
import { SparkOrbit } from "@/components/atelier/spark-orbit";
import { SparkList } from "@/components/atelier/spark-list";
import { CaptureSpark } from "@/components/atelier/capture-spark";
import { Badge } from "@/components/ui/badge";
import type { Idea } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AtelierDashboard() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  const ideas = (rows ?? []) as Idea[];
  const active = ideas.find((i) => i.status === "active") ?? null;
  const sparks = ideas.filter((i) => i.status === "spark");
  const recentDone = ideas
    .filter((i) => i.status === "done")
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10 lg:py-14 space-y-12 lg:space-y-16">
      <header className="space-y-2">
        <p className="font-hand text-2xl text-marigold-deep">
          {greeting()} —
        </p>
        <h1 className="font-display text-4xl lg:text-5xl tracking-tight">
          {active
            ? "Stay with it."
            : sparks.length > 0
            ? "Pick one. Just one."
            : "Catch the next spark."}
        </h1>
      </header>

      <ActiveCanvas idea={active} sparkCount={sparks.length} />

      <section id="sparks" className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="font-hand text-xl text-terracotta mb-1">
              the constellation —
            </p>
            <h2 className="font-display text-3xl lg:text-4xl tracking-tight">
              Sparks held
              <span className="ml-3 text-ink-faint tabular-nums text-2xl font-sans font-normal">
                {sparks.length}
              </span>
            </h2>
          </div>
          {active ? (
            <Badge tone="outline" className="text-[11px]">
              one in production — sparks held
            </Badge>
          ) : null}
        </div>

        <SparkOrbit sparks={sparks} />

        {sparks.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
              the list
            </p>
            <SparkList sparks={sparks} hasActive={!!active} />
          </div>
        ) : null}
      </section>

      <CaptureSpark />

      {recentDone.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl tracking-tight">
              Recently finished
            </h2>
            <Link
              href="/atelier/archive"
              className="text-xs text-ink-faint hover:text-ink inline-flex items-center gap-1 group"
            >
              archive
              <ArrowRight
                size={12}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
          <ul className="grid gap-2">
            {recentDone.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-lg bg-cream/50 px-4 py-3 border border-line/50"
              >
                <span className="h-2 w-2 rounded-full bg-moss" aria-hidden />
                <span className="font-medium">{d.title}</span>
                <span className="ml-auto text-xs text-ink-faint">
                  {d.completed_at
                    ? new Date(d.completed_at).toLocaleDateString()
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "still up";
  if (h < 12) return "good morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "late hours";
}
