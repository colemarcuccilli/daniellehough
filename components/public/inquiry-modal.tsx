"use client";

import { Suspense, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { buttonStyles } from "@/components/ui/button";
import { InquiryForm } from "@/components/public/inquiry-form";
import type { InquiryKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const KINDS: InquiryKind[] = ["retainer", "headshots", "event", "product", "mini_session", "other"];
const isKind = (v: string | null): v is InquiryKind => !!v && (KINDS as string[]).includes(v);

const HEADLINES: Record<InquiryKind, string> = {
  retainer: "Photography for your business",
  headshots: "Headshot day",
  event: "Event coverage",
  product: "Product, menu, or facility",
  mini_session: "Mini session dates",
  other: "Tell me about it",
};

type Ctx = { open: (kind?: InquiryKind) => void; close: () => void };
const InquiryContext = createContext<Ctx | null>(null);

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used inside <InquiryProvider>");
  return ctx;
}

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ open: boolean; kind: InquiryKind }>({ open: false, kind: "retainer" });
  const open = useCallback((kind?: InquiryKind) => setState({ open: true, kind: kind ?? "retainer" }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  useEffect(() => {
    if (!state.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [state.open, close]);

  return (
    <InquiryContext.Provider value={{ open, close }}>
      {children}
      {state.open ? <InquiryDialog kind={state.kind} onClose={close} /> : null}
    </InquiryContext.Provider>
  );
}

function InquiryDialog({ kind, onClose }: { kind: InquiryKind; onClose: () => void }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-h-[94vh] overflow-y-auto rounded-t-lg border border-ink bg-paper shadow-hard focus:outline-none sm:max-w-2xl sm:rounded-md"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="eyebrow mb-1">Start a project</p>
            <h2 id="inquiry-title" className="display text-2xl sm:text-3xl">{HEADLINES[kind]}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-ink transition-colors hover:bg-marigold"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <InquiryForm key={kind} initialKind={kind} source={pathname} />
        </div>
      </div>
    </div>
  );
}

export function InquiryButton({
  kind = "retainer",
  className,
  variant,
  size,
  children,
}: VariantProps<typeof buttonStyles> & { kind?: InquiryKind; className?: string; children: React.ReactNode }) {
  const { open } = useInquiry();
  return (
    <button type="button" onClick={() => open(kind)} className={cn(buttonStyles({ variant, size }), className)}>
      {children}
    </button>
  );
}

/** Opens the form when the URL carries ?inquire=<kind> (used by /contact redirects and emails). */
function InquiryFromUrlInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useInquiry();
  const kind = sp.get("inquire");
  useEffect(() => {
    if (!kind) return;
    open(isKind(kind) ? kind : "other");
    const params = new URLSearchParams(sp.toString());
    params.delete("inquire");
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [kind, open, router, pathname, sp]);
  return null;
}

export function InquiryFromUrl() {
  return (
    <Suspense fallback={null}>
      <InquiryFromUrlInner />
    </Suspense>
  );
}
