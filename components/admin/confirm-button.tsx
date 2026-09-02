"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { ActionResult } from "@/app/admin/actions";

export function ConfirmButton({
  confirmText,
  action,
  onDone,
  successMessage,
  children,
  ...props
}: ButtonProps & {
  confirmText: string;
  action: () => Promise<ActionResult<unknown>>;
  onDone?: () => void;
  successMessage?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      {...props}
      disabled={pending || props.disabled}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        start(async () => {
          const res = await action();
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          if (successMessage) toast.success(successMessage);
          onDone?.();
        });
      }}
    >
      {children}
    </Button>
  );
}
