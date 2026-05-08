import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export const metadata = { title: "Work" };

export default function WorkPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-20 pb-32">
      <p className="font-hand text-2xl text-terracotta mb-4">
        what&rsquo;s been finished —
      </p>
      <h1 className="font-display text-6xl lg:text-7xl tracking-tight leading-[0.95] mb-16">
        The work.
      </h1>

      <div className="paper p-12 lg:p-20 text-center max-w-2xl mx-auto grain">
        <p className="font-hand text-2xl text-marigold-deep mb-4">
          shhh —
        </p>
        <h2 className="font-display text-4xl mb-6 tracking-tight">
          A few things are still in the dark room.
        </h2>
        <p className="text-ink-soft leading-relaxed mb-8">
          Danielle is finishing one project before adding another. The
          good ones are worth waiting for &mdash; and they&rsquo;ll land
          here when they&rsquo;re ready.
        </p>
        <p className="text-sm text-ink-faint italic mb-10">
          (this is, on purpose, a quiet page.)
        </p>

        <Link
          href="/contact"
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          Ask about a commission
        </Link>
      </div>

      <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ComingTile key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

function ComingTile({ index }: { index: number }) {
  const tones = [
    "from-marigold/20 via-cream-deep to-cream",
    "from-rose/30 via-cream-deep to-cream",
    "from-cream-deep via-cream to-marigold-glow/30",
    "from-marigold-glow/30 via-cream to-cream-deep",
    "from-cream via-rose/20 to-cream-deep",
    "from-cream-deep via-marigold-glow/30 to-cream",
  ];
  const labels = [
    "Series 01",
    "Series 02",
    "Brand · forthcoming",
    "Editorial",
    "Wedding",
    "Music · forthcoming",
  ];

  return (
    <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-line">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${tones[index % tones.length]}`}
      />
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <span className="self-start inline-flex items-center gap-1.5 rounded-full bg-bg/80 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-marigold spark-dot" />
          in production
        </span>
        <p className="font-display text-xl tracking-tight">
          {labels[index % labels.length]}
        </p>
      </div>
    </div>
  );
}
