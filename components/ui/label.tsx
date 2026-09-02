import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";
