import { describe, expect, it } from "vitest";
import { paginationSlots } from "./pagination-slots";

/** The slots as the bar reads them: 1 … 7 8 9 … 16. */
const bar = (count: number, page: number, siblings?: number) =>
  paginationSlots(count, page, siblings)
    .map((slot) => (slot.type === "page" ? slot.page : "…"))
    .join(" ");

describe("paginationSlots", () => {
  it("shows every page when they fit", () => {
    expect(bar(1, 1)).toBe("1");
    expect(bar(5, 3)).toBe("1 2 3 4 5");
    expect(bar(7, 4)).toBe("1 2 3 4 5 6 7");
  });

  it("puts a gap on each side in the middle", () => {
    expect(bar(16, 8)).toBe("1 … 7 8 9 … 16");
  });

  it("fills in from the ends, so the bar never jumps", () => {
    expect(bar(16, 1)).toBe("1 2 3 4 5 … 16");
    expect(bar(16, 3)).toBe("1 2 3 4 5 … 16");
    expect(bar(16, 16)).toBe("1 … 12 13 14 15 16");
  });

  it("keeps the same number of slots on every page", () => {
    const lengths = Array.from({ length: 16 }, (_, i) => paginationSlots(16, i + 1).length);
    expect(new Set(lengths)).toEqual(new Set([7]));
  });

  it("switches from one gap to two as the page moves past the middle", () => {
    expect(bar(8, 4)).toBe("1 2 3 4 5 … 8");
    expect(bar(8, 5)).toBe("1 … 4 5 6 7 8");
    expect(bar(9, 5)).toBe("1 … 4 5 6 … 9");
  });

  it("widens with more siblings", () => {
    expect(bar(20, 10, 2)).toBe("1 … 8 9 10 11 12 … 20");
  });
});
