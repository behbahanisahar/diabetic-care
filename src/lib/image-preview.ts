const PREVIEW_MAX_WIDTH = 520;
const PREVIEW_QUALITY = 0.82;

/** Max dimension for upload (keeps ID docs readable, reduces payload). */
const UPLOAD_MAX_WIDTH = 1600;
const UPLOAD_JPEG_QUALITY = 0.85;
/** Don't resize if under this size (bytes). */
const UPLOAD_MIN_SIZE = 200 * 1024;

/**
 * Resize image for upload: smaller payload = faster submit. Returns original file if not image or small.
 */
export function resizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < UPLOAD_MIN_SIZE) {
    return Promise.resolve(file);
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const maxSide = Math.max(w, h);
      if (maxSide <= UPLOAD_MAX_WIDTH) {
        resolve(file);
        return;
      }
      let width = w;
      let height = h;
      if (w >= h) {
        width = UPLOAD_MAX_WIDTH;
        height = Math.round((h * UPLOAD_MAX_WIDTH) / w);
      } else {
        height = UPLOAD_MAX_WIDTH;
        width = Math.round((w * UPLOAD_MAX_WIDTH) / h);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const name = (file.name || "image").replace(/\.[^.]+$/, "") + ".jpg";
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        UPLOAD_JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

/** Resize a file for upload if it's a large image; otherwise return as-is. */
function resizeFileForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < UPLOAD_MIN_SIZE) return Promise.resolve(file);
  return resizeImageForUpload(file);
}

/**
 * Returns a new FormData with all image fields (including multi-files) resized in parallel for faster upload.
 */
export async function prepareFormDataWithResizedImages(formData: FormData): Promise<FormData> {
  const nationalIdFile = formData.get("nationalIdPhoto") as File | null;
  const birthCertFile = formData.get("birthCertificatePhoto") as File | null;
  const educationalList = formData.getAll("educationalFiles").filter((f): f is File => f instanceof File && f.size > 0);
  const examinationList = formData.getAll("examinationFiles").filter((f): f is File => f instanceof File && f.size > 0);

  const [
    nationalIdResized,
    birthCertResized,
    ...eduAndExamResized
  ] = await Promise.all([
    nationalIdFile?.size ? resizeImageForUpload(nationalIdFile) : Promise.resolve(null),
    birthCertFile?.size ? resizeImageForUpload(birthCertFile) : Promise.resolve(null),
    ...educationalList.map(resizeFileForUpload),
    ...examinationList.map(resizeFileForUpload),
  ]);

  const out = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key === "nationalIdPhoto") {
      out.set(key, nationalIdResized ?? value);
      continue;
    }
    if (key === "birthCertificatePhoto") {
      out.set(key, birthCertResized ?? value);
      continue;
    }
    if (key === "educationalFiles" || key === "examinationFiles") continue;
    if (value instanceof File) out.append(key, value);
    else out.set(key, value as string);
  }
  const nEdu = educationalList.length;
  const eduResized = eduAndExamResized.slice(0, nEdu) as File[];
  const examResized = eduAndExamResized.slice(nEdu) as File[];
  eduResized.forEach((f) => out.append("educationalFiles", f));
  examResized.forEach((f) => out.append("examinationFiles", f));
  return out;
}

/**
 * Creates a small data URL for preview so the UI doesn't decode huge images.
 * Use for form previews; the actual file is still submitted as-is.
 */
export function createResizedPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      let width = w;
      let height = h;
      if (w > PREVIEW_MAX_WIDTH) {
        width = PREVIEW_MAX_WIDTH;
        height = Math.round((h * PREVIEW_MAX_WIDTH) / w);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(url);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", PREVIEW_QUALITY);
        resolve(dataUrl);
      } catch {
        resolve(URL.createObjectURL(file));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
