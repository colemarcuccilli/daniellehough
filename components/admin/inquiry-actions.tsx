"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { deleteInquiry, saveInquiryNotes, setInquiryStatus } from "@/app/admin/actions";
import { INQUIRY_STATUSES, type Inquiry, type InquiryStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function InquiryActions({ inquiry }: { inquiry: Inquiry }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const setStatus = (status: InquiryStatus) =>
    start(async () => {
      const res = await setInquiryStatus(inquiry.id, status);
      if (!res.ok) return void toast.error(res.error);
      toast.success(`Marked ${INQUIRY_STATUSES[status].toLowerCase()}`);
      router.refresh();
    });

  const onNotes = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveInquiryNotes(inquiry.id, data);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Notes saved");
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!window.confirm("Delete this inquiry permanently?")) return;
    start(async () => {
      const res = await deleteInquiry(inquiry.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Inquiry deleted");
      router.push("/admin/inquiries");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-3">Status</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(INQUIRY_STATUSES) as InquiryStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-xs border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                inquiry.status === s ? "border-ink bg-ink text-cream" : "border-ink hover:bg-marigold",
              )}
            >
              {INQUIRY_STATUSES[s]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onNotes} className="grid gap-3">
        <Field label="Private notes" htmlFor="admin_notes" hint="Only visible here.">
          <Textarea id="admin_notes" name="admin_notes" rows={4} maxLength={5000} defaultValue={inquiry.admin_notes ?? ""} placeholder="Quoted $X on 9/3, waiting on dates…" />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="outline" size="sm" disabled={pending}>Save notes</Button>
        </div>
      </form>

      <div className="border-t border-line pt-5 flex justify-end">
        <Button variant="danger" size="sm" onClick={onDelete} disabled={pending}>
          <Trash2 size={14} /> Delete inquiry
        </Button>
      </div>
    </div>
  );
}
