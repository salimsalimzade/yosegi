import { createSignal, For } from "solid-js";
import { Filter, type FilterValue } from "yosegi";
import { Case } from "../ui/case";
import { countBy, invoices, matches, methodLabels, money, statusLabels } from "../ui/invoices";

/** The invoice filter, as the Table and Filter pages use it. */
export function InvoiceFilter(props: { value: FilterValue; onChange: (value: FilterValue) => void }) {
  return (
    <Filter
      value={props.value}
      onChange={props.onChange}
      resultCount={(draft) => invoices.filter((invoice) => matches(invoice, draft)).length}
      noun="invoices"
    >
      <Filter.Trigger />
      <Filter.Chips />
      <Filter.Portal>
        <Filter.Overlay />
        <Filter.Content>
          <Filter.Header>Filters</Filter.Header>
          <Filter.Section name="status" title="Status">
            <For each={Object.entries(statusLabels)}>
              {([value, label]) => (
                <Filter.Option value={value} count={countBy("status", invoices)[value] ?? 0}>
                  {label}
                </Filter.Option>
              )}
            </For>
          </Filter.Section>
          <Filter.Section name="method" title="Method">
            <For each={Object.entries(methodLabels)}>
              {([value, label]) => (
                <Filter.Option value={value} count={countBy("method", invoices)[value] ?? 0}>
                  {label}
                </Filter.Option>
              )}
            </For>
          </Filter.Section>
          <Filter.Section name="amount" title="Amount" type="range">
            <Filter.Range placeholderFrom="$0" placeholderTo="Any" format={(value) => money.format(value)} />
          </Filter.Section>
          <Filter.Footer />
        </Filter.Content>
      </Filter.Portal>
    </Filter>
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
