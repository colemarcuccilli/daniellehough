import { BrandLink } from "@/components/public/logo";
import { MobileMenu } from "@/components/public/mobile-menu";
import { NavPill } from "@/components/public/nav-pill";
import { InquiryButton } from "@/components/public/inquiry-modal";

export const NAV_LINKS = [
  { href: "/portfolio", label: "Portfolio", accent: "var(--color-marigold)" },
  { href: "/services", label: "Services", accent: "var(--color-teal)" },
  { href: "/about", label: "About", accent: "var(--color-purple)" },
];

/** Floating ink pill instead of a full-width bar. */
export function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 px-3 sm:top-5 sm:px-5">
      <nav className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-ink bg-ink/95 p-1.5 pl-1.5 text-cream shadow-[4px_4px_0_0_var(--color-marigold)] backdrop-blur-md">
        <BrandLink tone="dark" />
        <ul className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <NavPill {...l} />
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5">
          <InquiryButton variant="pill" size="sm" className="h-9 px-4">
            Start a project
          </InquiryButton>
          <MobileMenu links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  );
}
