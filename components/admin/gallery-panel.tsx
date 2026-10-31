"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Check, Copy, ExternalLink, FolderSync, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { galleryUrl } from "@/lib/gallery";
import type { Project, Section } from "@/lib/types";
import { createSection, deleteSection, regenerateGallerySlug, renameSection, reorderSections, updateGallery } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

/**
 * Client gallery controls for one project: the share link, the switches, and
 * the sections (ceremony, cocktail hour, reception…) photos are grouped into.
 */
export function GalleryPanel({ project, sections, photoCount }: { project: Project; sections: Section[]; photoCount: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [enabled, setEnabled] = useState(project.gallery_enabled);
  const [downloads, setDownloads] = useState(project.gallery_downloads);
  const [slug, setSlug] = useState(project.gallery_slug);
  const [copied, setCopied] = useState(false);
  const [newName, setNewName] = useState("");
  const [syncing, setSyncing] = useState(false);

  /** Processes anything in this project's bucket folders that is not on the site yet. */
  const syncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/import/sync?project=${project.id}`, { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; scanned?: number; processed?: number; remaining?: number; failed?: { path: string; error: string }[]; skipped_folders?: string[] };
      if (!res.ok || !json.ok) throw new Error(json.error || `Sync failed (${res.status})`);
      const bits = [`${json.processed ?? 0} added`];
      if (json.remaining) bits.push(`${json.remaining} still queued (continuing in the background)`);
      if (json.failed?.length) bits.push(`${json.failed.length} failed`);
      if (json.skipped_folders?.length) bits.push(`ignored folders: ${json.skipped_folders.join(", ")}`);
      toast.success(`Bucket scanned: ${json.scanned ?? 0} files · ${bits.join(" · ")}`, { duration: 8000 });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const link = slug ? galleryUrl(slug) : null;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(async () => {
      const res = await updateGallery(project.id, data);
      if (!res.ok) return void toast.error(res.error);
      setSlug(res.data.gallery_slug);
      toast.success(enabled ? "Gallery is live" : "Gallery saved");
      router.refresh();
    });
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy. Select the link and copy it by hand.");
    }
  };

  const regenerate = () => {
    if (!window.confirm("Make a new link? Anyone holding the old link will lose access.")) return;
    start(async () => {
      const res = await regenerateGallerySlug(project.id);
      if (!res.ok) return void toast.error(res.error);
      setSlug(res.data.gallery_slug);
      toast.success("New link ready");
      router.refresh();
    });
  };

  const addSection = () => {
    const name = newName.trim();
    if (!name) return;
    start(async () => {
      const res = await createSection(project.id, name);
      if (!res.ok) return void toast.error(res.error);
      setNewName("");
      router.refresh();
    });
  };

  const rename = (s: Section) => {
    const name = window.prompt("Section name", s.name);
    if (name === null || name.trim() === s.name) return;
    start(async () => {
      const res = await renameSection(s.id, name);
      if (!res.ok) return void toast.error(res.error);
      router.refresh();
    });
  };

  const remove = (s: Section) => {
    if (!window.confirm(`Delete “${s.name}”? Its photos stay in the project, just without a section.`)) return;
    start(async () => {
      const res = await deleteSection(s.id);
      if (!res.ok) return void toast.error(res.error);
      router.refresh();
    });
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const ids = sections.map((s) => s.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    start(async () => {
      const res = await reorderSections(project.id, ids);
      if (!res.ok) return void toast.error(res.error);
      router.refresh();
    });
  };

  return (
    <section className="outline-card p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="display text-2xl">Client gallery</h2>
          <p className="text-sm text-ink-soft">
            An unlisted link where guests browse by section and download the full-size originals. Separate from the public portfolio.
          </p>
        </div>
        <span
          className={cn(
            "caps rounded-xs border px-2 py-1 text-[0.6rem]",
            project.gallery_enabled ? "border-teal bg-teal-soft text-teal-deep" : "border-line-strong text-ink-faint",
          )}
        >
          {project.gallery_enabled ? "Live" : "Off"}
        </span>
      </div>

      <form onSubmit={onSubmit} className="grid gap-5">
        <div className="flex flex-wrap items-center gap-6 rounded-sm border border-line bg-cream px-4 py-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="gallery_enabled" className="h-4 w-4 accent-[#1b1d1e]" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Gallery link is live
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="gallery_downloads" className="h-4 w-4 accent-[#1b1d1e]" checked={downloads} onChange={(e) => setDownloads(e.target.checked)} />
            Guests can download originals
          </label>
          <span className="ml-auto text-xs text-ink-faint">{photoCount} photos in this project</span>
        </div>

        {link ? (
          <div className="grid gap-2">
            <span className="text-sm font-medium">Share link</span>
            <div className="flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-xs border border-line bg-paper px-3 py-2 font-mono text-xs">{link}</code>
              <Button variant="outline" size="sm" onClick={copy} disabled={pending}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
              </Button>
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-xs border border-ink/70 px-3.5 text-[10.5px] font-medium uppercase tracking-[0.16em] hover:bg-cream"
              >
                <ExternalLink size={13} /> Open
              </a>
              <Button variant="ghost" size="sm" onClick={regenerate} disabled={pending} title="Replace the link">
                <RefreshCw size={13} /> New link
              </Button>
            </div>
            {!project.gallery_enabled ? <p className="text-xs text-ink-faint">The link only works while the gallery is live.</p> : null}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">Turn the gallery on and save to get a share link.</p>
        )}

        <Field label="Intro (optional)" htmlFor="gallery_intro" hint="A line or two under the title on the gallery page.">
          <Textarea id="gallery_intro" name="gallery_intro" rows={2} maxLength={2000} defaultValue={project.gallery_intro ?? ""} placeholder="Thank you for celebrating with us. Save any photo you like — they are yours." />
        </Field>

        <Field label="Header image (optional)" htmlFor="gallery_cover_url" hint="A path under /public (e.g. /galleries/cover.jpg) or an image URL. Leave empty to use the project's cover photo. The cover photo stays out of the grid unless it is in a section.">
          <Input id="gallery_cover_url" name="gallery_cover_url" maxLength={500} defaultValue={project.gallery_cover_url ?? ""} placeholder="/galleries/hunkin-wedding-cover.jpg" className="font-mono text-sm" />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Saving…" : "Save gallery"}
          </Button>
        </div>
      </form>

      <div className="hairline pt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="display text-xl">Bucket import</h3>
          <p className="text-sm text-ink-soft">
            Files dropped into <code className="font-mono text-xs">{project.slug}/&lt;section&gt;/</code> in the originals bucket are picked up
            automatically within a few minutes. Press this to run it right now.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={syncNow} disabled={syncing}>
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <FolderSync size={14} />} {syncing ? "Scanning…" : "Sync now"}
        </Button>
      </div>

      <div className="hairline pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="display text-xl">Sections</h3>
            <p className="text-sm text-ink-soft">Parts of the event, shown in this order. Assign photos below.</p>
          </div>
        </div>

        {sections.length > 0 ? (
          <ol className="mt-4 divide-y divide-line rounded-xs border border-line">
            {sections.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2 px-3 py-2">
                <span className="w-6 font-mono text-[10px] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{s.name}</span>
                <span className="hidden font-mono text-[10px] text-ink-faint sm:inline">/{s.slug}</span>
                <IconButton title="Move up" onClick={() => move(i, -1)} disabled={pending || i === 0}>
                  <ArrowUp size={13} />
                </IconButton>
                <IconButton title="Move down" onClick={() => move(i, 1)} disabled={pending || i === sections.length - 1}>
                  <ArrowDown size={13} />
                </IconButton>
                <IconButton title="Rename" onClick={() => rename(s)} disabled={pending}>
                  <Pencil size={13} />
                </IconButton>
                <IconButton title="Delete" onClick={() => remove(s)} disabled={pending} danger>
                  <Trash2 size={13} />
                </IconButton>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-ink-faint">No sections yet. Without sections the gallery shows one long grid.</p>
        )}

        <div className="mt-3 flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSection();
              }
            }}
            placeholder="Ceremony, Cocktail Hour, Reception…"
            maxLength={80}
            className="max-w-sm"
          />
          <Button variant="outline" size="md" onClick={addSection} disabled={pending || !newName.trim()}>
            <Plus size={14} /> Add section
          </Button>
        </div>
      </div>
    </section>
  );
}

function IconButton({
  title,
  onClick,
  disabled,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-xs border border-transparent text-ink-faint transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-30",
        danger && "hover:border-coral hover:text-coral",
      )}
    >
      {children}
    </button>
  );
}
