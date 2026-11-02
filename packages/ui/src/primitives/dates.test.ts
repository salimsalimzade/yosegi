import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  clampDate,
  endOfMonth,
  isSameDay,
  isSameMonth,
  monthWeeks,
  parseDate,
  startOfWeek,
  toKey,
} from "./dates";

const day = (year: number, month: number, date: number) => new Date(year, month - 1, date);

describe("addDays", () => {
  it("crosses months and years", () => {
    expect(addDays(day(2026, 12, 31), 1)).toEqual(day(2027, 1, 1));
    expect(addDays(day(2026, 3, 1), -1)).toEqual(day(2026, 2, 28));
  });
});

describe("addMonths", () => {
  it("keeps the day where the month has it", () => {
    expect(addMonths(day(2026, 3, 15), 1)).toEqual(day(2026, 4, 15));
  });

  it("falls back to the month's last day", () => {
    expect(addMonths(day(2026, 1, 31), 1)).toEqual(day(2026, 2, 28));
    expect(addMonths(day(2028, 1, 31), 1)).toEqual(day(2028, 2, 29));
  });

  it("goes back across a year", () => {
    expect(addMonths(day(2026, 1, 10), -1)).toEqual(day(2025, 12, 10));
  });
});

describe("startOfWeek", () => {
  // 28 October 2026 is a Wednesday.
  it("goes back to Monday", () => {
    expect(startOfWeek(day(2026, 10, 28), 1)).toEqual(day(2026, 10, 26));
  });

  it("goes back to Sunday", () => {
    expect(startOfWeek(day(2026, 10, 28), 0)).toEqual(day(2026, 10, 25));
  });

  it("stays on a day that starts the week", () => {
    expect(startOfWeek(day(2026, 10, 26), 1)).toEqual(day(2026, 10, 26));
  });
});

describe("monthWeeks", () => {
  it("covers the month in whole weeks", () => {
    const weeks = monthWeeks(day(2026, 10, 15), 1);
    expect(weeks).toHaveLength(5);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks[0][0]).toEqual(day(2026, 9, 28));
    expect(weeks.at(-1)?.at(-1)).toEqual(day(2026, 11, 1));
  });

  it("needs six weeks when the month starts late in the week", () => {
    // August 2026 starts on a Saturday and has 31 days.
    expect(monthWeeks(day(2026, 8, 1), 1)).toHaveLength(6);
  });
});

describe("parseDate", () => {
  it("reads the order the locale writes", () => {
    expect(parseDate("10/28/2026", "en-US")).toEqual(day(2026, 10, 28));
    expect(parseDate("28.10.2026", "de-DE")).toEqual(day(2026, 10, 28));
    expect(parseDate("2026/10/28", "ja-JP")).toEqual(day(2026, 10, 28));
  });

  it("takes any separator", () => {
    expect(parseDate("28-10-2026", "de-DE")).toEqual(day(2026, 10, 28));
    expect(parseDate("28 10 2026", "de-DE")).toEqual(day(2026, 10, 28));
  });

  it("reads a two-digit year as 20xx", () => {
    expect(parseDate("28.10.26", "de-DE")).toEqual(day(2026, 10, 28));
  });

  it("refuses a day the month doesn't have", () => {
    expect(parseDate("31.02.2026", "de-DE")).toBeNull();
    expect(parseDate("13/01/2026", "en-US")).toBeNull();
  });

  it("refuses anything but three numbers", () => {
    expect(parseDate("", "en-US")).toBeNull();
    expect(parseDate("10/2026", "en-US")).toBeNull();
    expect(parseDate("1/2/3/4", "en-US")).toBeNull();
  });
});

describe("small helpers", () => {
  it("compares days and months", () => {
    expect(isSameDay(new Date(2026, 9, 28, 9), new Date(2026, 9, 28, 18))).toBe(true);
    expect(isSameDay(day(2026, 10, 28), null)).toBe(false);
    expect(isSameMonth(day(2026, 10, 1), day(2026, 10, 31))).toBe(true);
  });

  it("finds the month's last day", () => {
    expect(endOfMonth(day(2026, 2, 10))).toEqual(day(2026, 2, 28));
  });

  it("writes a stable key", () => {
    expect(toKey(day(2026, 3, 5))).toBe("2026-03-05");
  });

  it("keeps a date between its limits", () => {
    const min = day(2026, 10, 10);
    const max = day(2026, 10, 20);
    expect(clampDate(day(2026, 10, 1), min, max)).toEqual(min);
    expect(clampDate(day(2026, 10, 30), min, max)).toEqual(max);
    expect(clampDate(day(2026, 10, 15), min, max)).toEqual(day(2026, 10, 15));
  });
});
