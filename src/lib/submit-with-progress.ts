/**
 * Submit FormData via XHR to get upload progress. Returns parsed JSON and status.
 */
export function submitFormWithProgress(
  url: string,
  method: string,
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<{ ok: boolean; status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && e.total > 0) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(Math.min(99, percent));
      }
    });

    xhr.addEventListener("load", () => {
      onProgress(100);
      let data: unknown;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        data = {};
      }
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        data,
      });
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Aborted")));

    xhr.open(method, url);
    xhr.send(formData);
  });
}
