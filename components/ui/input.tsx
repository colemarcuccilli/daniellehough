import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-lg border border-ink/15 bg-bg px-3 text-base text-ink placeholder:text-ink-faint",
      "focus:outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/30",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "transition-colors",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
