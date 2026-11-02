// What FileUpload knows about files: their type, whether they're accepted, and their size.

const UNITS = ["B", "KB", "MB", "GB"];

/** The extension, upper case, for a row's type tile: “PDF”. */
export const extensionOf = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1, dot + 5).toUpperCase() : "FILE";
};

/** Whether a file matches an `accept` list: extensions, exact types or wildcards like image/*. */
export function accepts(file: File, accept: string | undefined) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) =>
      entry.startsWith(".")
        ? name.endsWith(entry)
        : entry.endsWith("/*")
          ? type.startsWith(entry.slice(0, -1))
          : type === entry,
    );
}

/** An `accept` list in words: “.pdf,image/*” → “PDF or images”. */
export function describeTypes(accept: string | undefined, locale: string) {
  if (!accept) return undefined;
  const words = accept
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      if (entry.startsWith(".")) return entry.slice(1).toUpperCase();
      if (entry.endsWith("/*")) return `${entry.slice(0, -2)}s`;
      const sub = entry.split("/")[1] ?? entry;
      return sub.toUpperCase();
    });
  return new Intl.ListFormat(locale, { type: "disjunction" }).format(words);
}

/** A size in bytes as people read it, in powers of 1024 with one decimal: “1.5 MB”. */
export function fileSize(bytes: number, number: Intl.NumberFormat) {
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < UNITS.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${number.format(unit === 0 ? size : Math.round(size * 10) / 10)} ${UNITS[unit]}`;
}
