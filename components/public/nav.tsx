import Link from "next/link";
import { BrandLink } from "@/components/public/logo";
import { MobileMenu } from "@/components/public/mobile-menu";
import { buttonStyles } from "@/components/ui/button";

export const NAV_LINKS = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-md border-b border-line">
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        <BrandLink />
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="px-3 py-2 text-sm text-ink-soft hover:text-ink rounded-sm hover:bg-cream transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="ml-3">
            <Link href="/contact?kind=retainer" className={buttonStyles({ variant: "outline", size: "sm" })}>
              Start a project
            </Link>
          </li>
        </ul>
        <MobileMenu links={NAV_LINKS} />
      </nav>
    </header>
  );
}
