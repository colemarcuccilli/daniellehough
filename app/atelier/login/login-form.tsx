"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn } from "./actions";
import { useRouter } from "next/navigation";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      try {
        await signIn(data);
        router.push(next || "/atelier");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something didn't line up.",
        );
      }
    });
  };

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
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          minLength={6}
          placeholder="••••••••••"
        />
      </div>
      {error ? <p className="text-sm text-terracotta">{error}</p> : null}
      <Button
        type="submit"
        variant="marigold"
        size="lg"
        disabled={pending}
      >
        {pending ? "opening the studio…" : "Sign in"}
      </Button>
      <p className="text-xs text-ink-faint text-center">
        Only the studio owner can sign in.
      </p>
    </form>
  );
}
