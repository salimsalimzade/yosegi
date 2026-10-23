import { createSignal } from "solid-js";
import { Filter, type FilterValue } from "yosegi";
import { Case } from "../ui/case";
import { countBy, invoices, matches, methodLabels, money, statusLabels } from "../ui/invoices";

/** The invoice filter, as the Filter page uses it. */
export function InvoiceFilter(props: { value: FilterValue; onChange: (value: FilterValue) => void }) {
  const options = (field: "status" | "method", labels: Record<string, string>) =>
    Object.entries(labels).map(([value, label]) => ({ value, label, count: countBy(field, invoices)[value] ?? 0 }));

  return (
    <Filter
      value={props.value}
      onChange={props.onChange}
      resultCount={(draft) => invoices.filter((invoice) => matches(invoice, draft)).length}
      noun="invoices"
      sections={[
        { name: "status", title: "Status", options: options("status", statusLabels) },
        { name: "method", title: "Method", options: options("method", methodLabels) },
        {
          name: "amount",
          title: "Amount",
          type: "range",
          placeholderFrom: "$0",
          placeholderTo: "Any",
          format: (value) => money.format(value),
        },
      ]}
    />
  );
}

export function FilterPage() {
  const [none, setNone] = createSignal<FilterValue>({});
  const [some, setSome] = createSignal<FilterValue>({
    status: ["paid", "pending"],
    method: ["card"],
    amount: { from: 100 },
  });
  const count = () => invoices.filter((invoice) => matches(invoice, some())).length;

  return (
    <>
      <Case
        title="No filters"
        description="“Filter” with a funnel. Open it: tick values, set a range, then Show applies them together."
        layout="fill"
      >
        <div style={{ display: "flex", "flex-wrap": "wrap", gap: "8px", "align-items": "center" }}>
          <InvoiceFilter value={none()} onChange={setNone} />
        </div>
      </Case>
      <Case
        title="Filters on"
        description="A count on the button and a removable chip per filtered column, then Clear all. Close or Escape throws away what was ticked."
        layout="fill"
      >
        <div style={{ display: "flex", "flex-wrap": "wrap", gap: "8px", "align-items": "center" }}>
          <InvoiceFilter value={some()} onChange={setSome} />
        </div>
        <p style={{ "margin-top": "12px", color: "var(--yosegi-color-fg-muted)" }}>{count()} of 312 invoices match.</p>
      </Case>
    </>
  );
}
