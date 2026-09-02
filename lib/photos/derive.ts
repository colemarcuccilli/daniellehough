import sharp from "sharp";
import exifReader from "exif-reader";

export const LARGE_EDGE = 2400;

export type Derived = {
  large: Buffer;
  width: number;
  height: number;
  bytes: number;
  blurDataUrl: string;
  dominantColor: string;
  takenAt: string | null;
};

const hex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

/**
 * Turns an original upload into the web derivative used everywhere on the
 * site: auto-rotated, max 2400px on the long edge, progressive JPEG, plus a
 * tiny blur placeholder and a dominant colour for the grid tiles.
 */
export async function derive(input: Buffer): Promise<Derived> {
  const meta = await sharp(input, { failOn: "none", limitInputPixels: false }).metadata();
  let takenAt: string | null = null;
  if (meta.exif) {
    try {
      const ex = exifReader(meta.exif) as { Photo?: { DateTimeOriginal?: Date | string }; Image?: { DateTime?: Date | string } };
      const d = ex.Photo?.DateTimeOriginal ?? ex.Image?.DateTime;
      if (d) {
        const dt = new Date(d);
        if (!isNaN(dt.getTime())) takenAt = dt.toISOString();
      }
    } catch {
      // ignore unreadable EXIF
    }
  }

  const large = await sharp(input, { failOn: "none", limitInputPixels: false })
    .rotate()
    .resize({ width: LARGE_EDGE, height: LARGE_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true, chromaSubsampling: "4:4:4" })
    .toBuffer({ resolveWithObject: true });

  const blur = await sharp(large.data).resize({ width: 24, height: 24, fit: "inside" }).jpeg({ quality: 45 }).toBuffer();
  const stats = await sharp(large.data).stats();
  const { r, g, b } = stats.dominant;

  return {
    large: large.data,
    width: large.info.width,
    height: large.info.height,
    bytes: large.data.length,
    blurDataUrl: `data:image/jpeg;base64,${blur.toString("base64")}`,
    dominantColor: hex(r, g, b),
    takenAt,
  };
}
