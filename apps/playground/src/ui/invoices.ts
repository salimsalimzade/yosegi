import type { FilterValue } from "yosegi";

export interface Invoice {
  id: string;
  customer: string;
  status: "paid" | "pending" | "unpaid";
  method: "card" | "bank" | "cash";
  amount: number;
}

export const statusLabels = { paid: "Paid", pending: "Pending", unpaid: "Unpaid" } as const;
export const methodLabels = { card: "Card", bank: "Bank transfer", cash: "Cash" } as const;

const customers = ["Aiko Tanaka", "Mateo Rossi", "Nia Okafor", "Lena Fischer", "Omar Haddad", "Sofía Herrera", "Salim Salimzade"];

// 312 invoices, newest first, the same every time, so there are pages to move through.
export const invoices: Invoice[] = Array.from({ length: 312 }, (_, i) => {
  const n = 312 - i;
  return {
    id: `INV-${String(n).padStart(3, "0")}`,
    customer: customers[(n * 3) % customers.length],
    status: (["paid", "paid", "pending", "paid", "unpaid", "paid", "paid"] as const)[n % 7],
    method: (["card", "card", "bank", "cash", "card"] as const)[n % 5],
    amount: 40 + ((n * 137) % 960),
  };
});

export const money = new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Whether an invoice passes the filters and the search. */
export function matches(invoice: Invoice, filters: FilterValue, search = "") {
  const q = search.trim().toLowerCase();
  if (q && !`${invoice.id} ${invoice.customer}`.toLowerCase().includes(q)) return false;
  for (const [name, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      if (value.length && !value.includes(String(invoice[name as keyof Invoice]))) return false;
    } else {
      const amount = Number(invoice[name as keyof Invoice]);
      if (value.from !== undefined && amount < value.from) return false;
      if (value.to !== undefined && amount > value.to) return false;
    }
  }
  return true;
}

/** How many invoices have each value of a column, among those matching the other filters. */
export function countBy(column: "status" | "method", list: Invoice[]) {
  const counts: Record<string, number> = {};
  for (const invoice of list) counts[invoice[column]] = (counts[invoice[column]] ?? 0) + 1;
  return counts;
}
