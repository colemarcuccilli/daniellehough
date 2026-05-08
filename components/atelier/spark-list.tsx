import Link from "next/link";
import type { Idea } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Flame } from "lucide-react";
import { relativeWeek } from "@/lib/utils";

type Props = {
  sparks: Idea[];
  hasActive: boolean;
};

export function SparkList({ sparks, hasActive }: Props) {
  if (sparks.length === 0) {
    return null;
  }
  return (
    <ul className="grid gap-px bg-line rounded-2xl overflow-hidden border border-line">
      {sparks.map((s) => (
        <li key={s.id}>
          <Link
            href={`/atelier/idea/${s.id}`}
            className="group flex items-center gap-4 bg-bg hover:bg-cream px-4 lg:px-5 py-3.5 transition-colors"
          >
            <span
              className="h-2.5 w-2.5 rounded-full bg-marigold spark-dot flex-shrink-0"
              aria-hidden
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink truncate">{s.title}</p>
              {s.description ? (
                <p className="text-xs text-ink-faint truncate mt-0.5">
                  {s.description}
                </p>
              ) : null}
            </div>
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <Badge tone="cream" className="text-[10px]">
                {TYPE_LABELS[s.type]}
              </Badge>
              {s.energy ? (
                <span className="text-xs text-ink-faint tabular-nums">
                  ★ {s.energy}
                </span>
              ) : null}
              <span className="text-xs text-ink-faint tabular-nums">
                {relativeWeek(s.created_at)}
              </span>
            </div>
            <span className="text-ink-faint group-hover:text-marigold-deep transition-colors flex-shrink-0">
              {hasActive ? (
                <ArrowUpRight size={16} />
              ) : (
                <Flame size={16} />
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
