"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function NavItem({ href, label, accent }: { href: string; label: string; accent: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      style={{ "--accent": accent } as CSSProperties}
      className={cn(
        "group relative py-2 text-sm font-medium tracking-wide transition-colors",
        active ? "text-cream" : "text-cream/75 hover:text-cream",
      )}
    >
      {label}
      <span
        className={cn(
          "absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100",
          active && "scale-x-100",
        )}
        style={{ background: accent }}
        aria-hidden
      />
    </Link>
  );
}
