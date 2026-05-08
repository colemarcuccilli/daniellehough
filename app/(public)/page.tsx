import Link from "next/link";
import { Sun } from "@/components/public/sun";
import { buttonStyles } from "@/components/ui/button";
import { ArrowRight, Camera, Film, Sparkle } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-12 -right-16 opacity-90">
          <Sun size={360} />
        </div>
        <div className="pointer-events-none absolute top-1/2 -left-24 -translate-y-1/2 hidden lg:block opacity-30">
          <div className="h-72 w-72 rounded-full bg-marigold-glow blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 lg:px-10 pt-16 pb-24 lg:pt-28 lg:pb-40">
          <p className="font-hand text-2xl text-terracotta mb-6 select-none">
            visionary, photographer, dreamer —
          </p>
          <h1 className="font-display font-light text-6xl sm:text-7xl lg:text-[9rem] leading-[0.92] tracking-tight max-w-5xl">
            <span className="block">Danielle</span>
            <span className="block italic font-normal">
              <span className="hand-underline">Hough</span>
            </span>
          </h1>

          <div className="mt-12 max-w-xl space-y-6 text-lg text-ink-soft leading-relaxed">
            <p>
              I make pictures that wait for the light to be honest, and films
              that breathe a little longer than they need to. Most of what I
              do begins as a feeling — usually at sunrise, usually
              uninvited.
            </p>
            <p className="text-ink-faint italic">
              Currently building toward something quiet.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/work"
              className={buttonStyles({ variant: "marigold", size: "lg" })}
            >
              See the work <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              Say hello
            </Link>
          </div>
        </div>
      </section>

      <section className="relative bg-cream/60 grain border-y border-line/40">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-24 lg:py-32 grid gap-16 md:grid-cols-3">
          <Pillar
            icon={<Camera size={28} />}
            title="Stills"
            body="Editorials, portraits, and slow studies of light. Soft on people, careful with shadow."
          />
          <Pillar
            icon={<Film size={28} />}
            title="Motion"
            body="Short films, brand stories, and the kind of moving image you watch twice without meaning to."
          />
          <Pillar
            icon={<Sparkle size={28} />}
            title="Visions"
            body="Concept work that doesn't fit any category yet. Series in progress. Half-dreams I plan to finish."
          />
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-24 lg:py-32">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <p className="font-hand text-xl text-terracotta mb-2">
                in the studio —
              </p>
              <h2 className="font-display text-5xl lg:text-6xl tracking-tight">
                Selected work
              </h2>
            </div>
            <Link
              href="/work"
              className="text-sm text-ink-soft hover:text-ink transition-colors group flex items-center gap-1"
            >
              everything
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <PlaceholderTile key={i} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 py-24 text-center">
          <p className="font-display italic text-3xl lg:text-4xl leading-snug text-ink-soft">
            &ldquo;The trick is finishing the one before starting the next.&rdquo;
          </p>
          <p className="mt-4 font-hand text-xl text-marigold-deep">— d.</p>
        </div>
      </section>
    </>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="space-y-4">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-bg border border-line text-marigold-deep">
        {icon}
      </div>
      <h3 className="font-display text-2xl tracking-tight">{title}</h3>
      <p className="text-ink-soft leading-relaxed">{body}</p>
    </article>
  );
}

function PlaceholderTile({ index }: { index: number }) {
  const tones = [
    "from-marigold/30 via-marigold-glow/40 to-cream",
    "from-rose/40 via-cream-deep/40 to-cream",
    "from-cream-deep via-cream to-marigold-glow/40",
  ];
  return (
    <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-line">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${tones[index]}`}
      />
      <div className="absolute inset-0 flex items-end p-6">
        <div>
          <p className="font-hand text-lg text-ink-soft">forthcoming —</p>
          <p className="font-display text-xl">A series in becoming</p>
        </div>
      </div>
      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-marigold spark-dot" />
    </div>
  );
}
