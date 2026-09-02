"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  exact,
  icon,
  badge,
  children,
}: {
  href: string;
  exact?: boolean;
  icon?: React.ReactNode;
  badge?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-sm border px-3 py-2 text-sm whitespace-nowrap transition-colors",
        active ? "bg-marigold text-ink border-ink" : "text-ink-soft border-transparent hover:bg-cream hover:text-ink",
      )}
    >
      {icon}
      <span>{children}</span>
      {badge ? (
        <span className="ml-auto rounded-full bg-coral px-1.5 py-0.5 font-mono text-[10px] leading-none text-paper">{badge}</span>
      ) : null}
    </Link>
  );
}
