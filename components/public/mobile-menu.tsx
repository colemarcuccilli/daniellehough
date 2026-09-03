"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { LogoMark, Wordmark } from "@/components/public/logo";

export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
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

  // Rendered through a portal: the blurred sticky header would otherwise become
  // the containing block for a fixed panel and squash it to zero height.
  const panel =
    open && mounted
      ? createPortal(
          <div id="mobile-menu" className="fixed inset-0 z-50 flex flex-col bg-bg">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                <LogoMark height={30} />
                <Wordmark />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-ink bg-paper"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="px-5 py-6 grid gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 display text-3xl border-b border-line"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="pt-6" onClick={() => setOpen(false)}>
                <InquiryButton variant="primary" size="lg" className="w-full">Start a project</InquiryButton>
              </li>
            </ul>
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
        className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-ink bg-paper"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {panel}
    </div>
  );
}
