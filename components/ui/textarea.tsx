import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-sm border border-ink/25 bg-paper px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-faint",
        "focus:outline-none focus:border-ink focus:ring-2 focus:ring-marigold/50",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-y",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
