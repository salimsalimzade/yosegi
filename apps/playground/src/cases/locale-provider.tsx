import { DatePicker, type LocaleLabels, LocaleProvider, NumberField, Pagination } from "yosegi";
import { Case } from "../ui/case";

const german: LocaleLabels = {
  numberField: { increment: "Erhöhen", decrement: "Verringern" },
  datePicker: { trigger: "Datum wählen", previousMonth: "Voriger Monat", nextMonth: "Nächster Monat" },
  pagination: {
    previous: "Zurück",
    next: "Weiter",
    previousPage: "Vorige Seite",
    nextPage: "Nächste Seite",
    page: (page) => `Seite ${page}`,
  },
};

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000);

export function LocaleProviderPage() {
  return (
    <>
      <Case
        title="Set once"
        description="One LocaleProvider near the root gives every component inside its locale and labels: German numbers, dates, month names and button names here, with no props on the components."
        layout="stack"
      >
        <LocaleProvider locale="de-DE" labels={german}>
          <NumberField label="Menge" defaultValue={1234.5} step={0.5} />
          <DatePicker label="Fällig am" defaultValue={inDays(3)} />
          <Pagination count={12} defaultPage={3} aria-label="Seiten" />
        </LocaleProvider>
      </Case>

      <Case
        title="A component's own props win"
        description="Inside the same German provider, this NumberField sets locale=&quot;en-US&quot; and this Pagination sets labels for its arrows; everything they don't set still comes from the provider."
        layout="stack"
      >
        <LocaleProvider locale="de-DE" labels={german}>
          <NumberField label="Amount" locale="en-US" defaultValue={1234.5} step={0.5} />
          <Pagination count={12} defaultPage={3} aria-label="Seiten" labels={{ previous: "‹", next: "›" }} />
        </LocaleProvider>
      </Case>

      <Case
        title="Nested"
        description="A provider inside another changes only what it sets: this one sets locale=&quot;fr-FR&quot;, so the numbers and month names are French and the labels stay German."
        layout="stack"
      >
        <LocaleProvider locale="de-DE" labels={german}>
          <LocaleProvider locale="fr-FR">
            <NumberField label="Quantité" defaultValue={1234.5} step={0.5} />
            <DatePicker label="Échéance" defaultValue={inDays(3)} />
          </LocaleProvider>
        </LocaleProvider>
      </Case>
    </>
  );
}
