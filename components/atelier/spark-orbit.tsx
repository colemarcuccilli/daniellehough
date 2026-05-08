"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "motion/react";
import type { Idea } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  sparks: Idea[];
};

// Hash-based deterministic position so dots don't jump on re-render
function positionFor(id: string): { x: number; y: number; size: number; delay: number } {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) >>> 0;
  const x = 8 + ((h % 84) ); // 8% – 92%
  const y = 10 + (((h >>> 8) % 78)); // 10% – 88%
  const size = 10 + (((h >>> 16) % 18)); // 10–28 px
  const delay = ((h >>> 24) % 40) / 10; // 0–4s
  return { x, y, size, delay };
}

export function SparkOrbit({ sparks }: Props) {
  const items = useMemo(
    () => sparks.map((s) => ({ s, pos: positionFor(s.id) })),
    [sparks],
  );

  if (sparks.length === 0) {
    return (
      <div className="relative h-[260px] paper grain flex items-center justify-center text-center px-6">
        <div className="space-y-2 max-w-sm">
          <p className="font-hand text-2xl text-marigold-deep">
            no sparks yet —
          </p>
          <p className="text-ink-soft text-sm">
            Catch one when it strikes. The trick is writing it down before
            it disappears, but not picking it up before you finish what
            you&rsquo;re holding.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[420px] paper grain overflow-hidden">
      {/* Subtle grid lines for "celestial map" feel */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, transparent 0, transparent 80px, var(--color-ink) 80px, var(--color-ink) 81px, transparent 81px), radial-gradient(circle at 50% 50%, transparent 0, transparent 160px, var(--color-ink) 160px, var(--color-ink) 161px, transparent 161px)",
        }}
      />

      {items.map(({ s, pos }) => (
        <SparkDot key={s.id} idea={s} pos={pos} />
      ))}

      <div className="absolute bottom-3 left-4 text-[11px] uppercase tracking-[0.2em] text-ink-faint">
        constellation · {sparks.length} held
      </div>
    </div>
  );
}

function SparkDot({
  idea,
  pos,
}: {
  idea: Idea;
  pos: { x: number; y: number; size: number; delay: number };
}) {
  return (
    <Link
      href={`/atelier/idea/${idea.id}`}
      className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: pos.delay * 0.1, duration: 0.4 }}
        className={cn(
          "block rounded-full bg-marigold spark-dot ring-0 ring-marigold/0 group-hover:ring-8 group-hover:ring-marigold/20 group-focus-visible:ring-8 group-focus-visible:ring-marigold/40 transition-all",
        )}
        style={{
          width: pos.size,
          height: pos.size,
          animationDelay: `${pos.delay}s`,
        }}
      />
      <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink text-bg px-2 py-1 text-xs opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity z-10 font-medium">
        {idea.title}
        <span className="ml-2 text-ink-faint font-normal">
          {TYPE_LABELS[idea.type]}
        </span>
      </span>
    </Link>
  );
}
