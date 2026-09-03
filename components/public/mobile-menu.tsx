"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { BrandLink } from "@/components/public/logo";

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
          <div id="mobile-menu" className="fixed inset-0 z-50 flex flex-col bg-ink text-cream">
            <div className="flex h-[4.25rem] items-center justify-between px-4">
              <span onClick={() => setOpen(false)}>
                <BrandLink tone="dark" />
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-ink"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="flex-1 px-5 pt-6 grid content-start gap-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="display flex items-center gap-4 py-3 text-[2.75rem] leading-none"
                  >
                    <span className="h-3 w-3 rounded-full" style={{ background: l.accent }} aria-hidden />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="px-5 pb-8" onClick={() => setOpen(false)}>
              <InquiryButton variant="pill" size="lg" className="w-full">Start a project</InquiryButton>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/60">Danielle Hough · Indiana</p>
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
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>
      {panel}
    </div>
  );
}
