"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { deleteIdea } from "@/app/atelier/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  title: string;
  className?: string;
};

export function QuickDelete({ id, title, className }: Props) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        // Prevent the parent <Link> click
        e.preventDefault();
        e.stopPropagation();
        if (!confirm(`Delete "${title}" forever?`)) return;
        start(async () => {
          try {
            await deleteIdea(id);
            toast.success("Gone.");
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Couldn't delete",
            );
          }
        });
      }}
      aria-label={`Delete ${title}`}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-faint",
        "opacity-0 group-hover:opacity-100 focus:opacity-100",
        "hover:bg-terracotta/15 hover:text-terracotta focus:bg-terracotta/15 focus:text-terracotta",
        "transition-all disabled:opacity-50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40",
        className,
      )}
    >
      <X size={14} />
    </button>
  );
}
