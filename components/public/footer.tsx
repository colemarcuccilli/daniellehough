import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-line/50 bg-cream/40">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-14 grid gap-10 md:grid-cols-3 items-end">
        <div className="space-y-3">
          <p className="font-display text-3xl tracking-tight">Danielle Hough</p>
          <p className="text-sm text-ink-soft max-w-xs leading-relaxed">
            Photography, video, and quiet visions. Always something
            new in bloom.
          </p>
        </div>
        <ul className="flex flex-wrap gap-4 text-sm text-ink-soft md:justify-center">
          <li>
            <Link className="hover:text-ink transition-colors" href="/work">
              Work
            </Link>
          </li>
          <li>
            <Link className="hover:text-ink transition-colors" href="/about">
              About
            </Link>
          </li>
          <li>
            <Link className="hover:text-ink transition-colors" href="/contact">
              Contact
            </Link>
          </li>
        </ul>
        <p className="text-xs text-ink-faint md:text-right font-mono">
          &copy; {year} · made with sun
        </p>
      </div>
    </footer>
  );
}
