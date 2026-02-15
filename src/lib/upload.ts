import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

/** Max longest side in px; keeps ID documents readable while reducing size. */
const MAX_IMAGE_DIMENSION = 1600;
/** JPEG quality for resized images (85 keeps text and details clear). */
const JPEG_QUALITY = 85;
/** Only resize if file is larger than this (bytes) to avoid re-encoding small images. */
const MIN_SIZE_TO_RESIZE = 150 * 1024;

/**
 * Resize and compress image if it's large; otherwise return original buffer.
 * Preserves quality for documents (national ID, birth certificate).
 */
async function resizeImageIfNeeded(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  if (!mimeType.startsWith("image/") || buffer.length < MIN_SIZE_TO_RESIZE) {
    return {
      buffer,
      contentType: mimeType || "image/jpeg",
      ext: mimeType.includes("png") ? ".png" : ".jpg",
    };
  }
  try {
    const image = sharp(buffer);
    const meta = await image.metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const maxSide = Math.max(w, h);
    if (maxSide <= MAX_IMAGE_DIMENSION) {
      return {
        buffer,
        contentType: mimeType || "image/jpeg",
        ext: mimeType.includes("png") ? ".png" : ".jpg",
      };
    }
    const out = await image
      .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    return { buffer: out, contentType: "image/jpeg", ext: ".jpg" };
  } catch {
    return {
      buffer,
      contentType: mimeType || "image/jpeg",
      ext: mimeType.includes("png") ? ".png" : ".jpg",
    };
  }
}

/**
 * Upload a file to Vercel Blob (production) or save locally (development).
 * Large images are resized (max 1600px, JPEG quality 85) to keep quality but reduce size.
 */
export async function uploadFile(
  file: File,
  prefix: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const mimeType = file.type || "image/jpeg";
  const { buffer: finalBuffer, contentType, ext } = await resizeImageIfNeeded(buffer, mimeType);

  const baseName = (file.name || "image").replace(/[/\\]/g, "-").replace(/\.[^.]+$/, "") || "image";
  const filename = `${prefix}-${Date.now()}-${baseName}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`patients/${filename}`, finalBuffer, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Add it in Vercel Settings → Environment Variables for file uploads."
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, finalBuffer);
  return `/uploads/${filename}`;
}
