import Link from "next/link";
import type { Idea } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { ArrowUpRight, Flame } from "lucide-react";
import { CompleteButton } from "./complete-button";
import { StepTracker } from "./step-tracker";

type Props = {
  idea: Idea | null;
  sparkCount: number;
};

export function ActiveCanvas({ idea, sparkCount }: Props) {
  if (!idea) return <EmptyActive sparkCount={sparkCount} />;

  const totalSteps = idea.steps?.length || 0;
  const doneSteps = idea.steps?.filter((s) => s.done).length || 0;
  const days = idea.activated_at
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(idea.activated_at).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-ink text-bg p-8 lg:p-12">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-marigold opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-marigold-glow opacity-20 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Badge tone="marigold" className="bg-marigold text-ink border-0">
              <Flame size={12} /> in production
            </Badge>
            <span className="text-xs text-bg/60 tabular-nums">
              day {days + 1} · {TYPE_LABELS[idea.type]}
            </span>
          </div>
          <Link
            href={`/atelier/idea/${idea.id}`}
            className="inline-flex items-center gap-1 text-xs text-bg/70 hover:text-bg group"
          >
            open full
            <ArrowUpRight
              size={12}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <Link
          href={`/atelier/idea/${idea.id}`}
          className="block group"
        >
          <h1 className="font-display text-5xl lg:text-7xl tracking-tight leading-[0.95] mb-2 group-hover:text-marigold-bright transition-colors">
            {idea.title}
          </h1>
        </Link>
        {idea.description ? (
          <p className="text-bg/70 leading-relaxed max-w-2xl text-lg">
            {idea.description}
          </p>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-marigold-bright mb-2">
              this week
            </p>
            <p className="font-display text-2xl lg:text-3xl text-bg leading-snug max-w-xl">
              {idea.weekly_step ? (
                <span className="hand-underline">{idea.weekly_step}</span>
              ) : (
                <span className="text-bg/50 italic">
                  no step set — open to plan this week
                </span>
              )}
            </p>
          </div>

          <CompleteButton id={idea.id} />
        </div>

        <div className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-bg/50 mb-3">
            {doneSteps}/{totalSteps} steps
          </p>
          <StepTracker
            id={idea.id}
            steps={idea.steps}
            tone="dark"
          />
        </div>
      </div>
    </div>
  );
}

function EmptyActive({ sparkCount }: { sparkCount: number }) {
  return (
    <div className="paper grain p-10 lg:p-16 text-center">
      <p className="font-hand text-2xl text-marigold-deep mb-3">
        the studio is quiet —
      </p>
      <h2 className="font-display text-4xl lg:text-5xl tracking-tight mb-4">
        Nothing in production.
      </h2>
      <p className="text-ink-soft max-w-md mx-auto leading-relaxed mb-8">
        {sparkCount > 0
          ? `You have ${sparkCount} spark${
              sparkCount === 1 ? "" : "s"
            } waiting. Open one to make it real, or catch a new one first.`
          : "Catch a spark when something strikes. Just one. Then close the laptop."}
      </p>
      <div className="flex justify-center gap-3 flex-wrap">
        <a
          href="#capture"
          className={buttonStyles({ variant: "marigold", size: "lg" })}
        >
          Catch a spark
        </a>
        {sparkCount > 0 ? (
          <a
            href="#sparks"
            className={buttonStyles({ variant: "outline", size: "lg" })}
          >
            See sparks
          </a>
        ) : null}
      </div>
    </div>
  );
}
