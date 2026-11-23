import { BrandLink } from "@/components/public/logo";
import { MobileMenu } from "@/components/public/mobile-menu";
import { NavItem } from "@/components/public/nav-item";
import { NavShell } from "@/components/public/nav-shell";
import { InquiryButton } from "@/components/public/inquiry-modal";

export const NAV_LINKS = [
  { href: "/services", label: "Services", accent: "var(--color-marigold)" },
  { href: "/portfolio", label: "Portfolio", accent: "var(--color-blush)" },
  { href: "/about", label: "About", accent: "var(--color-green)" },
  { href: "/planners", label: "For planners", accent: "var(--color-blush)" },
];

export function Nav() {
  return (
    <NavShell>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:h-[4.5rem] sm:px-8">
        <BrandLink tone="dark" />
        <ul className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <NavItem {...l} />
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <InquiryButton variant="cream" size="sm" className="h-9 px-4">
            Check your date
          </InquiryButton>
          <MobileMenu links={NAV_LINKS} />
        </div>
      </nav>
    </NavShell>
  );
}
