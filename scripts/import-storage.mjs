#!/usr/bin/env node
/**
 * VisionaryHaus — bulk importer for photos already sitting in the private
 * `PortfolioPhotos` bucket (one folder per project).
 *
 *   node scripts/import-storage.mjs download   # pull originals, build web derivatives + contact sheets into CACHE_DIR
 *   node scripts/import-storage.mjs import     # upload derivatives to `portfolio-web` and upsert categories/projects/photos
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, CACHE_DIR
 * The signed-in user must be in public.admins (RLS does the rest — no service-role key needed).
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import exifReader from "exif-reader";
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const CACHE = process.env.CACHE_DIR || path.join(process.cwd(), ".import-cache");
const ORIGINALS = "PortfolioPhotos";
const WEB = "portfolio-web";
const CONCURRENCY = Number(process.env.CONCURRENCY || 4);
const cmd = process.argv[2];

if (!URL || !KEY || !EMAIL || !PASSWORD) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD");
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: true } });
const { error: authErr } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (authErr) { console.error("auth failed:", authErr.message); process.exit(1); }

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const hex = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const slugify = (s) => s.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function listAll(prefix = "") {
  const { data, error } = await supabase.storage.from(ORIGINALS).list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error) throw new Error(`list ${prefix}: ${error.message}`);
  const files = [];
  for (const item of data) {
    const full = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) files.push(...(await listAll(full)));
    else if (item.name !== ".emptyFolderPlaceholder") files.push({ path: full, size: item.metadata?.size ?? null, mime: item.metadata?.mimetype ?? null });
  }
  return files;
}

async function pool(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); } }));
  return out;
}

async function deriveOne(file) {
  const dir = path.dirname(file.path); const base = path.basename(file.path);
  const stem = base.replace(/\.[^.]+$/, "");
  const outDir = path.join(CACHE, "derived", dir); await fs.mkdir(outDir, { recursive: true });
  const metaPath = path.join(outDir, stem + ".json");
  if (existsSync(metaPath)) return JSON.parse(await fs.readFile(metaPath, "utf8"));

  const { data: blob, error } = await supabase.storage.from(ORIGINALS).download(file.path);
  if (error) throw new Error(`download ${file.path}: ${error.message}`);
  const buf = Buffer.from(await blob.arrayBuffer());
  const mime = file.mime || "";
  if (!mime.startsWith("image/")) { log("skip non-image", file.path); return null; }

  const meta0 = await sharp(buf, { failOn: "none", limitInputPixels: false }).metadata();
  let takenAt = null;
  if (meta0.exif) { try { const ex = exifReader(meta0.exif); const d = ex?.Photo?.DateTimeOriginal ?? ex?.Image?.DateTime; if (d) { const dt = new Date(d); if (!isNaN(dt)) takenAt = dt.toISOString(); } } catch {} }

  const large = await sharp(buf, { failOn: "none", limitInputPixels: false }).rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true, chromaSubsampling: "4:4:4" })
    .toBuffer({ resolveWithObject: true });
  const thumb = await sharp(large.data).resize({ width: 480, height: 480, fit: "inside" }).jpeg({ quality: 75, mozjpeg: true }).toBuffer();
  const blur = await sharp(large.data).resize({ width: 24, height: 24, fit: "inside" }).jpeg({ quality: 45 }).toBuffer();
  const stats = await sharp(large.data).stats();
  const { r, g, b } = stats.dominant;

  const meta = {
    original_path: file.path, folder: dir, file: base, stem, mime,
    width: large.info.width, height: large.info.height,
    original_bytes: buf.length, large_bytes: large.data.length,
    orig_width: meta0.width, orig_height: meta0.height, orientation: meta0.orientation ?? 1,
    taken_at: takenAt, dominant_color: hex(r, g, b),
    blur_data_url: `data:image/jpeg;base64,${blur.toString("base64")}`,
  };
  await fs.writeFile(path.join(outDir, stem + ".jpg"), large.data);
  await fs.writeFile(path.join(outDir, stem + ".thumb.jpg"), thumb);
  await fs.writeFile(metaPath, JSON.stringify(meta));
  return meta;
}

async function contactSheet(folder, metas) {
  const cols = 6, tile = 240, gap = 4, step = tile + gap;
  const rows = Math.ceil(metas.length / cols);
  const layers = [];
  for (let i = 0; i < metas.length; i++) {
    const m = metas[i];
    const thumbPath = path.join(CACHE, "derived", m.folder, m.stem + ".thumb.jpg");
    const input = await sharp(thumbPath).resize(tile, tile, { fit: "cover" }).toBuffer();
    const left = (i % cols) * step, top = Math.floor(i / cols) * step;
    layers.push({ input, left, top });
    const label = `${i} · ${m.width}x${m.height}`;
    layers.push({ input: Buffer.from(`<svg width="${tile}" height="22"><rect width="${tile}" height="22" fill="black" opacity="0.55"/><text x="6" y="16" font-size="13" fill="white" font-family="Helvetica, Arial, sans-serif">${label}</text></svg>`), left, top });
  }
  await fs.mkdir(path.join(CACHE, "sheets"), { recursive: true });
  await sharp({ create: { width: cols * step, height: Math.max(1, rows) * step, channels: 3, background: "#ffffff" } })
    .composite(layers).jpeg({ quality: 80 }).toFile(path.join(CACHE, "sheets", folder.replace(/\//g, "__") + ".jpg"));
}

if (cmd === "download") {
  const files = await listAll();
  log(`found ${files.length} objects in ${ORIGINALS}`);
  const photos = files.filter((f) => !f.path.startsWith("VisionaryLogo/"));
  const logo = files.filter((f) => f.path.startsWith("VisionaryLogo/"));
  for (const l of logo) {
    const { data, error } = await supabase.storage.from(ORIGINALS).download(l.path);
    if (error) throw error;
    await fs.mkdir(path.join(CACHE, "logo"), { recursive: true });
    await fs.writeFile(path.join(CACHE, "logo", path.basename(l.path)), Buffer.from(await data.arrayBuffer()));
    log("logo saved", l.path);
  }
  let done = 0;
  const metas = (await pool(photos, CONCURRENCY, async (f) => {
    try { const m = await deriveOne(f); done++; log(`[${done}/${photos.length}] ${f.path} -> ${m ? m.width + "x" + m.height : "skipped"}`); return m; }
    catch (e) { log("ERROR", f.path, e.message); return null; }
  })).filter(Boolean);
  await fs.writeFile(path.join(CACHE, "manifest.json"), JSON.stringify(metas, null, 1));
  const byFolder = new Map();
  for (const m of metas) { if (!byFolder.has(m.folder)) byFolder.set(m.folder, []); byFolder.get(m.folder).push(m); }
  for (const [folder, list] of byFolder) { list.sort((a, b) => a.file.localeCompare(b.file)); await contactSheet(folder, list); log("sheet", folder, list.length); }
  log("done. folders:", [...byFolder.keys()].join(", "));
} else if (cmd === "import") {
  const mappingPath = process.env.MAPPING || path.join(process.cwd(), "scripts", "import-mapping.json");
  const mapping = JSON.parse(await fs.readFile(mappingPath, "utf8"));
  const manifest = JSON.parse(await fs.readFile(path.join(CACHE, "manifest.json"), "utf8"));

  // categories
  const catRows = mapping.categories.map((c, i) => ({ slug: c.slug, name: c.name, tagline: c.tagline ?? null, description: c.description ?? null, sort_order: i + 1, is_published: c.published !== false }));
  const { data: cats, error: catErr } = await supabase.from("categories").upsert(catRows, { onConflict: "slug" }).select("id, slug");
  if (catErr) throw catErr;
  const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  log("categories", cats.length);

  // projects
  const projRows = Object.values(mapping.projects).map((p, i) => ({
    slug: p.slug, title: p.title, subtitle: p.subtitle ?? null, description: p.description ?? null,
    client: p.client ?? null, location: p.location ?? null, shot_on: p.shot_on ?? null,
    category_id: catId[p.category] ?? null, sort_order: p.sort_order ?? i + 1,
    is_published: p.published !== false, is_featured: !!p.featured,
  }));
  const { data: projs, error: projErr } = await supabase.from("projects").upsert(projRows, { onConflict: "slug" }).select("id, slug");
  if (projErr) throw projErr;
  const projId = Object.fromEntries(projs.map((p) => [p.slug, p.id]));
  log("projects", projs.length);

  // photos: upload derivative + upsert row
  const byFolder = new Map();
  for (const m of manifest) { if (!byFolder.has(m.folder)) byFolder.set(m.folder, []); byFolder.get(m.folder).push(m); }
  const coverByProject = {};
  for (const [folder, p] of Object.entries(mapping.projects)) {
    const list = (byFolder.get(folder) ?? []).sort((a, b) => a.file.localeCompare(b.file));
    if (!list.length) { log("no photos for", folder); continue; }
    const rows = await pool(list, CONCURRENCY, async (m, idx) => {
      const webPath = `${p.slug}/${slugify(m.stem)}.jpg`;
      const buf = await fs.readFile(path.join(CACHE, "derived", m.folder, m.stem + ".jpg"));
      const { error: upErr } = await supabase.storage.from(WEB).upload(webPath, buf, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
      if (upErr) throw new Error(`upload ${webPath}: ${upErr.message}`);
      return {
        project_id: projId[p.slug], original_path: m.original_path, web_path: webPath,
        width: m.width, height: m.height, bytes: m.large_bytes, blur_data_url: m.blur_data_url,
        dominant_color: m.dominant_color, taken_at: m.taken_at, sort_order: (p.order?.indexOf(idx) ?? -1) >= 0 ? p.order.indexOf(idx) + 1 : idx + 1,
        is_published: !(p.hide ?? []).includes(idx), alt: p.alt?.[idx] ?? `${p.title} — photograph ${idx + 1} by Danielle Hough`,
      };
    });
    const { data: inserted, error: phErr } = await supabase.from("photos").upsert(rows, { onConflict: "original_path" }).select("id, original_path");
    if (phErr) throw new Error(`photos ${folder}: ${phErr.message}`);
    const coverIdx = p.cover ?? 0;
    const coverOrig = list[coverIdx]?.original_path;
    const cover = inserted.find((r) => r.original_path === coverOrig);
    if (cover) coverByProject[p.slug] = cover.id;
    log(`photos ${folder}: ${inserted.length} (cover #${coverIdx})`);
  }
  for (const [slug, coverId] of Object.entries(coverByProject)) {
    const { error } = await supabase.from("projects").update({ cover_photo_id: coverId }).eq("slug", slug);
    if (error) throw error;
  }
  for (const c of mapping.categories) {
    const coverSlug = c.cover_project;
    const coverId = coverSlug ? coverByProject[coverSlug] : null;
    if (coverId) { const { error } = await supabase.from("categories").update({ cover_photo_id: coverId }).eq("slug", c.slug); if (error) throw error; }
  }
  log("import complete");
} else {
  console.error("usage: node scripts/import-storage.mjs <download|import>");
  process.exit(1);
}
