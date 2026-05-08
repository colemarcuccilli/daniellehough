import Link from "next/link";

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-line/50">
      <nav className="mx-auto max-w-6xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Danielle Hough — home"
          className="group flex items-center gap-2"
        >
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-marigold text-ink font-display font-semibold text-sm transition-transform group-hover:rotate-12">
            d
          </span>
          <span className="font-display text-base tracking-tight hidden sm:inline">
            Danielle Hough
          </span>
        </Link>
        <ul className="flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="px-3 py-2 text-sm text-ink-soft hover:text-ink transition-colors rounded-md hover:bg-cream"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
