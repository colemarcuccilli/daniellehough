"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
      {open ? (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-40 bg-bg border-t border-line">
          <ul className="px-5 py-6 grid gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center justify-between py-4 display text-3xl border-b border-line"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-6">
              <Link href="/contact?kind=retainer" className={buttonStyles({ variant: "primary", size: "lg" }) + " w-full"}>
                Start a project
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
