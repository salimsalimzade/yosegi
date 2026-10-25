import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { DatePicker, type LocaleLabels, LocaleProvider, NumberField, Pagination } from "yosegi-solid";

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

const meta = {
  title: "Setup/LocaleProvider",
  component: LocaleProvider,
  parameters: {
    stage: "field",
    docs: {
      description: {
        component:
          "Sets the locale and the labels for every component inside, once; a component's own locale and labels still win.",
      },
    },
  },
  args: { locale: "de-DE", labels: german },
  argTypes: {
    locale: { control: "select", options: ["en-US", "en-GB", "de-DE", "fr-FR", "ja-JP", "az-AZ"] },
    labels: { control: "object" },
  },
  render: (args) => (
    <LocaleProvider {...args}>
      <NumberField label="Amount" defaultValue={1234.5} step={0.5} />
      <DatePicker label="Due" defaultValue={inDays(3)} />
      <Pagination count={12} defaultPage={3} />
    </LocaleProvider>
  ),
} satisfies Meta<typeof LocaleProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/**
 * One LocaleProvider near the root gives every component inside its locale and labels: German numbers, dates,
 * month names and button names here, with no props on the components.
 */
export const SetOnce: Story = {
  name: "Set once",
  render: () => (
    <LocaleProvider locale="de-DE" labels={german}>
      <NumberField label="Menge" defaultValue={1234.5} step={0.5} />
      <DatePicker label="Fällig am" defaultValue={inDays(3)} />
      <Pagination count={12} defaultPage={3} aria-label="Seiten" />
    </LocaleProvider>
  ),
};

/**
 * Inside the same German provider, this NumberField sets locale="en-US" and this Pagination sets labels for its
 * arrows; everything they don't set still comes from the provider.
 */
export const AComponentsOwnPropsWin: Story = {
  name: "A component's own props win",
  render: () => (
    <LocaleProvider locale="de-DE" labels={german}>
      <NumberField label="Amount" locale="en-US" defaultValue={1234.5} step={0.5} />
      <Pagination count={12} defaultPage={3} aria-label="Seiten" labels={{ previous: "‹", next: "›" }} />
    </LocaleProvider>
  ),
};

/**
 * A provider inside another changes only what it sets: this one sets locale="fr-FR", so the numbers and month
 * names are French and the labels stay German.
 */
export const Nested: Story = {
  render: () => (
    <LocaleProvider locale="de-DE" labels={german}>
      <LocaleProvider locale="fr-FR">
        <NumberField label="Quantité" defaultValue={1234.5} step={0.5} />
        <DatePicker label="Échéance" defaultValue={inDays(3)} />
      </LocaleProvider>
    </LocaleProvider>
  ),
};
