"use client";

import { useState, useTransition, useRef } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { captureSpark } from "@/app/atelier/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CaptureSpark() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    start(async () => {
      try {
        await captureSpark(data);
        form.reset();
        setOpen(false);
        toast.success("Caught. It's safe in the constellation.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't catch it");
      }
    });
  };

  return (
    <section id="capture" className="paper p-6 lg:p-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-marigold text-ink">
            <Sparkles size={16} />
          </span>
          <div>
            <p className="font-display text-2xl tracking-tight">
              Catch a spark
            </p>
            <p className="text-xs text-ink-faint">
              just a name is enough — details can wait
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "text-ink-faint transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="mt-6 grid gap-5"
          autoComplete="off"
        >
          <div className="grid gap-2">
            <Label htmlFor="title">Idea</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={120}
              autoFocus
              placeholder="e.g. golden-hour series at the empty parking lot"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">A few lines</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="optional — what does it look like? why does it matter?"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue="other"
                className="h-11 w-full rounded-lg border border-ink/15 bg-bg px-3 text-sm text-ink focus:outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/30"
              >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="series">Series</option>
                <option value="mixed">Mixed</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="energy">Energy (1–5)</Label>
              <Input
                id="energy"
                name="energy"
                type="number"
                min={1}
                max={5}
                placeholder="optional"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="comma, separated"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              cancel
            </Button>
            <Button
              type="submit"
              variant="marigold"
              disabled={pending}
            >
              {pending ? "catching…" : "Hold this idea"}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
