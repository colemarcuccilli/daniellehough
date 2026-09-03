import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/public/logo";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { SITE } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-ink bg-cream">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <LogoMark height={34} />
            <Wordmark />
          </div>
          <p className="text-sm text-ink-soft max-w-sm leading-relaxed">{SITE.tagline}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            {SITE.owner} · Indiana National Guard · U.S. Air Force
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="grid gap-2 text-sm">
            <li><Link className="hover:text-marigold-deep transition-colors" href="/portfolio">Portfolio</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/services">Services</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/services#mini-sessions">Mini sessions</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/about">About</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="eyebrow">Get in touch</p>
          <InquiryButton variant="primary" size="md">Start a project</InquiryButton>
          {SITE.email ? (
            <p className="text-sm">
              <a className="hover:text-marigold-deep transition-colors" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          ) : null}
          <p className="text-xs text-ink-faint">{SITE.region}</p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          <span>&copy; {year} Dani Cams</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-marigold glow-dot" aria-hidden />
            All photographs &copy; Danielle Hough
          </span>
        </div>
      </div>
    </footer>
  );
}
