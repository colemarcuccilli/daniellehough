"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const subscribe = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};

/** Transparent over the masthead; becomes a slim ink bar once the page scrolls. */
export function NavShell({ children }: { children: React.ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, () => window.scrollY > 32, () => false);
  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className={cn(
        "fixed inset-x-0 top-0 z-40 text-cream transition-[background-color,box-shadow] duration-300",
        scrolled ? "bg-ink/92 backdrop-blur-md shadow-[0_1px_0_0_rgba(250,245,234,0.08)]" : "bg-transparent",
      )}
    >
      {children}
    </header>
  );
}
