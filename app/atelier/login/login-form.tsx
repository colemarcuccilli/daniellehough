"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sendMagicLink } from "./actions";
import { Mail } from "lucide-react";

export function LoginForm({
  next,
  sent: initialSent,
}: {
  next?: string;
  sent: boolean;
}) {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(initialSent);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      try {
        await sendMagicLink(data);
        setSent(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't send link");
      }
    });
  };

  if (sent) {
    return (
      <div className="paper p-6 grain">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-marigold text-ink">
            <Mail size={16} />
          </span>
          <p className="font-display text-xl">Check your inbox.</p>
        </div>
        <p className="text-sm text-ink-soft leading-relaxed">
          If that email is allowed, a one-time link is on its way. Open it
          on this device.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="next" value={next ?? "/atelier"} />
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="you@dreamspot.com"
        />
      </div>
      {error ? (
        <p className="text-sm text-terracotta">{error}</p>
      ) : null}
      <Button
        type="submit"
        variant="marigold"
        size="lg"
        disabled={pending}
      >
        {pending ? "sending…" : "Send my magic link"}
      </Button>
      <p className="text-xs text-ink-faint text-center">
        Only the studio&rsquo;s registered email will receive a link.
      </p>
    </form>
  );
}
