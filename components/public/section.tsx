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
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h2 className={cn("display", size === "lg" ? "text-6xl sm:text-7xl lg:text-8xl" : "text-5xl sm:text-6xl")}>{title}</h2>
        {body ? <p className="mt-4 text-ink-soft leading-relaxed text-[17px]">{body}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="caps group inline-flex items-center gap-2 border-b border-sage pb-1 text-[0.64rem] text-ink transition-colors hover:border-marigold-deep hover:text-marigold-deep"
        >
          {action.label}
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
}
