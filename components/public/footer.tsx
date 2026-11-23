import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/public/logo";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { Sprig } from "@/components/public/sprig";
import { SITE } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-sage bg-cream">
      <Sprig className="pointer-events-none absolute -bottom-12 -right-4 h-56 w-auto text-sage opacity-[0.14]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LogoMark height={34} />
            <Wordmark className="text-[1.1rem]" />
          </div>
          <p className="text-sm text-ink-soft max-w-sm leading-relaxed">{SITE.tagline}</p>
          <p className="caps text-[0.6rem] text-ink-faint">Military-owned · {SITE.owner} · Indiana National Guard · U.S. Air Force</p>
        </div>

        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="grid gap-2 text-sm">
            <li><Link className="hover:text-marigold-deep transition-colors" href="/services">Services and packages</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/portfolio">Portfolio</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/about">About Dani</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/planners">For wedding planners</Link></li>
            <li><Link className="hover:text-marigold-deep transition-colors" href="/services#families">Family sessions</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="eyebrow">Get in touch</p>
          <div>
            <InquiryButton kind="wedding" variant="primary" size="md">Check your date</InquiryButton>
          </div>
          {SITE.email ? (
            <p className="text-sm">
              <a className="hover:text-marigold-deep transition-colors" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          ) : null}
          <p className="text-xs text-ink-faint">{SITE.region}</p>
          <p className="text-xs text-ink-faint">
            Need photos for a business?{" "}
            <InquiryButton kind="retainer" variant="link" className="text-xs text-ink-soft">Ask here</InquiryButton>
          </p>
        </div>
      </div>
      <div className="relative border-t border-line">
        <div className="caps mx-auto max-w-7xl px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-[0.6rem] text-ink-faint">
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
