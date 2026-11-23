"use client";

import { Suspense, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { buttonStyles } from "@/components/ui/button";
import { InquiryForm } from "@/components/public/inquiry-form";
import { ALL_INQUIRY_KINDS, type InquiryKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const isKind = (v: string | null): v is InquiryKind => !!v && (ALL_INQUIRY_KINDS as string[]).includes(v);

const HEADLINES: Record<InquiryKind, string> = {
  wedding: "Check your date",
  engagement: "Engagement session",
  save_the_date: "Save-the-date photos",
  planner: "Partner with Dani Cams",
  retainer: "Photography for your business",
  headshots: "Headshot day",
  event: "Event coverage",
  product: "Product, menu, or facility",
  mini_session: "Family session",
  other: "Tell me about it",
};

type Ctx = { open: (kind?: InquiryKind) => void; close: () => void };
const InquiryContext = createContext<Ctx | null>(null);

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used inside <InquiryProvider>");
  return ctx;
}

/** The first question, shown in the bar. Tapping an answer opens the form with it chosen. */
const BAR_CHOICES: { kind: InquiryKind; label: string }[] = [
  { kind: "wedding", label: "Wedding" },
  { kind: "engagement", label: "Engagement" },
  { kind: "save_the_date", label: "Save the date" },
];

/** Links that open the form: <a href="#start">, with data-kind to pick the answer. */
const ANCHOR = "#start";

/**
 * The bottom form dock (see Sweet Dreams' docs/BOTTOM-FORM-DOCK.md): a bar
 * that always sits along the bottom with the form's first question, and the
 * whole form as a sheet that rises from the bottom. Every InquiryButton, every
 * #start link and ?inquire=<kind> open the same sheet.
 */
export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [kind, setKind] = useState<InquiryKind>("wedding");
  const [signal, setSignal] = useState(0);
  const [everOpened, setEverOpened] = useState(false);
  const [sent, setSent] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((k?: InquiryKind) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setKind(k ?? "wedding");
    setSignal((n) => n + 1);
    setEverOpened(true);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    if (window.location.hash === ANCHOR) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    openerRef.current?.focus({ preventScroll: true });
  }, []);

  // The page behind stops scrolling, Escape closes, focus moves into the form.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => sheetRef.current?.focus({ preventScroll: true }), 60);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [isOpen, close]);

  // #start links anywhere on the page, and arriving with #start in the address.
  useEffect(() => {
    const kindOf = (v?: string) => (isKind(v ?? null) ? (v as InquiryKind) : undefined);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.(`a[href="${ANCHOR}"]`) as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault();
      open(kindOf(a.dataset.kind));
    };
    const onHash = () => {
      if (window.location.hash === ANCHOR) open();
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash);
    };
  }, [open]);

  const planner = pathname === "/planners";
  const barShown = !sent && !isOpen;

  return (
    <InquiryContext.Provider value={{ open, close }}>
      {children}

      {/* Room at the bottom of the page so the bar never covers the footer. */}
      {!sent ? <div className="h-28 bg-cream lg:h-24" aria-hidden /> : null}

      {/* The bar */}
      {!sent ? (
        <div
          inert={!barShown}
          aria-hidden={!barShown}
          className={cn(
            "fixed inset-x-0 bottom-0 z-30 mx-auto w-full border-t border-sage bg-paper px-4 pt-3 shadow-[0_-10px_40px_-18px_rgba(35,40,35,0.55)] transition-transform duration-500 ease-out motion-reduce:transition-none",
            "rounded-t-md pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
            "lg:bottom-4 lg:rounded-md lg:border lg:px-5 lg:py-3",
            planner ? "lg:max-w-[460px]" : "lg:max-w-[760px]",
            barShown ? "translate-y-0" : "translate-y-[calc(100%+2rem)]",
          )}
        >
          {planner ? (
            <button
              type="button"
              onClick={() => open("planner")}
              className={cn(buttonStyles({ variant: "primary", size: "lg" }), "m-0 w-full")}
            >
              Partner with Dani Cams
            </button>
          ) : (
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-5">
              <p className="caps shrink-0 text-center text-[0.64rem] text-sage lg:text-left">What do you need?</p>
              <div className="grid flex-1 grid-cols-3 gap-2">
                {BAR_CHOICES.map((c, i) => (
                  <button
                    key={c.kind}
                    type="button"
                    onClick={() => open(c.kind)}
                    className={cn(
                      buttonStyles({ variant: i === 0 ? "primary" : "outline", size: "md" }),
                      "m-0 h-11 whitespace-normal px-2 text-center text-[10.5px] leading-tight tracking-[0.12em] sm:text-[11px] sm:tracking-[0.16em]",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* The dimmed page */}
      <div
        onClick={close}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[70] bg-[rgba(35,40,35,0.62)] transition-opacity duration-300 motion-reduce:transition-none",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* The sheet */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[80] mx-auto flex max-h-[90svh] w-full flex-col rounded-t-md border border-b-0 border-sage bg-paper shadow-soft focus:outline-none",
          "transition-[transform,visibility] duration-500 ease-out motion-reduce:transition-none lg:max-w-[600px]",
          isOpen ? "visible translate-y-0" : "invisible translate-y-full",
        )}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="flex w-full shrink-0 justify-center pb-1 pt-2.5"
        >
          <span className="h-1 w-10 rounded-full bg-line-strong" aria-hidden />
        </button>
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-1 sm:px-7">
          <div>
            <p className="eyebrow mb-1">{kind === "planner" ? "For planners" : "Get a quote"}</p>
            <h2 id="inquiry-title" className="display text-3xl sm:text-4xl">{HEADLINES[kind]}</h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border border-line-strong transition-colors hover:border-sage hover:bg-cream"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          {everOpened ? (
            <InquiryForm initialKind={kind} signal={signal} source={pathname} onDone={() => setSent(true)} />
          ) : null}
        </div>
      </div>
    </InquiryContext.Provider>
  );
}

export function InquiryButton({
  kind = "wedding",
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
    open(isKind(kind) ? kind : "wedding");
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
