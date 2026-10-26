// A small tea shop, made up and the same on every visit, for the dashboard example.

export type Range = "7d" | "30d" | "90d";

export const ranges: { value: Range; label: string; days: number }[] = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "30d", label: "30 days", days: 30 },
  { value: "90d", label: "90 days", days: 90 },
];

export interface Order {
  id: string;
  customer: string;
  status: "paid" | "shipped" | "pending" | "refunded";
  channel: "online" | "shop" | "wholesale";
  items: number;
  amount: number;
  date: Date;
}

export const statusLabels = { paid: "Paid", shipped: "Shipped", pending: "Pending", refunded: "Refunded" } as const;
export const channelLabels = { online: "Online", shop: "In the shop", wholesale: "Wholesale" } as const;

export const customers = [
  "Aiko Tanaka",
  "Mateo Rossi",
  "Nia Okafor",
  "Lena Fischer",
  "Omar Haddad",
  "Sofía Herrera",
  "Emma Clarke",
  "James Walker",
  "Olivia Bennett",
];

export const products = [
  { name: "Uji matcha, ceremonial", sold: 412, revenue: 14_420 },
  { name: "Sencha, first flush", sold: 386, revenue: 7_334 },
  { name: "Hojicha, roasted", sold: 251, revenue: 4_267 },
  { name: "Genmaicha", sold: 198, revenue: 2_772 },
  { name: "Chasen, 100 prongs", sold: 74, revenue: 2_590 },
];

// A repeatable wobble, so the numbers look real without changing between visits.
const noise = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export function daysAgo(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

/** Revenue for one day, `days` ago: busier at weekends, and growing slowly. */
export function revenueOn(days: number) {
  const day = daysAgo(days).getDay();
  const weekend = day === 0 || day === 6 ? 1.35 : 1;
  return Math.round((1400 + noise(days) * 900 - days * 4) * weekend);
}

/** Orders for one day, `days` ago. */
export function ordersOn(days: number) {
  return Math.round(revenueOn(days) / (38 + noise(days + 100) * 10));
}

/** Refunds for one day, `days` ago: none on most days. */
export function refundsOn(days: number) {
  const n = noise(days + 300);
  return n < 0.12 ? 2 : n < 0.3 ? 1 : 0;
}

// 240 orders over the last 90 days, newest first.
export const orders: Order[] = Array.from({ length: 240 }, (_, i) => {
  const n = 240 - i;
  const pending = i < 6;
  return {
    id: `#${String(1000 + n)}`,
    customer: customers[(n * 5) % customers.length],
    status: pending ? "pending" : (["shipped", "paid", "shipped", "shipped", "refunded", "shipped"] as const)[n % 6],
    channel: (["online", "online", "shop", "online", "wholesale"] as const)[n % 5],
    items: 1 + (n % 4),
    amount: 18 + Math.round(noise(n) * 140),
    date: daysAgo(Math.floor(i * 0.375)),
  };
});

export const activity = [
  { initials: "AT", name: "Aiko Tanaka", text: "ordered 2 × Uji matcha", when: "4 min ago" },
  { initials: "MR", name: "Mateo Rossi", text: "left a 5-star review on Hojicha", when: "28 min ago" },
  { initials: "NO", name: "Nia Okafor", text: "asked for a refund on #1232", when: "1 h ago" },
  { initials: "LF", name: "Lena Fischer", text: "ordered a chasen and a bowl", when: "3 h ago" },
  { initials: "OH", name: "Omar Haddad", text: "opened a wholesale account", when: "Yesterday" },
];

export const money = new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const compactMoney = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
export const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
