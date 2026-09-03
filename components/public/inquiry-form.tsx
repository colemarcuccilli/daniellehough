"use client";

import { useCallback, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { INQUIRY_KINDS, BUDGET_OPTIONS, type InquiryKind } from "@/lib/types";
import { submitInquiry } from "@/app/(public)/contact/actions";
import { Turnstile } from "@/components/public/turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const BUSINESS_KINDS: InquiryKind[] = ["retainer", "headshots", "event", "product"];

export function InquiryForm({ initialKind = "retainer", source }: { initialKind?: InquiryKind; source?: string }) {
  const [kind, setKind] = useState<InquiryKind>(initialKind);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);
  const onToken = useCallback((t: string | null) => setToken(t), []);
  const business = BUSINESS_KINDS.includes(kind);
  const needsToken = !!TURNSTILE_SITE_KEY && !token;

  if (done) {
    return (
      <div className="outline-card p-8 sm:p-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-marigold border border-ink">
          <Check size={20} />
        </span>
        <h3 className="display text-3xl mt-6">Got it.</h3>
        <p className="mt-3 text-ink-soft leading-relaxed">I reply within two business days.</p>
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
      else {
        setError(res.error);
        // Turnstile tokens are single-use: mount a fresh widget for the retry.
        if (TURNSTILE_SITE_KEY) {
          setToken(null);
          setWidgetKey((k) => k + 1);
        }
      }
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
          <Input id="timeline" name="timeline" maxLength={200} placeholder={business ? "Starting when?" : "Preferred dates"} />
        </Field>
      </div>

      {business ? (
        <Field label="Location" htmlFor="location">
          <Input id="location" name="location" maxLength={160} placeholder="City, or how many locations" />
        </Field>
      ) : null}

      <Field label="Tell me about it" htmlFor="message">
        <Textarea id="message" name="message" required minLength={10} maxLength={5000} rows={5} placeholder="What the photographs need to do, and for whom." />
      </Field>

      {TURNSTILE_SITE_KEY ? (
        <>
          <input type="hidden" name="cf-turnstile-response" value={token ?? ""} />
          <Turnstile key={widgetKey} siteKey={TURNSTILE_SITE_KEY} onToken={onToken} />
        </>
      ) : null}

      {error ? <p className="text-sm text-coral">{error}</p> : null}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-ink-faint max-w-xs">Two business days. No newsletters.</p>
        <Button type="submit" variant="primary" size="lg" disabled={pending || needsToken}>
          {pending ? "Sending…" : "Send inquiry"}
        </Button>
      </div>
    </form>
  );
}
