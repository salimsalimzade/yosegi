import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { expect, screen, waitFor, within } from "storybook/test";
import { createSignal } from "solid-js";
import { Filter, type FilterSection, type FilterValue } from "yosegi-solid";
import { countBy, invoices, matches, methodLabels, money, statusLabels } from "../ui/invoices";

const options = (field: "status" | "method", labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label, count: countBy(field, invoices)[value] ?? 0 }));

const sections: FilterSection[] = [
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
];

const resultCount = (draft: FilterValue) => invoices.filter((invoice) => matches(invoice, draft)).length;

const meta = {
  title: "Forms/Filter",
  component: Filter,
  parameters: {
    docs: {
      description: {
        component:
          "A Filter button and a side panel with every filterable column at once; Show applies them together, and each active filter becomes a chip.",
      },
    },
  },
  // The sections stay out of args: Storybook would wrap them in a store.
  args: { noun: "invoices", title: "Filters" },
  argTypes: {
    noun: { control: "text" },
    title: { control: "text" },
    sections: { control: false },
    resultCount: { control: false },
  },
  render: (args) => <Filter {...args} sections={sections} resultCount={resultCount} />,
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** “Filter” with a funnel. Open it: tick values, set a range, then Show applies them together. */
export const NoFilters: Story = {
  name: "No filters",
  render: () => {
    const [value, setValue] = createSignal<FilterValue>({});
    return <Filter value={value()} onChange={setValue} sections={sections} resultCount={resultCount} noun="invoices" />;
  },
};

/**
 * A count on the button and a removable chip per filtered column, then Clear all.
 * Close or Escape throws away what was ticked.
 */
export const FiltersOn: Story = {
  name: "Filters on",
  parameters: { stage: "stack" },
  render: () => {
    const [value, setValue] = createSignal<FilterValue>({
      status: ["paid", "pending"],
      method: ["card"],
      amount: { from: 100 },
    });
    return (
      <>
        <div style={{ display: "flex", "flex-wrap": "wrap", gap: "8px", "align-items": "center" }}>
          <Filter value={value()} onChange={setValue} sections={sections} resultCount={resultCount} noun="invoices" />
        </div>
        <p style={{ color: "var(--yosegi-color-fg-muted)" }}>{resultCount(value())} of 312 invoices match.</p>
      </>
    );
  },
};

// Tests: run by Vitest (`pnpm test`), hidden from the sidebar and the docs.

/** Test: ticks wait in the panel until Show applies them; then the button counts them and a chip shows each. */
export const ApplyTest: Story = {
  name: "Apply (test)",
  tags: ["!dev", "!autodocs"],
  render: () => {
    const [value, setValue] = createSignal<FilterValue>({});
    return (
      <>
        <Filter value={value()} onChange={setValue} sections={sections} resultCount={resultCount} noun="invoices" />
        <output>{JSON.stringify(value())}</output>
      </>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const output = canvas.getByRole("status");
    const trigger = canvas.getByRole("button", { name: "Filter" });
    await userEvent.click(trigger);

    const panel = await screen.findByRole("dialog", { name: "Filters" });
    await userEvent.click(within(panel).getByRole("checkbox", { name: /^Paid/ }));
    await expect(output).toHaveTextContent("{}");

    const show = within(panel).getByRole("button", { name: /^Show \d+ invoices$/ });
    await expect(show).toHaveTextContent(`Show ${resultCount({ status: ["paid"] })} invoices`);
    await userEvent.click(show);

    await expect(output).toHaveTextContent('{"status":["paid"]}');
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(canvas.getByLabelText("1 on")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Remove Status filter" }));
    await expect(output).toHaveTextContent("{}");
  },
};

/** Test: Escape throws away what was ticked and puts focus back on the button. */
export const EscapeTest: Story = {
  name: "Escape (test)",
  tags: ["!dev", "!autodocs"],
  render: () => {
    const [value, setValue] = createSignal<FilterValue>({});
    return (
      <>
        <Filter value={value()} onChange={setValue} sections={sections} resultCount={resultCount} noun="invoices" />
        <output>{JSON.stringify(value())}</output>
      </>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Filter" });
    await userEvent.click(trigger);
    const panel = await screen.findByRole("dialog", { name: "Filters" });
    await userEvent.click(within(panel).getByRole("checkbox", { name: /^Card/ }));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Filters" })).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent("{}");
  },
};

/** Test: a range takes numbers, and its chip reads “over …”. */
export const RangeTest: Story = {
  name: "Range (test)",
  tags: ["!dev", "!autodocs"],
  render: () => {
    const [value, setValue] = createSignal<FilterValue>({});
    return <Filter value={value()} onChange={setValue} sections={sections} resultCount={resultCount} noun="invoices" />;
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filter" }));
    const panel = await screen.findByRole("dialog", { name: "Filters" });
    await userEvent.type(within(panel).getByRole("textbox", { name: "Amount from" }), "500");
    await userEvent.tab();
    await userEvent.click(within(panel).getByRole("button", { name: /^Show/ }));
    await expect(canvas.getByText(`over ${money.format(500)}`)).toBeInTheDocument();
  },
};
