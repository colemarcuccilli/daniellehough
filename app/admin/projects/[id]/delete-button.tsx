"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteProject } from "@/app/admin/actions";

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      variant="danger"
      size="sm"
      confirmText={`Delete "${title}" and all of its web photos? This cannot be undone.`}
      action={() => deleteProject(id)}
      successMessage="Project deleted"
      onDone={() => {
        router.push("/admin/projects");
        router.refresh();
      }}
    >
      <Trash2 size={14} /> Delete project
    </ConfirmButton>
  );
}
