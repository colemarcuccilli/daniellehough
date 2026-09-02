"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { signIn } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const res = await signIn(data);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const target = next && next.startsWith("/admin") ? next : "/admin";
      router.push(target);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" autoFocus placeholder="you@visionaryhaus.co" />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" required autoComplete="current-password" minLength={6} placeholder="••••••••••" />
      </Field>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Opening the studio…" : "Sign in"}
      </Button>
      <p className="text-xs text-ink-faint text-center">Only studio admins can sign in.</p>
    </form>
  );
}
