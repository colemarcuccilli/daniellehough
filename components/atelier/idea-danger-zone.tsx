"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2, RotateCcw } from "lucide-react";
import {
  archiveIdea,
  unarchiveIdea,
  deleteIdea,
} from "@/app/atelier/actions";
import { Button } from "@/components/ui/button";
import type { IdeaStatus } from "@/lib/types";
import { toast } from "sonner";

export function IdeaDangerZone({
  id,
  status,
}: {
  id: string;
  status: IdeaStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const onArchive = () => {
    if (
      !confirm(
        status === "active"
          ? "Archive this active project? It will be removed from production. Sometimes that's the right move."
          : "Archive this idea?",
      )
    )
      return;
    start(async () => {
      try {
        await archiveIdea(id);
        toast.success("Archived. The desk is clearer.");
        router.push("/atelier");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't archive");
      }
    });
  };

  const onUnarchive = () => {
    start(async () => {
      try {
        await unarchiveIdea(id);
        toast.success("Back on the table.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't unarchive");
      }
    });
  };

  const onDelete = () => {
    if (!confirm("Delete forever? This can't be undone.")) return;
    start(async () => {
      try {
        await deleteIdea(id);
        toast.success("Gone.");
        router.push("/atelier/archive");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't delete");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 ml-auto">
      {status === "archived" ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={onUnarchive}
          >
            <RotateCcw size={14} />
            unarchive
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={pending}
            onClick={onDelete}
          >
            <Trash2 size={14} />
            delete forever
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={onArchive}
        >
          <Archive size={14} />
          archive
        </Button>
      )}
    </div>
  );
}
