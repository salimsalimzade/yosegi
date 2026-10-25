import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal } from "solid-js";
import { DatePicker } from "yosegi-solid";

const today = new Date();
const inDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

const meta = {
  title: "Forms/DatePicker",
  component: DatePicker,
  parameters: {
    stage: "field",
    docs: {
      description: {
        component: "A labelled date input that people can type into or fill from a calendar that opens below it.",
      },
    },
  },
  args: {
    label: "Due date",
    description: "Type a date, or open the calendar.",
    locale: "en-US",
    firstDayOfWeek: 1,
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
    locale: { control: "select", options: ["en-US", "en-GB", "de-DE", "fr-FR", "ja-JP"] },
    firstDayOfWeek: { control: "inline-radio", options: [0, 1, 6] },
    validationState: { control: "inline-radio", options: ["valid", "invalid"] },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Type a date, or open the calendar with the button or Alt + ↓. Days before today can't be picked. */
export const Default: Story = {
  render: () => (
    <DatePicker
      label="Due date"
      defaultValue={inDays(2)}
      minValue={today}
      description="Days before today can't be picked."
    />
  ),
};

/** A day before today; pick a later one to fix it. */
export const Invalid: Story = {
  render: () => {
    const [start, setStart] = createSignal<Date | null>(inDays(-10));
    return (
      <DatePicker
        label="Start date"
        value={start()}
        onChange={setStart}
        validationState={start() && start()! < inDays(0) ? "invalid" : "valid"}
        errorMessage="Pick today or a later day."
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <DatePicker label="Return date" defaultValue={inDays(6)} disabled description="Locked once the trip is booked." />
  ),
};

export const ReadOnly: Story = {
  name: "Read-only",
  render: () => <DatePicker label="Booked on" defaultValue={inDays(-30)} readOnly />,
};

/** isDateUnavailable blocks weekends here. */
export const UnavailableDays: Story = {
  name: "Unavailable days",
  render: () => (
    <DatePicker
      label="Meeting day"
      isDateUnavailable={(date) => date.getDay() === 0 || date.getDay() === 6}
      description="Weekdays only."
    />
  ),
};

/** firstDayOfWeek={0}, as US calendars do. */
export const SundayFirst: Story = {
  name: "Sunday first",
  render: () => <DatePicker label="Delivery" firstDayOfWeek={0} defaultValue={inDays(3)} />,
};

/**
 * English (en-US) by default; locale="de-DE" writes the month and day names, and reads typed dates, the German way.
 * The buttons stay English until labels gives them other words.
 */
export const AnotherLanguage: Story = {
  name: "Another language",
  render: () => <DatePicker label="Lieferung" locale="de-DE" defaultValue={inDays(3)} />,
};
