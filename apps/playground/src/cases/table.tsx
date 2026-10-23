import { createSignal, For, onCleanup } from "solid-js";
import {
  applyTableQuery,
  Button,
  DownloadIcon,
  InfoIcon,
  PlusIcon,
  Table,
  type DataTableProps,
  type TableColumn,
  type TableQuery,
  TickIcon,
  toast,
  TrashIcon,
  WarningIcon,
} from "yosegi";
import { Case } from "../ui/case";
import { type Invoice, invoices, methodLabels, money, statusLabels } from "../ui/invoices";

/** Initials in a circle, then the name. */
function Customer(props: { name: string }) {
  const initials = () =>
    props.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2);
  return (
    <span style={{ display: "inline-flex", "align-items": "center", gap: "var(--yosegi-space-200)" }}>
      <span
        aria-hidden="true"
        style={{
          display: "inline-grid",
          "place-items": "center",
          width: "24px",
          height: "24px",
          "border-radius": "var(--yosegi-radius-full)",
          background: "var(--yosegi-color-bg-muted)",
          color: "var(--yosegi-color-fg-muted)",
          font: "var(--yosegi-text-small)",
        }}
      >
        {initials()}
      </span>
      {props.name}
    </span>
  );
}

const statusIcons = { paid: TickIcon, pending: InfoIcon, unpaid: WarningIcon };
const statusColors = {
  paid: "var(--yosegi-color-fg-accent)",
  pending: "var(--yosegi-color-fg-muted)",
  unpaid: "var(--yosegi-color-fg-danger)",
};

/** An icon in the status's colour, then its label. */
function Status(props: { status: Invoice["status"]; label: string }) {
  const Icon = statusIcons[props.status];
  return (
    <span style={{ display: "inline-flex", "align-items": "center", gap: "var(--yosegi-space-100)" }}>
      <Icon style={{ color: statusColors[props.status], width: "16px", height: "16px" }} />
      {props.label}
    </span>
  );
}

const columns: TableColumn<Invoice>[] = [
  { key: "id", label: "Invoice", sortable: true },
  { key: "customer", label: "Customer", sortable: true, cell: (invoice) => <Customer name={invoice.customer} /> },
  { key: "status", label: "Status", filter: true, options: statusLabels, cell: (invoice, text) => <Status status={invoice.status} label={text} /> },
  { key: "method", label: "Method", filter: true, options: methodLabels },
  { key: "amount", label: "Amount", align: "end", sortable: true, filter: "range", format: (amount: number) => money.format(amount) },
];

/** Invoices in the box: title and actions, search, Filter, sorting, selection and pages. */
function InvoiceTable(props: Partial<DataTableProps<Invoice>>) {
  return (
    <Table
      title="Invoices"
      description="Sent from your account this year."
      noun="invoices"
      actions={
        <>
          <Button label="Export" variant="outline" icon={<DownloadIcon />} />
          <Button label="New invoice" icon={<PlusIcon />} />
        </>
      }
      selectable
      selectionActions={() => (
        <>
          <Button label="Export" variant="outline" size="sm" icon={<DownloadIcon />} />
          <Button label="Delete" variant="danger" size="sm" icon={<TrashIcon />} />
        </>
      )}
      data={invoices}
      columns={columns}
      // A fixed height: ten rows and the headings fit; more rows scroll inside, fewer leave space.
      height={480}
      {...props}
    />
  );
}

/** A pretend server: the same steps as the table, 600ms later. Answers to old queries are dropped. */
function ServerTable() {
  const pageSize = 10;
  const first: TableQuery = { search: "", filters: {}, page: 1 };
  const [query, setQuery] = createSignal(first);
  const [result, setResult] = createSignal(applyTableQuery(invoices, columns, first, pageSize));
  const [loading, setLoading] = createSignal(false);
  let ticket = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));

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
    <InvoiceTable
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
}

const recent = [
  { id: "INV-001", status: "Paid", method: "Card", amount: 250 },
  { id: "INV-002", status: "Pending", method: "Bank transfer", amount: 150 },
  { id: "INV-003", status: "Unpaid", method: "Card", amount: 350 },
  { id: "INV-004", status: "Paid", method: "Cash", amount: 450 },
];

export function TablePage() {
  return (
    <>
      <Case
        title="Default"
        description="data and columns: 312 invoices, 10 to a page; Rows per page picks 20, 50 or 100 and keeps your place; height={480} keeps the box the same height whatever the rows: more scroll under the headings, fewer leave space. Search, filter, sort by Invoice, Customer or Amount, tick rows and page through. Customer and Status render their own cells."
        layout="fill"
      >
        <InvoiceTable />
      </Case>

      <Case title="20 to a page" description="pageSize={20} starts at 20: 312 invoices over 16 pages. Rows per page can still change it." layout="fill">
        <InvoiceTable pageSize={20} />
      </Case>

      <Case
        title="Scrolling"
        description="50 to a page: maxHeight={400} lets the rows scroll under the headings, and lets the box shrink when fewer match. Rows per page offers 10, 20, 50 and 100."
        layout="fill"
      >
        <InvoiceTable pageSize={50} height={undefined} maxHeight={400} />
      </Case>

      <Case title="Sorted" description="defaultQuery sorts by Amount, highest first. The heading shows the direction; click it to turn it round, then off." layout="fill">
        <InvoiceTable defaultQuery={{ sort: { key: "amount", direction: "desc" } }} />
      </Case>

      <Case title="Filters applied" description="A count on Filter, a chip per filter, and the pages follow the new total." layout="fill">
        <InvoiceTable defaultQuery={{ filters: { status: ["paid", "pending"], method: ["card"], amount: { from: 100 } } }} />
      </Case>

      <Case title="Rows selected" description="The selection bar takes the place of the top bar and toolbar, with selectionActions and Clear." layout="fill">
        <InvoiceTable defaultSelected={["INV-312", "INV-310"]} />
      </Case>

      <Case title="Filters match nothing" description="Say so, and offer to clear them. The range reads “0 of …” and the pages hide." layout="fill">
        <InvoiceTable defaultQuery={{ filters: { status: ["unpaid"], amount: { from: 2000 } } }} />
      </Case>

      <Case title="Row click" description="onRowClick opens an invoice: click a row, or Tab to it and press Enter. The checkbox still only ticks." layout="fill">
        <InvoiceTable pageSize={5} onRowClick={(invoice) => toast(`Opened ${invoice.id}`)} />
      </Case>

      <Case title="Row links" description="rowHref puts a link in the first cell that covers the row, so it opens in a new tab too." layout="fill">
        <InvoiceTable pageSize={5} rowHref={(invoice) => `#${invoice.id}`} />
      </Case>

      <Case
        title="From a server"
        description="manual: the server searches, filters, sorts and pages. The search waits for typing to pause, the spinner shows while it loads, and the old rows dim until the new ones come."
        layout="fill"
      >
        <ServerTable />
      </Case>

      <Case title="Without the box" description="A plain table, for content pages and small sets: a caption, a footer, align=&quot;end&quot; for amounts." layout="fill">
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
      </Case>
    </>
  );
}
