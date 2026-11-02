export type PaginationSlot = { type: "page"; page: number } | { type: "ellipsis" };

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

/**
 * Which numbers show: always the first and last page, the current one and
 * `siblings` either side of it, with a gap of more than one page as “…”. The
 * number of slots stays the same as the current page moves, so the bar never
 * jumps: 16 pages on page 8 is 1 … 7 8 9 … 16, and on page 1 it's 1 2 3 4 5 … 16.
 */
export function paginationSlots(count: number, page: number, siblings = 1): PaginationSlot[] {
  const boundary = 1;
  const start = range(1, Math.min(boundary, count));
  const end = range(Math.max(count - boundary + 1, boundary + 1), count);
  const siblingsStart = Math.max(Math.min(page - siblings, count - boundary - siblings * 2 - 1), boundary + 2);
  const siblingsEnd = Math.min(Math.max(page + siblings, boundary + siblings * 2 + 2), count - boundary - 1);

  const pages: (number | "ellipsis")[] = [
    ...start,
    ...(siblingsStart > boundary + 2 ? ["ellipsis" as const] : boundary + 1 < count - boundary ? [boundary + 1] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundary - 1
      ? ["ellipsis" as const]
      : count - boundary > boundary
        ? [count - boundary]
        : []),
    ...end,
  ];
  return pages.map((slot) => (slot === "ellipsis" ? { type: "ellipsis" } : { type: "page", page: slot }));
}
