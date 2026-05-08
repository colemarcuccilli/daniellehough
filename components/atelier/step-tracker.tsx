"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { toggleStep } from "@/app/atelier/actions";
import type { IdeaStep } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  id: string;
  steps: IdeaStep[];
  tone?: "light" | "dark";
};

export function StepTracker({ id, steps, tone = "light" }: Props) {
  const [pending, start] = useTransition();

  const onToggle = (i: number) => {
    start(async () => {
      try {
        await toggleStep(id, i);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't update step");
      }
    });
  };

  const isDark = tone === "dark";
  const totalDone = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex items-center gap-1.5 flex-wrap",
          pending && "opacity-60",
        )}
      >
        {steps.map((step, i) => {
          const next = !step.done && i === totalDone;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              disabled={pending}
              aria-label={`${step.label} — ${step.done ? "done" : "not done"}`}
              className={cn(
                "group relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2",
                isDark
                  ? "focus-visible:ring-offset-ink"
                  : "focus-visible:ring-offset-bg",
                step.done
                  ? isDark
                    ? "bg-marigold text-ink border-marigold"
                    : "bg-ink text-bg border-ink"
                  : isDark
                  ? "bg-bg/5 text-bg/60 border-bg/15 hover:border-bg/40 hover:text-bg"
                  : "bg-bg text-ink-soft border-line hover:border-ink/40 hover:text-ink",
                next &&
                  !step.done &&
                  (isDark
                    ? "ring-2 ring-marigold/40 border-marigold/60 text-marigold-bright"
                    : "ring-2 ring-marigold/30 border-marigold/60 text-marigold-deep"),
              )}
            >
              <span
                className={cn(
                  "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full",
                  step.done
                    ? isDark
                      ? "bg-ink text-marigold"
                      : "bg-marigold text-ink"
                    : "border",
                )}
              >
                {step.done ? <Check size={10} strokeWidth={3} /> : null}
              </span>
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
