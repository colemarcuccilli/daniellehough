import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  body,
  action,
  className,
  size = "md",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: { href: string; label: string };
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-6", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 className={cn("display", size === "lg" ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl")}>{title}</h2>
        {body ? <p className="mt-4 text-ink-soft leading-relaxed text-[17px]">{body}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-1.5 text-sm font-medium border-b border-ink pb-0.5 hover:text-marigold-deep hover:border-marigold-deep transition-colors"
        >
          {action.label}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
}
