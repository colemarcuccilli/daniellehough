"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function NavPill({ href, label, accent }: { href: string; label: string; accent: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      style={{ "--accent": accent } as CSSProperties}
      className={cn(
        "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
        "hover:bg-[var(--accent)] hover:text-ink",
        active ? "bg-cream/12 text-cream" : "text-cream/85",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} aria-hidden />
      {label}
    </Link>
  );
}
