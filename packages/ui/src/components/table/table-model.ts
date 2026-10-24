import type { JSX } from "@solidjs/web";
import type { FilterValue } from "./filter";

export interface TableSort {
  /** The column's key. */
  key: string;
  direction: "asc" | "desc";
}

/** What the table shows: the search, the filters, the sort and the page. */
export interface TableQuery {
  search: string;
  filters: FilterValue;
  sort?: TableSort;
  /** From 1. */
  page: number;
  /** Rows per page, once people pick one. The table's `pageSize` until then. */
  pageSize?: number;
}

/**
 * One column. A column has three faces: the raw value (sort, filter), its text
 * (the cell, search, filter options and chips) and the rendered cell.
 */
export interface TableColumn<T> {
  /** The column's id in sorting, filters and the query, and the field it reads unless `value` is set. */
  key: Extract<keyof T, string> | (string & {});
  /** The heading; the sort button, the Filter section and its chips use it too. */
  label: string;
  /** Reads a nested or computed value; `row[key]` by default. */
  value?: (row: T) => unknown;
  /** The value as text: “$250”. By default the `options` label, or the value itself. */
  format?: (value: any) => string;
  /** Renders the cell, like an icon next to the text. Search, sort and filters still use the value. */
  cell?: (row: T, text: string) => JSX.Element;
  /** start (default), center, or end for numbers. */
  align?: "start" | "center" | "end";
  /** A CSS width: 120 or "20%". */
  width?: number | string;
  /** Classes for the column's heading and cells. */
  class?: string;
  /** Click the heading to sort. A function sorts with your own compare, ascending. */
  sortable?: boolean | ((a: T, b: T) => number);
  /** Whether the search looks in this column. True by default. */
  searchable?: boolean;
  /** A section in Filter: "options" ticks values, "range" sets from and to; true picks by the values. */
  filter?: boolean | "options" | "range";
  /** A label for each value, in the order Filter lists them: { paid: "Paid" }. */
  options?: Record<string, string>;
  /** Anything else your app keeps on a column. */
  meta?: Record<string, unknown>;
}

export function columnValue<T>(column: TableColumn<T>, row: T): unknown {
  return column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
}

// valueText runs for every cell and Intl objects are slow to make, so each
// locale's are made once and kept. undefined is the browser's locale.
function perLocale<F>(make: (locale: string | undefined) => F) {
  const made = new Map<string | undefined, F>();
  return (locale?: string) => {
    if (!made.has(locale)) made.set(locale, make(locale));
    return made.get(locale)!;
  };
}

const dateFormat = perLocale((locale) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }));
const collator = perLocale((locale) => new Intl.Collator(locale, { numeric: true, sensitivity: "base" }));

/** A value as text, without a row: for cells, filter options and chips. Dates in the locale's medium style. */
export function valueText<T>(column: TableColumn<T>, value: unknown, locale?: string) {
  if (column.format) return column.format(value);
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return dateFormat(locale).format(value);
  return column.options?.[String(value)] ?? String(value);
}

export const columnText = <T>(column: TableColumn<T>, row: T, locale?: string) =>
  valueText(column, columnValue(column, row), locale);

/** Which kind of Filter section a column gets, if any. */
export function filterKind<T>(column: TableColumn<T>, data: readonly T[]): "options" | "range" | undefined {
  if (!column.filter) return undefined;
  if (column.filter !== true) return column.filter;
  if (column.options) return "options";
  const sample = data.map((row) => columnValue(column, row)).find((value) => value !== null && value !== undefined);
  return typeof sample === "number" ? "range" : "options";
}

/** The values Filter lists for a column: `options` in their order, or the distinct values sorted. */
export function filterOptions<T>(column: TableColumn<T>, data: readonly T[], locale?: string) {
  const values = column.options
    ? Object.keys(column.options)
    : [...new Set(data.map((row) => columnValue(column, row)).filter((v) => v !== null && v !== undefined && v !== ""))]
        .sort((a, b) => compareValues(a, b, locale))
        .map(String);
  return values.map((value) => ({ value, label: column.options?.[value] ?? valueText(column, value, locale) }));
}

/** How many rows have each value of a column. */
export function countValues<T>(column: TableColumn<T>, rows: readonly T[]) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const value = String(columnValue(column, row));
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

/** Whether a row matches the search (in any searchable column) and every filter. The search reads the cells' text in the locale. */
export function rowMatches<T>(
  row: T,
  columns: readonly TableColumn<T>[],
  filters: FilterValue,
  search = "",
  locale?: string,
) {
  const q = search.trim().toLocaleLowerCase(locale);
  if (
    q &&
    !columns.some(
      (column) => column.searchable !== false && columnText(column, row, locale).toLocaleLowerCase(locale).includes(q),
    )
  ) {
    return false;
  }
  for (const [key, filter] of Object.entries(filters)) {
    const column = columns.find((c) => c.key === key);
    if (!column) continue;
    const value = columnValue(column, row);
    if (Array.isArray(filter)) {
      if (filter.length && !filter.includes(String(value))) return false;
    } else {
      const number = Number(value);
      if (filter.from !== undefined && !(number >= filter.from)) return false;
      if (filter.to !== undefined && !(number <= filter.to)) return false;
    }
  }
  return true;
}

const isEmpty = (value: unknown) => value === null || value === undefined || value === "";

/** Numbers by size, dates by time, the rest as text in the locale's natural order (“INV-9” before “INV-10”). */
export function compareValues(a: unknown, b: unknown, locale?: string) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return collator(locale).compare(String(a), String(b));
}

/** A sorted copy; empty values go last either way. */
export function sortRows<T>(
  rows: readonly T[],
  columns: readonly TableColumn<T>[],
  sort: TableSort | undefined,
  locale?: string,
) {
  const column = sort && columns.find((c) => c.key === sort.key);
  if (!sort || !column) return rows;
  const sign = sort.direction === "asc" ? 1 : -1;
  const compare = column.sortable;
  return [...rows].sort((a, b) => {
    if (typeof compare === "function") return sign * compare(a, b);
    const x = columnValue(column, a);
    const y = columnValue(column, b);
    if (isEmpty(x) || isEmpty(y)) return Number(isEmpty(x)) - Number(isEmpty(y));
    return sign * compareValues(x, y, locale);
  });
}

/**
 * Search, filter, sort and page an array, as the table does in the browser. A
 * server can run the same steps, or a pretend server in a demo. Give it the
 * table's `locale`, so the search and the sort read the cells as people see them.
 */
export function applyTableQuery<T>(
  data: readonly T[],
  columns: readonly TableColumn<T>[],
  query: TableQuery,
  pageSize = 10,
  locale?: string,
) {
  const size = query.pageSize ?? pageSize;
  const matching = data.filter((row) => rowMatches(row, columns, query.filters, query.search, locale));
  const sorted = sortRows(matching, columns, query.sort, locale);
  const start = pageOffset(query.page, size);
  return { rows: sorted.slice(start, start + size), total: matching.length };
}

/** Rows before the page: 20 for page 3 of 10. */
export const pageOffset = (page: number, pageSize: number) => (Math.max(1, page) - 1) * pageSize;
