"use client";

import { useCallback, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { INQUIRY_KINDS, PACKAGE_EXTRAS, PUBLIC_INQUIRY_KINDS, type InquiryKind } from "@/lib/types";
import { submitInquiry } from "@/app/(public)/contact/actions";
import { Turnstile } from "@/components/public/turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const COUPLE_KINDS: InquiryKind[] = ["wedding", "engagement", "save_the_date"];
const COMPANY_KINDS: InquiryKind[] = ["planner", "retainer", "headshots", "event", "product"];

export function InquiryForm({
  initialKind = "wedding",
  source,
  signal = 0,
  onDone,
}: {
  initialKind?: InquiryKind;
  source?: string;
  /** Goes up each time the dock is opened with a choice: the form takes that choice and keeps what was typed. */
  signal?: number;
  onDone?: () => void;
}) {
  const [kind, setKind] = useState<InquiryKind>(initialKind);
  const [seen, setSeen] = useState(signal);
  if (signal !== seen) {
    setSeen(signal);
    setKind(initialKind);
  }
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);
  const [tsError, setTsError] = useState<string | null>(null);
  const onToken = useCallback((t: string | null) => setToken(t), []);
  const onTsError = useCallback((code: string) => setTsError(code), []);
  const couple = COUPLE_KINDS.includes(kind);
  const planner = kind === "planner";
  const company = COMPANY_KINDS.includes(kind);
  const needsToken = !!TURNSTILE_SITE_KEY && !token;
  const kinds = PUBLIC_INQUIRY_KINDS.includes(kind) ? PUBLIC_INQUIRY_KINDS : [kind, ...PUBLIC_INQUIRY_KINDS];
  const extras = PACKAGE_EXTRAS.filter((e) => e.value !== kind);

  if (done) {
    return (
      <div className="outline-card p-8 sm:p-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-marigold-deep/60 bg-marigold">
          <Check size={20} />
        </span>
        <h3 className="display mt-6 text-4xl">Got it.</h3>
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
      if (res.ok) {
        setDone(true);
        onDone?.();
      }
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
          {kinds.map((k) => (
            <option key={k} value={k}>
              {k === "planner" ? "I'm a wedding planner" : INQUIRY_KINDS[k]}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name">
          <Input id="name" name="name" required maxLength={120} autoComplete="name" placeholder="Full name" />
        </Field>
        {couple ? (
          <Field label="Partner's name" htmlFor="partner">
            <Input id="partner" name="partner" maxLength={120} placeholder="Full name" />
          </Field>
        ) : company ? (
          <Field label={planner ? "Your business" : "Company"} htmlFor="company">
            <Input id="company" name="company" maxLength={160} autoComplete="organization" placeholder="Business name" />
          </Field>
        ) : (
          <Field label="Location (optional)" htmlFor="location">
            <Input id="location" name="location" maxLength={160} placeholder="City" />
          </Field>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder="you@email.com" />
        </Field>
        <Field label="Phone (optional)" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="(260) 555-0100" />
        </Field>
      </div>

      {couple ? (
        <div className="grid items-start gap-5 sm:grid-cols-2">
          <Field label="Wedding date" htmlFor="timeline" hint="A month or season is fine if the date is not set.">
            <Input id="timeline" name="timeline" maxLength={200} placeholder="June 12, 2027" />
          </Field>
          <Field label="Venue or city" htmlFor="location">
            <Input id="location" name="location" maxLength={160} placeholder="Where it will be" />
          </Field>
        </div>
      ) : company ? (
        <Field label={planner ? "Where you work" : "Location"} htmlFor="location">
          <Input id="location" name="location" maxLength={160} placeholder="City or region" />
        </Field>
      ) : null}

      {couple ? (
        <fieldset className="grid gap-2">
          <legend className="caps mb-2 text-[0.64rem] text-sage">Add to your package (optional)</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {extras.map((e) => (
              <label
                key={e.value}
                className="flex cursor-pointer items-center gap-3 rounded-xs border border-line-strong bg-paper px-3.5 py-3 text-sm transition-colors hover:border-sage has-[:checked]:border-sage has-[:checked]:bg-sage-soft"
              >
                <input type="checkbox" name="extras" value={e.value} className="h-4 w-4 accent-[var(--color-sage-deep)]" />
                {e.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <Field label={couple ? "Anything else? (optional)" : "Tell me about it"} htmlFor="message">
        <Textarea
          id="message"
          name="message"
          required={!couple}
          maxLength={4500}
          rows={couple ? 3 : 5}
          placeholder={
            couple
              ? "Guest count, timing, questions."
              : planner
                ? "How many weddings you plan a year, and what you want for your couples."
                : "What you need photographed, and when."
          }
        />
      </Field>

      {TURNSTILE_SITE_KEY ? (
        <>
          <input type="hidden" name="cf-turnstile-response" value={token ?? ""} />
          <input type="hidden" name="cf-turnstile-error" value={tsError ?? ""} />
          <Turnstile key={widgetKey} siteKey={TURNSTILE_SITE_KEY} onToken={onToken} onError={onTsError} />
          {tsError ? (
            <p className="text-xs text-coral">Verification could not load. Refresh the page and try again.</p>
          ) : null}
        </>
      ) : null}

      {error ? <p className="text-sm text-coral">{error}</p> : null}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-ink-faint max-w-xs">Reply within two business days. No newsletters.</p>
        <Button type="submit" variant="primary" size="lg" disabled={pending || needsToken}>
          {pending ? "Sending…" : couple ? "Get my quote" : "Send"}
        </Button>
      </div>
    </form>
  );
}
