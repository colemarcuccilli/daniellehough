import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { InquiryActions } from "@/components/admin/inquiry-actions";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { INQUIRY_KINDS, INQUIRY_STATUSES, type Inquiry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("inquiries").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  let inquiry = data as Inquiry;

  // Opening an inquiry marks it read.
  if (inquiry.status === "new") {
    await supabase.from("inquiries").update({ status: "read" }).eq("id", id).eq("status", "new");
    inquiry = { ...inquiry, status: "read" };
  }

  const details: Array<[string, string | null]> = [
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Company", inquiry.company],
    ["Budget", inquiry.budget],
    ["Timeline", inquiry.timeline],
    ["Location", inquiry.location],
    ["Came from", inquiry.source],
  ];
  const subject = encodeURIComponent(`Re: your ${INQUIRY_KINDS[inquiry.kind].toLowerCase()} inquiry — Dani Cams`);
  const body = encodeURIComponent(`Hi ${inquiry.name.split(" ")[0]},\n\nThanks for reaching out about ${INQUIRY_KINDS[inquiry.kind].toLowerCase()}.\n\n`);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link href="/admin/inquiries" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={14} /> Inquiries
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="marigold">{INQUIRY_KINDS[inquiry.kind]}</Badge>
              <Badge tone="cream">{INQUIRY_STATUSES[inquiry.status]}</Badge>
            </div>
            <h1 className="display text-4xl mt-3">{inquiry.name}</h1>
            <p className="text-sm text-ink-soft mt-1">
              {formatDate(inquiry.created_at, { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex gap-2">
            <a href={`mailto:${inquiry.email}?subject=${subject}&body=${body}`} className={buttonStyles({ variant: "primary" })}>
              <Mail size={15} /> Reply by email
            </a>
            {inquiry.phone ? (
              <a href={`tel:${inquiry.phone}`} className={buttonStyles({ variant: "outline" })}>
                <Phone size={15} /> Call
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="outline-card p-6">
            <p className="eyebrow mb-3">Message</p>
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{inquiry.message}</p>
          </section>
          <section className="outline-card-soft p-6">
            <dl className="grid gap-3 sm:grid-cols-2">
              {details.filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{k}</dt>
                  <dd className="text-sm mt-0.5 break-words">
                    {k === "Email" ? <a className="underline underline-offset-4" href={`mailto:${v}`}>{v}</a> : v}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <aside className="outline-card p-6">
          <InquiryActions inquiry={inquiry} />
        </aside>
      </div>
    </div>
  );
}
