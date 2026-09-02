import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const inputStyles =
  "h-11 w-full rounded-sm border border-ink/25 bg-paper px-3 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:ring-2 focus:ring-marigold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(inputStyles, className)} {...props} />,
);
Input.displayName = "Input";
