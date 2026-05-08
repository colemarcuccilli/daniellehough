import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeStyles = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        cream: "bg-cream text-ink-soft border border-line",
        marigold: "bg-marigold/20 text-marigold-deep border border-marigold/40",
        ink: "bg-ink text-bg",
        terracotta: "bg-terracotta/15 text-terracotta border border-terracotta/30",
        moss: "bg-moss/15 text-moss border border-moss/30",
        outline: "bg-bg text-ink-soft border border-ink/15",
      },
    },
    defaultVariants: { tone: "cream" },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeStyles>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)} {...props} />;
}
