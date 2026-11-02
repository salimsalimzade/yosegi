import { describe, expect, it } from "vitest";
import {
  applyTableQuery,
  columnText,
  compareValues,
  countValues,
  filterKind,
  filterOptions,
  pageOffset,
  rowMatches,
  sortRows,
  type TableColumn,
  valueText,
} from "./table-model";

interface Invoice {
  id: string;
  customer: string;
  status: "paid" | "pending" | "unpaid";
  amount: number;
  sent?: Date;
}

const invoices: Invoice[] = [
  { id: "INV-9", customer: "Aiko Tanaka", status: "paid", amount: 250, sent: new Date(2026, 9, 2) },
  { id: "INV-10", customer: "Mateo Rossi", status: "pending", amount: 1200 },
  { id: "INV-11", customer: "Nia Okafor", status: "unpaid", amount: 75, sent: new Date(2026, 8, 30) },
  { id: "INV-2", customer: "Lena Fischer", status: "paid", amount: 980, sent: new Date(2026, 9, 14) },
];

const columns: TableColumn<Invoice>[] = [
  { key: "id", label: "Invoice", sortable: true },
  { key: "customer", label: "Customer", sortable: true },
  { key: "status", label: "Status", filter: true, options: { paid: "Paid", pending: "Pending", unpaid: "Unpaid" } },
  { key: "amount", label: "Amount", sortable: true, filter: true, format: (n: number) => `$${n}` },
  { key: "sent", label: "Sent", sortable: true, searchable: false },
];

const column = (key: string) => columns.find((c) => c.key === key)!;
const ids = (rows: readonly Invoice[]) => rows.map((row) => row.id);

describe("valueText", () => {
  it("uses the column's format first", () => {
    expect(valueText(column("amount"), 250)).toBe("$250");
  });

  it("uses the options' label, then the value itself", () => {
    expect(valueText(column("status"), "paid")).toBe("Paid");
    expect(valueText(column("status"), "refunded")).toBe("refunded");
    expect(valueText(column("customer"), "Aiko")).toBe("Aiko");
  });

  it("is empty for no value", () => {
    expect(valueText(column("customer"), null)).toBe("");
    expect(valueText(column("customer"), undefined)).toBe("");
  });

  it("writes dates in the locale, English by default", () => {
    const date = new Date(2026, 9, 2);
    expect(valueText(column("sent"), date)).toBe("Oct 2, 2026");
    expect(valueText(column("sent"), date, "de-DE")).toBe("02.10.2026");
  });

  it("reads a nested value through the column's value", () => {
    const nested: TableColumn<{ owner: { name: string } }> = {
      key: "owner",
      label: "Owner",
      value: (r) => r.owner.name,
    };
    expect(columnText(nested, { owner: { name: "Aiko" } })).toBe("Aiko");
  });
});

describe("rowMatches", () => {
  it("searches the cells' text, ignoring case", () => {
    expect(rowMatches(invoices[0], columns, {}, "aiko")).toBe(true);
    expect(rowMatches(invoices[0], columns, {}, "PAID")).toBe(true);
    expect(rowMatches(invoices[0], columns, {}, "$250")).toBe(true);
    expect(rowMatches(invoices[0], columns, {}, "rossi")).toBe(false);
  });

  it("skips columns that aren't searchable", () => {
    expect(rowMatches(invoices[0], columns, {}, "Oct")).toBe(false);
  });

  it("needs every filter to match", () => {
    expect(rowMatches(invoices[0], columns, { status: ["paid", "pending"] })).toBe(true);
    expect(rowMatches(invoices[0], columns, { status: ["unpaid"] })).toBe(false);
    expect(rowMatches(invoices[0], columns, { status: [] })).toBe(true);
  });

  it("checks both ends of a range, inclusive", () => {
    expect(rowMatches(invoices[0], columns, { amount: { from: 250 } })).toBe(true);
    expect(rowMatches(invoices[0], columns, { amount: { to: 249 } })).toBe(false);
    expect(rowMatches(invoices[0], columns, { amount: { from: 100, to: 300 } })).toBe(true);
  });

  it("ignores filters for columns it doesn't have", () => {
    expect(rowMatches(invoices[0], columns, { unknown: ["x"] })).toBe(true);
  });
});

describe("compareValues", () => {
  it("orders text naturally: INV-9 before INV-10", () => {
    expect(["INV-10", "INV-2", "INV-9"].sort((a, b) => compareValues(a, b))).toEqual(["INV-2", "INV-9", "INV-10"]);
  });

  it("orders numbers by size and dates by time", () => {
    expect(compareValues(9, 10)).toBeLessThan(0);
    expect(compareValues(new Date(2026, 0, 2), new Date(2026, 0, 1))).toBeGreaterThan(0);
  });

  it("ignores case", () => {
    expect(compareValues("apple", "Apple")).toBe(0);
  });
});

describe("sortRows", () => {
  it("leaves the rows as they are without a sort", () => {
    expect(sortRows(invoices, columns, undefined)).toBe(invoices);
  });

  it("sorts up and down", () => {
    expect(ids(sortRows(invoices, columns, { key: "id", direction: "asc" }))).toEqual([
      "INV-2",
      "INV-9",
      "INV-10",
      "INV-11",
    ]);
    expect(ids(sortRows(invoices, columns, { key: "amount", direction: "desc" }))).toEqual([
      "INV-10",
      "INV-2",
      "INV-9",
      "INV-11",
    ]);
  });

  it("puts empty values last either way", () => {
    expect(ids(sortRows(invoices, columns, { key: "sent", direction: "asc" })).at(-1)).toBe("INV-10");
    expect(ids(sortRows(invoices, columns, { key: "sent", direction: "desc" })).at(-1)).toBe("INV-10");
  });

  it("uses the column's own compare", () => {
    const byLength: TableColumn<Invoice> = {
      key: "customer",
      label: "Customer",
      sortable: (a, b) => a.customer.length - b.customer.length,
    };
    expect(ids(sortRows(invoices, [byLength], { key: "customer", direction: "asc" }))[0]).toBe("INV-11");
  });

  it("doesn't change the rows it's given", () => {
    const before = ids(invoices);
    sortRows(invoices, columns, { key: "amount", direction: "asc" });
    expect(ids(invoices)).toEqual(before);
  });
});

describe("filterKind", () => {
  it("is nothing for a column without a filter", () => {
    expect(filterKind(column("customer"), invoices)).toBeUndefined();
  });

  it("picks options for a column with options, a range for numbers", () => {
    expect(filterKind(column("status"), invoices)).toBe("options");
    expect(filterKind(column("amount"), invoices)).toBe("range");
  });

  it("keeps the kind the column asks for", () => {
    expect(filterKind({ key: "amount", label: "Amount", filter: "options" }, invoices)).toBe("options");
  });
});

describe("filterOptions", () => {
  it("lists the options in their order, with their labels", () => {
    expect(filterOptions(column("status"), invoices)).toEqual([
      { value: "paid", label: "Paid" },
      { value: "pending", label: "Pending" },
      { value: "unpaid", label: "Unpaid" },
    ]);
  });

  it("lists distinct values, sorted, without empty ones", () => {
    const customer: TableColumn<{ customer: string | null }> = { key: "customer", label: "Customer", filter: true };
    const rows = [{ customer: "Nia" }, { customer: "aiko" }, { customer: null }, { customer: "Nia" }, { customer: "" }];
    expect(filterOptions(customer, rows).map((o) => o.value)).toEqual(["aiko", "Nia"]);
  });
});

describe("countValues", () => {
  it("counts the rows with each value", () => {
    expect(countValues(column("status"), invoices)).toEqual({ paid: 2, pending: 1, unpaid: 1 });
  });
});

describe("applyTableQuery", () => {
  it("searches, filters, sorts and pages", () => {
    const { rows, total } = applyTableQuery(
      invoices,
      columns,
      { search: "", filters: { status: ["paid", "unpaid"] }, sort: { key: "amount", direction: "asc" }, page: 1 },
      2,
    );
    expect(total).toBe(3);
    expect(ids(rows)).toEqual(["INV-11", "INV-9"]);
  });

  it("gives the later pages", () => {
    const { rows } = applyTableQuery(invoices, columns, { search: "", filters: {}, page: 2 }, 3);
    expect(ids(rows)).toEqual(["INV-2"]);
  });

  it("uses the query's page size over the table's", () => {
    const { rows } = applyTableQuery(invoices, columns, { search: "", filters: {}, page: 1, pageSize: 1 }, 10);
    expect(rows).toHaveLength(1);
  });

  it("counts every match, not only the page", () => {
    expect(applyTableQuery(invoices, columns, { search: "inv", filters: {}, page: 1 }, 2).total).toBe(4);
  });
});

describe("pageOffset", () => {
  it("is the rows before the page", () => {
    expect(pageOffset(3, 10)).toBe(20);
    expect(pageOffset(0, 10)).toBe(0);
  });
});
