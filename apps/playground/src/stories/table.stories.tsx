import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, For, onCleanup } from "solid-js";
import {
  applyTableQuery,
  Button,
  type DataTableProps,
  DownloadIcon,
  PlusIcon,
  Table,
  type TableQuery,
  toast,
  TrashIcon,
} from "yosegi-solid";
import { columns, germanColumns, germanLabels, recent } from "../ui/invoice-columns";
import { type Invoice, invoices, money } from "../ui/invoices";

// Invoices in the box: title and actions, search, Filter, sorting, selection and pages.
// Each story below changes a few of these args. The rows and columns stay out of args:
// Storybook would wrap them in a store, and they're too big for a control anyway.
const meta = {
  title: "Layout/Table",
  component: Table,
  parameters: {
    stage: "fill",
    docs: {
      description: {
        component:
          "Rows of data with headings. Give it data and columns and it builds the box: a title and actions, search and Filter, sortable headings, selection, then the range and Pagination at the foot.",
      },
    },
  },
  args: {
    title: "Invoices",
    description: "Sent from your account this year.",
    noun: "invoices",
    selectable: true,
    // A fixed height: ten rows and the headings fit; more rows scroll inside, fewer leave space.
    height: 480,
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    noun: { control: "text" },
    pageSize: { control: "inline-radio", options: [10, 20, 50, 100] },
    actions: { control: false },
    selectionActions: { control: false },
    data: { control: false },
    columns: { control: false },
  },
  render: (args) => (
    <Table
      {...args}
      data={invoices}
      columns={columns}
      actions={
        <>
          <Button label="Export" variant="outline" icon={<DownloadIcon />} />
          <Button label="New invoice" icon={<PlusIcon />} />
        </>
      }
      selectionActions={() => (
        <>
          <Button label="Export" variant="outline" size="sm" icon={<DownloadIcon />} />
          <Button label="Delete" variant="danger" size="sm" icon={<TrashIcon />} />
        </>
      )}
    />
  ),
} satisfies Meta<Partial<DataTableProps<Invoice>>>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * data and columns: 312 invoices, 10 to a page; Rows per page picks 20, 50 or 100 and keeps your place;
 * height={480} keeps the box the same height whatever the rows. Search, filter, sort by Invoice, Customer or
 * Amount, tick rows and page through. Customer and Status render their own cells.
 */
export const Default: Story = {};

/** pageSize={20} starts at 20: 312 invoices over 16 pages. Rows per page can still change it. */
export const TwentyToAPage: Story = {
  name: "20 to a page",
  args: { pageSize: 20 },
};

/**
 * 50 to a page: maxHeight={400} lets the rows scroll under the headings, and lets the box shrink when fewer match.
 */
export const Scrolling: Story = {
  args: { pageSize: 50, height: undefined, maxHeight: 400 },
};

/** defaultQuery sorts by Amount, highest first. The heading shows the direction; click it to turn it round, then off. */
export const Sorted: Story = {
  args: { defaultQuery: { sort: { key: "amount", direction: "desc" } } },
};

/** A count on Filter, a chip per filter, and the pages follow the new total. */
export const FiltersApplied: Story = {
  name: "Filters applied",
  args: { defaultQuery: { filters: { status: ["paid", "pending"], method: ["card"], amount: { from: 100 } } } },
};

/** The selection bar takes the place of the top bar and toolbar, with selectionActions and Clear. */
export const RowsSelected: Story = {
  name: "Rows selected",
  args: { defaultSelected: ["INV-312", "INV-310"] },
};

/** Say so, and offer to clear them. The range reads “0 of …” and the pages hide. */
export const FiltersMatchNothing: Story = {
  name: "Filters match nothing",
  args: { defaultQuery: { filters: { status: ["unpaid"], amount: { from: 2000 } } } },
};

/** onRowClick opens an invoice: click a row, or Tab to it and press Enter. The checkbox still only ticks. */
export const RowClick: Story = {
  name: "Row click",
  args: { pageSize: 5, onRowClick: (invoice) => toast(`Opened ${invoice.id}`) },
};

/** rowHref puts a link in the first cell that covers the row, so it opens in a new tab too. */
export const RowLinks: Story = {
  name: "Row links",
  args: { pageSize: 5, rowHref: (invoice) => `#${invoice.id}` },
};

/**
 * manual: the server searches, filters, sorts and pages. The search waits for typing to pause, the spinner shows
 * while it loads, and the old rows dim until the new ones come.
 */
export const FromAServer: Story = {
  name: "From a server",
  render: (args) => {
    const pageSize = 10;
    const first: TableQuery = { search: "", filters: {}, page: 1 };
    const [query, setQuery] = createSignal(first);
    const [result, setResult] = createSignal(applyTableQuery(invoices, columns, first, pageSize));
    const [loading, setLoading] = createSignal(false);
    let ticket = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    onCleanup(() => clearTimeout(timer));

    // A pretend server: the same steps as the table, 600ms later. Answers to old queries are dropped.
    const fetchRows = (next: TableQuery) => {
      setQuery(next);
      setLoading(true);
      const mine = ++ticket;
      timer = setTimeout(() => {
        if (mine !== ticket) return;
        // Fresh objects, as JSON from a server would be; rowKey keeps the rows.
        const { rows, total } = applyTableQuery(invoices, columns, next, pageSize);
        setResult({ rows: rows.map((row) => ({ ...row })), total });
        setLoading(false);
      }, 600);
    };

    return (
      <Table
        {...args}
        columns={columns}
        manual
        data={result().rows}
        rowCount={result().total}
        loading={loading()}
        query={query()}
        onQueryChange={fetchRows}
        resultCount={(filters) => applyTableQuery(invoices, columns, { ...query(), filters, page: 1 }, pageSize).total}
        pageSize={pageSize}
      />
    );
  },
};

/**
 * locale="de-DE" writes the counts and reads typed amounts the German way (1.234,5), and labels gives every word
 * the table writes, its Filter's and its Pagination's too.
 */
export const InGerman: Story = {
  name: "In German",
  render: () => (
    <Table
      title="Rechnungen"
      noun="Rechnungen"
      locale="de-DE"
      labels={germanLabels}
      selectable
      data={invoices}
      columns={germanColumns}
      defaultQuery={{ filters: { amount: { from: 500 } } }}
    />
  ),
};

/** A plain table, for content pages and small sets: a caption, a footer, align="end" for amounts. */
export const WithoutTheBox: Story = {
  name: "Without the box",
  render: () => (
    <Table>
      <Table.Caption>Your recent invoices.</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Method</Table.Head>
          <Table.Head align="end">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <For each={recent}>
          {(invoice) => (
            <Table.Row selected={invoice.id === "INV-002"}>
              <Table.Cell>{invoice.id}</Table.Cell>
              <Table.Cell>{invoice.status}</Table.Cell>
              <Table.Cell>{invoice.method}</Table.Cell>
              <Table.Cell align="end">{money.format(invoice.amount)}</Table.Cell>
            </Table.Row>
          )}
        </For>
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell colspan={3}>Total</Table.Cell>
          <Table.Cell align="end">{money.format(recent.reduce((sum, i) => sum + i.amount, 0))}</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table>
  ),
};
