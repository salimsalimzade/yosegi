import { InfoIcon, type TableColumn, type TableLabels, TickIcon, WarningIcon } from "yosegi";
import { type Invoice, methodLabels, money, statusLabels } from "./invoices";

// The invoice table's columns and cells, in English and German, for the Table cases and stories.
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

export const columns: TableColumn<Invoice>[] = [
  { key: "id", label: "Invoice", sortable: true },
  { key: "customer", label: "Customer", sortable: true, cell: (invoice) => <Customer name={invoice.customer} /> },
  {
    key: "status",
    label: "Status",
    filter: true,
    options: statusLabels,
    cell: (invoice, text) => <Status status={invoice.status} label={text} />,
  },
  { key: "method", label: "Method", filter: true, options: methodLabels },
  {
    key: "amount",
    label: "Amount",
    align: "end",
    sortable: true,
    filter: "range",
    format: (amount: number) => money.format(amount),
  },
];

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const germanColumns: TableColumn<Invoice>[] = [
  { key: "id", label: "Rechnung", sortable: true },
  { key: "customer", label: "Kunde", sortable: true },
  { key: "status", label: "Status", filter: true, options: { paid: "Bezahlt", pending: "Offen", unpaid: "Unbezahlt" } },
  { key: "method", label: "Zahlungsart", filter: true, options: { card: "Karte", bank: "Überweisung", cash: "Bar" } },
  {
    key: "amount",
    label: "Betrag",
    align: "end",
    sortable: true,
    filter: "range",
    format: (amount: number) => euro.format(amount),
  },
];

export const germanLabels: Partial<TableLabels> = {
  search: () => "Rechnungen suchen",
  selected: (_, text) => `${text} ausgewählt`,
  selectedOf: (_, text) => `von ${text}`,
  clearSelection: "Aufheben",
  selectAll: "Alle auf dieser Seite auswählen",
  selectRow: (text) => `${text} auswählen`,
  loading: () => "Rechnungen werden geladen …",
  noRows: () => "Noch keine Rechnungen.",
  noMatches: () => "Keine Rechnung passt.",
  noMatchesHint: "Kürzer suchen, weniger filtern oder alles zurücksetzen.",
  clearFilters: "Filter zurücksetzen",
  rowsPerPage: "Zeilen pro Seite",
  range: (from, to, total) => `${from}–${to} von ${total}`,
  rangeEmpty: (total) => `0 von ${total}`,
  pages: () => "Rechnungsseiten",
  filter: {
    trigger: "Filtern",
    active: (count) => `${count} aktiv`,
    remove: (title) => `Filter ${title} entfernen`,
    clearAll: "Alle zurücksetzen",
    title: "Filter",
    close: "Schließen",
    clearSection: "Zurücksetzen",
    any: "Beliebig",
    rangeTo: "bis",
    from: (title) => `${title} von`,
    to: (title) => `${title} bis`,
    over: (value) => `ab ${value}`,
    under: (value) => `bis ${value}`,
    show: (count) => (count === undefined ? "Rechnungen zeigen" : `${count} Rechnungen zeigen`),
  },
  pagination: {
    previous: "Zurück",
    next: "Weiter",
    previousPage: "Vorige Seite",
    nextPage: "Nächste Seite",
    page: (page) => `Seite ${page}`,
  },
};

/** A few invoices for a plain table. */
export const recent = [
  { id: "INV-001", status: "Paid", method: "Card", amount: 250 },
  { id: "INV-002", status: "Pending", method: "Bank transfer", amount: 150 },
  { id: "INV-003", status: "Unpaid", method: "Card", amount: 350 },
  { id: "INV-004", status: "Paid", method: "Cash", amount: 450 },
];
