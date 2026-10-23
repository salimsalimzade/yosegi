// Small date helpers for the DatePicker. Every date is a plain `Date` at
// midnight local time; nothing here deals with times or time zones.

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Moves by whole months, keeping the day where it can: 31 January + 1 month is 28 or 29 February. */
export function addMonths(date: Date, months: number) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date, firstDay: WeekDay) {
  return addDays(date, -((date.getDay() - firstDay + 7) % 7));
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined) {
  return (
    !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** yyyy-mm-dd, for form values and as a stable key. */
export function toKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function clampDate(date: Date, min?: Date, max?: Date) {
  if (min && date < startOfDay(min)) return startOfDay(min);
  if (max && date > startOfDay(max)) return startOfDay(max);
  return date;
}

/** The weeks shown for a month: whole weeks from the one holding the 1st to the one holding the last day. */
export function monthWeeks(month: Date, firstDay: WeekDay) {
  const weeks: Date[][] = [];
  let day = startOfWeek(startOfMonth(month), firstDay);
  const last = endOfMonth(month);
  while (day <= last) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(day, i)));
    day = addDays(day, 7);
  }
  return weeks;
}

/**
 * Reads a typed date in the order the locale writes it (day, month and year
 * in any order, separated by anything that isn't a digit). Two-digit years
 * mean 20xx. Returns null when it isn't a real date.
 */
export function parseDate(text: string, locale?: string) {
  const order = new Intl.DateTimeFormat(locale, { day: "numeric", month: "numeric", year: "numeric" })
    .formatToParts(new Date(2000, 10, 22))
    .map((part) => part.type)
    .filter((type) => type === "day" || type === "month" || type === "year");
  const numbers = text.match(/\d+/g);
  if (!numbers || numbers.length !== 3) return null;

  const parts = Object.fromEntries(order.map((type, i) => [type, Number(numbers[i])]));
  const year = parts.year < 100 ? 2000 + parts.year : parts.year;
  const date = new Date(year, parts.month - 1, parts.day);
  return date.getFullYear() === year && date.getMonth() === parts.month - 1 && date.getDate() === parts.day
    ? date
    : null;
}
