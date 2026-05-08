import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivateButton } from "@/components/atelier/activate-button";
import { CompleteButton } from "@/components/atelier/complete-button";
import { StepTracker } from "@/components/atelier/step-tracker";
import { IdeaDangerZone } from "@/components/atelier/idea-danger-zone";
import { updateIdea } from "@/app/atelier/actions";
import type { Idea } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Flame, CheckCircle2, Archive } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: idea } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!idea) notFound();
  const i = idea as Idea;

  const update = async (formData: FormData) => {
    "use server";
    await updateIdea(id, formData);
  };

  const statusBadge = {
    spark: { tone: "marigold" as const, label: "spark · held" },
    active: { tone: "ink" as const, label: "in production" },
    done: { tone: "moss" as const, label: "finished" },
    archived: { tone: "outline" as const, label: "archived" },
  }[i.status];

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-10 lg:py-14 space-y-10">
      <div>
        <Link
          href="/atelier"
          className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          back to studio
        </Link>
      </div>

      <header className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={statusBadge.tone}>
            {i.status === "active" ? <Flame size={12} /> : null}
            {i.status === "done" ? <CheckCircle2 size={12} /> : null}
            {i.status === "archived" ? <Archive size={12} /> : null}
            {statusBadge.label}
          </Badge>
          <Badge tone="cream">{TYPE_LABELS[i.type]}</Badge>
          {i.energy ? <Badge tone="cream">★ {i.energy}</Badge> : null}
          <span className="text-xs text-ink-faint ml-auto">
            caught {formatDate(i.created_at)}
            {i.activated_at
              ? ` · activated ${formatDate(i.activated_at)}`
              : ""}
            {i.completed_at
              ? ` · finished ${formatDate(i.completed_at)}`
              : ""}
          </span>
        </div>
      </header>

      {i.status === "active" ? (
        <section className="paper p-6 lg:p-8 bg-marigold/10 border-marigold/40">
          <p className="text-[11px] uppercase tracking-[0.22em] text-marigold-deep mb-2">
            this week
          </p>
          {i.weekly_step ? (
            <p className="font-display text-3xl leading-snug">
              <span className="hand-underline">{i.weekly_step}</span>
            </p>
          ) : (
            <p className="font-display text-3xl text-ink-faint italic">
              set a weekly step below
            </p>
          )}
          <div className="mt-6">
            <StepTracker id={i.id} steps={i.steps} />
          </div>
        </section>
      ) : null}

      <form action={update} className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={i.title}
            required
            maxLength={120}
            className="text-2xl font-display h-14"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={i.description ?? ""}
            rows={3}
            placeholder="what is this? what makes it worth doing?"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              defaultValue={i.type}
              className="h-11 w-full rounded-lg border border-ink/15 bg-bg px-3 text-sm focus:outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/30"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="series">Series</option>
              <option value="mixed">Mixed</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="energy">Energy (1–5)</Label>
            <Input
              id="energy"
              name="energy"
              type="number"
              min={1}
              max={5}
              defaultValue={i.energy ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={(i.tags || []).join(", ")}
              placeholder="comma, separated"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="weekly_step">This week</Label>
          <Input
            id="weekly_step"
            name="weekly_step"
            defaultValue={i.weekly_step ?? ""}
            placeholder="one sentence — the actual next move"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="inspiration_urls">Inspiration links</Label>
          <Textarea
            id="inspiration_urls"
            name="inspiration_urls"
            defaultValue={(i.inspiration_urls || []).join("\n")}
            rows={2}
            placeholder="urls, one per line"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={i.notes ?? ""}
            rows={6}
            placeholder="anything else — references, locations, gear, lyrics, what makes this scary, what makes it yours"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="primary" type="submit">
            Save changes
          </Button>
        </div>
      </form>

      {i.status !== "active" ? (
        <section className="grid gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
            steps
          </p>
          <StepTracker id={i.id} steps={i.steps} />
        </section>
      ) : null}

      <section className="border-t border-line pt-8 flex flex-wrap items-center gap-3">
        {i.status === "spark" ? (
          <ActivateButton id={i.id} title={i.title} />
        ) : null}
        {i.status === "active" ? <CompleteButton id={i.id} /> : null}
        <IdeaDangerZone id={i.id} status={i.status} />
      </section>
    </div>
  );
}
