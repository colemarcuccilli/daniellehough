"use client";

import { useTransition } from "react";
import { Flame } from "lucide-react";
import { activateIdea } from "@/app/atelier/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ActivateButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="marigold"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            `Pull "${title}" into production? Everything else stays held.`,
          )
        )
          return;
        start(async () => {
          try {
            await activateIdea(id);
            toast.success("This is the one. Get to work.");
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : "Couldn't activate",
            );
          }
        });
      }}
    >
      <Flame size={14} />
      {pending ? "lighting…" : "Make this the one"}
    </Button>
  );
}
