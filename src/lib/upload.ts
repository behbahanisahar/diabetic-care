import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Upload a file to Vercel Blob (production) or save locally (development).
 * Returns the URL/path to the uploaded file.
 */
export async function uploadFile(
  file: File,
  prefix: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = (file.name || "image").replace(/[/\\]/g, "-");
  const filename = `${prefix}-${Date.now()}-${safeName}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`patients/${filename}`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || "image/jpeg",
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}
