"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { completeIdea } from "@/app/atelier/actions";
import { toast } from "sonner";

export function CompleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Mark this finished and move it into the archive of done work?",
          )
        )
          return;
        start(async () => {
          try {
            await completeIdea(id);
            toast.success("Beautiful. One real thing finished.");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Couldn't complete");
          }
        });
      }}
      className="inline-flex items-center gap-2 self-start rounded-full bg-marigold px-5 py-3 text-sm font-medium text-ink shadow-[0_4px_0_0_var(--color-marigold-deep)] hover:bg-marigold-bright hover:shadow-[0_2px_0_0_var(--color-marigold-deep)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
    >
      <CheckCircle2 size={16} />
      {pending ? "finishing…" : "Mark finished"}
    </button>
  );
}
