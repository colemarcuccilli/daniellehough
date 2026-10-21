"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { BrandLink } from "@/components/public/logo";
import { Sprig } from "@/components/public/sprig";

export function MobileMenu({ links }: { links: { href: string; label: string; accent: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // true only after hydration, so the portal never renders during SSR/hydration.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  // Close the sheet whenever navigation happens.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Rendered through a portal: the blurred fixed header would otherwise become
  // the containing block for a fixed panel and squash it to zero height.
  const panel =
    open && mounted
      ? createPortal(
          <div id="mobile-menu" className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-sage-deep text-cream">
            <Sprig className="pointer-events-none absolute -right-10 -bottom-6 h-72 w-auto text-cream opacity-20" />
            <div className="flex h-[4.25rem] items-center justify-between px-4">
              <span onClick={() => setOpen(false)}>
                <BrandLink tone="dark" subtitle={false} />
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/50 text-cream"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="relative flex-1 px-5 pt-8 grid content-start gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="display flex items-center gap-4 border-b border-cream/15 py-4 text-[2.9rem] leading-none"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.accent }} aria-hidden />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="relative px-5 pb-8" onClick={() => setOpen(false)}>
              <InquiryButton variant="primary" size="lg" className="w-full">Start a project</InquiryButton>
              <p className="caps mt-4 text-[0.6rem] text-cream/60">Danielle Hough · Photographer · Indiana</p>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/60 bg-cream text-ink"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>
      {panel}
    </div>
  );
}
