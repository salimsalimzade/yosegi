import type { FileUploadFile, FileUploadUploadContext } from "yosegi-solid";

const MB = 1024 * 1024;
const tried = new WeakSet<File>();

/**
 * A pretend upload: progress in random steps for a second or two. A file with
 * “fail” in its name fails the first time, so Retry has something to do.
 */
export function fakeUpload(file: File, { onProgress, signal }: FileUploadUploadContext) {
  return new Promise<void>((resolve, reject) => {
    const failing = /fail/i.test(file.name) && !tried.has(file);
    tried.add(file);
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 6 + Math.random() * 14);
      onProgress(progress);
      if (failing && progress > 40) {
        clearInterval(timer);
        reject("Couldn't upload. Check your connection and try again.");
      } else if (progress >= 100) {
        clearInterval(timer);
        resolve();
      }
    }, 180);
    signal.addEventListener("abort", () => {
      clearInterval(timer);
      reject(signal.reason);
    });
  });
}

let counter = 0;

/** A row for `defaultValue` or `value`. The File is empty; `size` is what the row shows. */
export function sampleFile(name: string, megabytes: number, patch: Partial<FileUploadFile> = {}): FileUploadFile {
  return {
    id: `sample-${++counter}`,
    file: new File([], name),
    name,
    size: Math.round(megabytes * MB),
    status: "done",
    progress: 100,
    ...patch,
  };
}

export const tenMegabytes = 10 * MB;
