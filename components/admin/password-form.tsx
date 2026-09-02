"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { changePassword } from "@/app/admin/actions";

export function PasswordForm() {
  const [pending, start] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    start(async () => {
      const res = await changePassword(data);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Password updated");
      form.reset();
    });
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-4 max-w-sm">
      <Field label="New password" htmlFor="password" hint="At least 10 characters.">
        <Input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" />
      </Field>
      <Field label="Confirm" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" />
      </Field>
      <div>
        <Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving…" : "Update password"}</Button>
      </div>
    </form>
  );
}
