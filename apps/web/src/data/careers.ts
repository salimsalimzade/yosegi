// The tea shop from the dashboard is hiring: made-up roles and places, for the job application example.

export const positions = [
  { value: "shop", label: "Shop assistant", group: "In the shop" },
  { value: "tea-master", label: "Tea master", group: "In the shop" },
  { value: "buyer", label: "Tea buyer", group: "In the office" },
  { value: "designer", label: "Product designer", group: "In the office" },
  { value: "developer", label: "Web developer", group: "In the office" },
];

/** These roles ask for work to look at. */
export const needsPortfolio = (position: string | null) => position === "designer" || position === "developer";

export const cities = [
  { value: "kyoto", label: "Kyoto" },
  { value: "osaka", label: "Osaka" },
  { value: "tokyo", label: "Tokyo" },
  { value: "baku", label: "Baku" },
  { value: "berlin", label: "Berlin" },
  { value: "lisbon", label: "Lisbon" },
  { value: "london", label: "London" },
  { value: "milan", label: "Milan" },
  { value: "seoul", label: "Seoul" },
  { value: "taipei", label: "Taipei" },
  { value: "other", label: "Somewhere else" },
];

export const sources = [
  { value: "shop", label: "I visit the shop" },
  { value: "friend", label: "A friend told me" },
  { value: "board", label: "A job board" },
  { value: "social", label: "Social media" },
];

/** The label for a value among options, or a dash. */
export const labelOf = (options: { value: string; label: string }[], value: string | null) =>
  options.find((option) => option.value === value)?.label ?? "—";

export const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function monthsFromToday(months: number) {
  const date = startOfToday();
  date.setMonth(date.getMonth() + months);
  return date;
}
