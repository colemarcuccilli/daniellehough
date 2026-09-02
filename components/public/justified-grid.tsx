import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ROW_TARGETS, layoutRows, sizesFor, tileFraction } from "@/lib/rows";

export type JustifiedItem = {
  key: string;
  /** width / height */
  ratio: number;
  href?: string;
  tone?: string | null;
  ariaLabel?: string;
  /** Receives the computed `sizes` string for next/image. */
  render: (sizes: string, index: number) => React.ReactNode;
};

/**
 * Server-rendered justified rows: every row fills the width exactly and every
 * photo keeps its native aspect ratio. Two partitions are rendered (phone and
 * desktop) and toggled with CSS so the row rhythm suits both screens.
 */
export function JustifiedGrid({
  items,
  className,
  targets = ROW_TARGETS,
  contained,
}: {
  items: JustifiedItem[];
  className?: string;
  targets?: { mobile: number; desktop: number };
  /** Max container width in px when the grid is not full-bleed. */
  contained?: number;
}) {
  if (items.length === 0) return null;
  return (
    <div className={className}>
      <Rows items={items} target={targets.mobile} className="md:hidden" />
      <Rows items={items} target={targets.desktop} className="hidden md:flex" contained={contained} />
    </div>
  );
}

function Rows({
  items,
  target,
  className,
  contained,
}: {
  items: JustifiedItem[];
  target: number;
  className?: string;
  contained?: number;
}) {
  const { rows, shortLast } = layoutRows(items.map((i) => ({ item: i, ratio: i.ratio })), target);
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {rows.map((row, ri) => {
        const short = shortLast && ri === rows.length - 1;
        return (
          <div key={ri} className="flex gap-1">
            {row.map(({ item, ratio, index }) => {
              const fraction = tileFraction(row, ratio, target, short);
              const style: Record<string, string | undefined> = {
                aspectRatio: String(ratio),
                "--tone": item.tone ?? undefined,
                ...(short
                  ? { flex: "none", width: `calc(${(fraction * 100).toFixed(3)}% - ${(4 * (row.length - 1)) / row.length}px)` }
                  : { flex: `${ratio} 1 0%` }),
              };
              const content = item.render(sizesFor(fraction, contained), index);
              return item.href ? (
                <Link key={item.key} href={item.href} className="tile" style={style as CSSProperties} aria-label={item.ariaLabel}>
                  {content}
                </Link>
              ) : (
                <div key={item.key} className="tile" style={style as CSSProperties}>
                  {content}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
