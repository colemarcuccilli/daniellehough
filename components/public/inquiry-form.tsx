"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { INQUIRY_KINDS, BUDGET_OPTIONS, type InquiryKind } from "@/lib/types";
import { submitInquiry } from "@/app/(public)/contact/actions";

const BUSINESS_KINDS: InquiryKind[] = ["retainer", "headshots", "event", "product"];

export function InquiryForm({ initialKind = "retainer", source }: { initialKind?: InquiryKind; source?: string }) {
  const [kind, setKind] = useState<InquiryKind>(initialKind);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const business = BUSINESS_KINDS.includes(kind);

  if (done) {
    return (
      <div className="outline-card p-8 sm:p-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-marigold border border-ink">
          <Check size={20} />
        </span>
        <h3 className="display text-3xl mt-6">Got it. Thank you.</h3>
        <p className="mt-3 text-ink-soft leading-relaxed">
          I read every inquiry personally and reply within two business days. If it is time-sensitive, say so in a
          follow-up email and I will move it up.
        </p>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const res = await submitInquiry(data);
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      <input type="hidden" name="source" value={source ?? ""} />
      {/* honeypot */}
      <div className="absolute -left-[9999px] top-0" aria-hidden>
        <label>
          Leave this field empty <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="What do you need?" htmlFor="kind">
        <Select id="kind" name="kind" value={kind} onChange={(e) => setKind(e.target.value as InquiryKind)}>
          {(Object.keys(INQUIRY_KINDS) as InquiryKind[]).map((k) => (
            <option key={k} value={k}>
              {INQUIRY_KINDS[k]}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name">
          <Input id="name" name="name" required maxLength={120} autoComplete="name" placeholder="Full name" />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder="you@company.com" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone (optional)" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="(260) 555-0100" />
        </Field>
        {business ? (
          <Field label="Company" htmlFor="company">
            <Input id="company" name="company" maxLength={160} autoComplete="organization" placeholder="Business name" />
          </Field>
        ) : (
          <Field label="Location (optional)" htmlFor="location">
            <Input id="location" name="location" maxLength={160} placeholder="City or venue" />
          </Field>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Budget" htmlFor="budget">
          <Select id="budget" name="budget" defaultValue="">
            <option value="">Choose a range</option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Timeline" htmlFor="timeline">
          <Input id="timeline" name="timeline" maxLength={200} placeholder={business ? "e.g. starting Q4, or a date" : "Preferred dates"} />
        </Field>
      </div>

      {business ? (
        <Field label="Location" htmlFor="location">
          <Input id="location" name="location" maxLength={160} placeholder="City, or how many locations" />
        </Field>
      ) : null}

      <Field label="Tell me about it" htmlFor="message" hint="What should the photos do for you? Who will see them?">
        <Textarea id="message" name="message" required minLength={10} maxLength={5000} rows={6} placeholder="The more specific, the faster I can quote it." />
      </Field>

      {error ? <p className="text-sm text-coral">{error}</p> : null}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-ink-faint max-w-xs">I reply within two business days. No newsletters, no spam.</p>
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send inquiry"}
        </Button>
      </div>
    </form>
  );
}
