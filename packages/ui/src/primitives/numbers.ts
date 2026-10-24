/**
 * Reads a typed number in the locale's own marks: “1.234,5” in German is
 * 1234.5. Group marks and spaces are dropped. NaN when nothing is left.
 */
export function parseNumber(text: string, locale?: string) {
  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const normalised = text
    .split(group)
    .join("")
    .replace(/\s/g, "")
    .replace(decimal, ".")
    .replace(/[^\d.-]/g, "");
  if (normalised === "" || normalised === "-") return NaN;
  return Number(normalised);
}
