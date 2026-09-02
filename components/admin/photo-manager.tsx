"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, Check, Eye, EyeOff, FolderInput, GripVertical, Loader2, Pencil, Star, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ORIGINALS_BUCKET, photoUrl, safeFileName } from "@/lib/images";
import type { Photo, Project } from "@/lib/types";
import { deletePhoto, reorderPhotos, setProjectCover, togglePhotoPublished, updatePhoto } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Job = { key: string; name: string; status: "queued" | "uploading" | "processing" | "done" | "error"; error?: string };

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/tiff"];

async function runQueue<T>(items: T[], worker: (item: T) => Promise<void>, concurrency = 2) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (i < items.length) {
        const item = items[i++];
        await worker(item);
      }
    }),
  );
}

export function PhotoManager({ project, photos: initial }: { project: Project; photos: Photo[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [coverId, setCoverId] = useState<string | null>(project.cover_photo_id);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-sync local state when the server sends fresh data (after router.refresh()).
  const [syncedInitial, setSyncedInitial] = useState(initial);
  if (syncedInitial !== initial) {
    setSyncedInitial(initial);
    setPhotos(initial);
  }
  const [syncedCover, setSyncedCover] = useState(project.cover_photo_id);
  if (syncedCover !== project.cover_photo_id) {
    setSyncedCover(project.cover_photo_id);
    setCoverId(project.cover_photo_id);
  }

  const busy = importing || jobs.some((j) => j.status === "queued" || j.status === "uploading" || j.status === "processing");
  const updateJob = (key: string, patch: Partial<Job>) => setJobs((js) => js.map((j) => (j.key === key ? { ...j, ...patch } : j)));

  const processPath = useCallback(
    async (originalPath: string) => {
      const res = await fetch("/api/admin/photos/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, originalPath }),
      });
      const json = (await res.json().catch(() => ({}))) as { photo?: Photo; error?: string };
      if (!res.ok || !json.photo) throw new Error(json.error || `Processing failed (${res.status})`);
      return json.photo;
    },
    [project.id],
  );

  const addPhoto = (photo: Photo) => {
    setPhotos((ps) => (ps.some((p) => p.id === photo.id) ? ps : [...ps, photo]));
    setCoverId((c) => c ?? photo.id);
  };

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const valid = files.filter((f) => ACCEPT.includes(f.type));
      if (valid.length === 0) {
        toast.error("Only JPEG, PNG, WebP, or TIFF files.");
        return;
      }
      const newJobs: Job[] = valid.map((f) => ({
        key: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        status: "queued",
      }));
      setJobs((js) => [...newJobs, ...js]);
      let added = 0;
      await runQueue(
        valid.map((f, i) => ({ f, job: newJobs[i] })),
        async ({ f, job }) => {
          try {
            updateJob(job.key, { status: "uploading" });
            let path = `${project.slug}/${safeFileName(f.name)}`;
            let { error } = await supabase.storage.from(ORIGINALS_BUCKET).upload(path, f, { contentType: f.type, upsert: false });
            if (error && /exist/i.test(error.message)) {
              path = `${project.slug}/${Date.now().toString(36)}-${safeFileName(f.name)}`;
              ({ error } = await supabase.storage.from(ORIGINALS_BUCKET).upload(path, f, { contentType: f.type, upsert: false }));
            }
            if (error) throw new Error(error.message);
            updateJob(job.key, { status: "processing" });
            addPhoto(await processPath(path));
            updateJob(job.key, { status: "done" });
            added++;
          } catch (e) {
            updateJob(job.key, { status: "error", error: e instanceof Error ? e.message : "failed" });
          }
        },
      );
      if (added) toast.success(`${added} photo${added === 1 ? "" : "s"} added`);
      router.refresh();
    },
    [project.slug, supabase, processPath, router],
  );

  const importFolder = useCallback(async () => {
    const answer = window.prompt("Folder inside the PortfolioPhotos bucket to import from:", project.slug);
    if (answer === null) return;
    const folder = answer.trim().replace(/^\/+|\/+$/g, "");
    setImporting(true);
    try {
      const { data, error } = await supabase.storage
        .from(ORIGINALS_BUCKET)
        .list(folder, { limit: 1000, sortBy: { column: "name", order: "asc" } });
      if (error) throw new Error(error.message);
      const existing = new Set(photos.map((p) => p.original_path));
      const files = (data ?? [])
        .filter((o) => o.id !== null && !o.name.startsWith(".") && /\.(jpe?g|png|webp|tiff?)$/i.test(o.name))
        .map((o) => (folder ? `${folder}/${o.name}` : o.name))
        .filter((p) => !existing.has(p));
      if (files.length === 0) {
        toast.message("Nothing new to import in that folder.");
        return;
      }
      setJobs((js) => [...files.map((p) => ({ key: p, name: p.split("/").pop() ?? p, status: "queued" as const })), ...js]);
      let n = 0;
      await runQueue(files, async (p) => {
        try {
          updateJob(p, { status: "processing" });
          addPhoto(await processPath(p));
          updateJob(p, { status: "done" });
          n++;
        } catch (e) {
          updateJob(p, { status: "error", error: e instanceof Error ? e.message : "failed" });
        }
      });
      toast.success(`Imported ${n} of ${files.length}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }, [project.slug, supabase, photos, processPath, router]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = photos.findIndex((p) => p.id === active.id);
    const to = photos.findIndex((p) => p.id === over.id);
    if (from < 0 || to < 0) return;
    const previous = photos;
    const next = arrayMove(photos, from, to);
    setPhotos(next);
    start(async () => {
      const res = await reorderPhotos(project.id, next.map((p) => p.id));
      if (!res.ok) {
        toast.error(res.error);
        setPhotos(previous);
      }
    });
  };

  const onCover = (id: string) =>
    start(async () => {
      const prev = coverId;
      setCoverId(id);
      const res = await setProjectCover(project.id, id);
      if (!res.ok) {
        toast.error(res.error);
        setCoverId(prev);
      } else toast.success("Cover updated");
    });

  const onToggle = (p: Photo) =>
    start(async () => {
      const next = !p.is_published;
      setPhotos((ps) => ps.map((x) => (x.id === p.id ? { ...x, is_published: next } : x)));
      const res = await togglePhotoPublished(p.id, next);
      if (!res.ok) {
        toast.error(res.error);
        setPhotos((ps) => ps.map((x) => (x.id === p.id ? { ...x, is_published: !next } : x)));
      }
    });

  const onDelete = (p: Photo) => {
    if (!window.confirm("Delete this photo from the site? The original stays in the PortfolioPhotos bucket.")) return;
    start(async () => {
      const res = await deletePhoto(p.id);
      if (!res.ok) return void toast.error(res.error);
      setPhotos((ps) => ps.filter((x) => x.id !== p.id));
      if (coverId === p.id) setCoverId(null);
      toast.success("Photo removed");
      router.refresh();
    });
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="display text-2xl">Photos</h2>
          <p className="text-sm text-ink-soft">
            {photos.length} in this project · drag to reorder · star sets the cover
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={importFolder} disabled={busy}>
            {importing ? <Loader2 size={14} className="animate-spin" /> : <FolderInput size={14} />}
            Import from bucket folder
          </Button>
          <Button variant="primary" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            <Upload size={14} /> Upload photos
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT.join(",")}
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length) void uploadFiles(files);
            }}
          />
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const files = Array.from(e.dataTransfer.files ?? []);
          if (files.length) void uploadFiles(files);
        }}
        className={cn(
          "rounded-md border border-dashed p-4 transition-colors",
          dragOver ? "border-marigold-deep bg-marigold-glow" : "border-line-strong bg-cream/50",
        )}
      >
        {jobs.length > 0 ? (
          <ul className="mb-4 grid gap-1 max-h-48 overflow-auto">
            {jobs.map((j) => (
              <li key={j.key} className="flex items-center gap-2 text-xs">
                {j.status === "done" ? (
                  <Check size={13} className="text-moss" />
                ) : j.status === "error" ? (
                  <AlertCircle size={13} className="text-coral" />
                ) : (
                  <Loader2 size={13} className={cn("text-ink-faint", j.status !== "queued" && "animate-spin")} />
                )}
                <span className="truncate">{j.name}</span>
                <span className="ml-auto font-mono uppercase tracking-wider text-[10px] text-ink-faint">
                  {j.status === "error" ? j.error : j.status}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {photos.length === 0 && jobs.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-soft">
            Drop JPEGs here, or use <strong>Upload photos</strong>. Originals go to the private bucket; the site gets a
            2400px web version automatically.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {photos.map((p) => (
                  <SortablePhoto
                    key={p.id}
                    photo={p}
                    isCover={coverId === p.id}
                    onCover={() => onCover(p.id)}
                    onToggle={() => onToggle(p)}
                    onEdit={() => setEditing(p)}
                    onDelete={() => onDelete(p)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {editing ? (
        <EditPhotoDialog
          photo={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setPhotos((ps) => ps.map((x) => (x.id === updated.id ? updated : x)));
            setEditing(null);
          }}
        />
      ) : null}
    </section>
  );
}

function SortablePhoto({
  photo,
  isCover,
  onCover,
  onToggle,
  onEdit,
  onDelete,
}: {
  photo: Photo;
  isCover: boolean;
  onCover: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-sm border bg-cream-deep touch-none select-none",
        isCover ? "border-ink ring-2 ring-marigold" : "border-line",
        isDragging && "z-10 opacity-70 shadow-hard",
      )}
    >
      <Image
        src={photoUrl(photo.web_path)}
        alt={photo.alt ?? ""}
        fill
        sizes="(max-width: 640px) 33vw, 200px"
        quality={70}
        placeholder={photo.blur_data_url ? "blur" : "empty"}
        blurDataURL={photo.blur_data_url ?? undefined}
        className={cn("object-cover", !photo.is_published && "opacity-40 grayscale")}
        draggable={false}
      />
      <div className="absolute left-1.5 top-1.5 flex gap-1">
        {isCover ? (
          <span className="rounded-xs border border-ink bg-marigold px-1.5 font-mono text-[9px] uppercase tracking-wider">Cover</span>
        ) : null}
        {!photo.is_published ? (
          <span className="rounded-xs border border-ink bg-paper px-1.5 font-mono text-[9px] uppercase tracking-wider">Hidden</span>
        ) : null}
      </div>
      <span className="absolute right-1.5 top-1.5 text-cream/90 opacity-0 transition-opacity group-hover:opacity-100 drop-shadow">
        <GripVertical size={14} />
      </span>
      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/80 p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <TileButton title="Set as cover" onClick={onCover} active={isCover}>
          <Star size={13} fill={isCover ? "currentColor" : "none"} />
        </TileButton>
        <TileButton title={photo.is_published ? "Hide from site" : "Show on site"} onClick={onToggle}>
          {photo.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
        </TileButton>
        <TileButton title="Edit caption" onClick={onEdit}>
          <Pencil size={13} />
        </TileButton>
        <TileButton title="Delete" onClick={onDelete} danger>
          <Trash2 size={13} />
        </TileButton>
      </div>
    </li>
  );
}

function TileButton({
  title,
  onClick,
  active,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-xs text-cream transition-colors hover:bg-cream hover:text-ink",
        active && "text-marigold",
        danger && "hover:bg-coral hover:text-paper",
      )}
    >
      {children}
    </button>
  );
}

function EditPhotoDialog({ photo, onClose, onSaved }: { photo: Photo; onClose: () => void; onSaved: (p: Photo) => void }) {
  const [pending, start] = useTransition();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(async () => {
      const res = await updatePhoto(photo.id, data);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Saved");
      onSaved({
        ...photo,
        alt: (data.get("alt") as string) || null,
        caption: (data.get("caption") as string) || null,
        is_published: data.get("is_published") === "on",
      });
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onClose} role="dialog" aria-modal>
      <div className="outline-card w-full max-w-2xl p-0 overflow-hidden shadow-hard" onClick={(e) => e.stopPropagation()}>
        <div className="grid sm:grid-cols-[1fr_1.1fr]">
          <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[320px] bg-cream-deep" style={{ backgroundColor: photo.dominant_color ?? undefined }}>
            <Image src={photoUrl(photo.web_path)} alt={photo.alt ?? ""} fill sizes="400px" quality={70} className="object-contain" />
          </div>
          <form onSubmit={onSubmit} className="grid gap-4 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="display text-2xl">Photo details</h3>
                <p className="font-mono text-[10px] text-ink-faint break-all mt-1">{photo.original_path}</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <Field label="Alt text" htmlFor="alt" hint="Describes the picture for screen readers and search engines.">
              <Input id="alt" name="alt" maxLength={300} defaultValue={photo.alt ?? ""} placeholder="Two F-16s on the taxiway at sunrise" />
            </Field>
            <Field label="Caption (optional)" htmlFor="caption" hint="Shown under the photo in the full-screen viewer.">
              <Textarea id="caption" name="caption" rows={3} maxLength={1000} defaultValue={photo.caption ?? ""} />
            </Field>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_published" defaultChecked={photo.is_published} className="h-4 w-4 accent-[#1b1d1e]" />
              Visible on the site
            </label>
            <p className="text-xs text-ink-faint">
              {photo.width} × {photo.height} px · {photo.bytes ? `${Math.round(photo.bytes / 1024)} KB` : ""}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
