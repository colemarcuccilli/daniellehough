import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/public/logo";
import { SITE } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-ink bg-cream">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <LogoMark height={34} />
            <Wordmark />
          </div>
          <p className="text-sm text-ink-soft max-w-sm leading-relaxed">
            {SITE.tagline} Photographed by {SITE.owner}, a current member of the Indiana National Guard and the
            United States Air Force.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">{SITE.region}</p>
        </div>

        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="grid gap-2 text-sm">
            <li><Link className="hover:text-marigold-deep transition-colors" href="/portfolio">Portfolio</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/services">Business retainers</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/services#mini-sessions">Mini sessions</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/about">About Danielle</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Get in touch</p>
          <ul className="grid gap-2 text-sm">
            <li>
              <a className="hover:text-marigold-deep transition-colors" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <Link className="hover:text-marigold-deep transition-colors" href="/contact?kind=retainer">Ask about a retainer</Link>
            </li>
            <li>
              <Link className="hover:text-marigold-deep transition-colors" href="/contact?kind=headshots">Book a headshot day</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          <span>&copy; {year} VisionaryHaus · Danielle Nicole Hough</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-marigold glow-dot" aria-hidden />
            All photographs are the property of the photographer
          </span>
        </div>
      </div>
    </footer>
  );
}
