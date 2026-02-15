const PREVIEW_MAX_WIDTH = 520;
const PREVIEW_QUALITY = 0.82;

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
