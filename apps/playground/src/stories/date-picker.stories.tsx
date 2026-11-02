import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { expect, screen, waitFor, within } from "storybook/test";
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

// Tests: run by Vitest (`pnpm test`), hidden from the sidebar and the docs.

/** Test: a date typed in the locale's order is read on Enter and written back in full. */
export const TypeADate: Story = {
  name: "Type a date (test)",
  tags: ["!dev", "!autodocs"],
  render: () => {
    const [date, setDate] = createSignal<Date | null>(null);
    return (
      <>
        <DatePicker label="Due date" value={date()} onChange={setDate} />
        <output>{date()?.toDateString() ?? "none"}</output>
      </>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Due date" });
    await userEvent.type(input, "1/5/2026{Enter}");
    await expect(input).toHaveValue("01/05/2026");
    await expect(canvas.getByRole("status")).toHaveTextContent("Mon Jan 05 2026");

    await userEvent.clear(input);
    await userEvent.type(input, "31.12.2026");
    await userEvent.tab();
    await expect(canvas.getByRole("status")).not.toHaveTextContent("Dec 31 2026");
  },
};

/** Test: the calendar opens on the chosen day; arrows and Page Down move, Enter picks and closes it. */
export const PickFromTheCalendar: Story = {
  name: "Pick from the calendar (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <DatePicker label="Due date" defaultValue={new Date(2026, 9, 28)} />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Due date" });
    await userEvent.click(canvas.getByRole("button", { name: "Choose a date" }));

    const calendar = await screen.findByRole("dialog", { name: "October 2026" });
    const day = (name: string) => within(calendar).getByRole("button", { name });
    await waitFor(() => expect(day("Wednesday, October 28, 2026")).toHaveFocus());

    await userEvent.keyboard("{ArrowRight}");
    await expect(day("Thursday, October 29, 2026")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(within(calendar).getByRole("heading")).toHaveTextContent("November 2026");
    await expect(day("Thursday, November 5, 2026")).toHaveFocus();
    await userEvent.keyboard("{PageDown}");
    await expect(day("Saturday, December 5, 2026")).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(input).toHaveValue("12/05/2026");
  },
};

/** Test: days isDateUnavailable blocks can't be picked. */
export const UnavailableDaysTest: Story = {
  name: "Unavailable days (test)",
  tags: ["!dev", "!autodocs"],
  render: () => (
    <DatePicker
      label="Meeting day"
      defaultValue={new Date(2026, 9, 28)}
      isDateUnavailable={(date) => date.getDay() === 0 || date.getDay() === 6}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Meeting day" });
    await userEvent.click(canvas.getByRole("button", { name: "Choose a date" }));
    const calendar = await screen.findByRole("dialog");
    const saturday = within(calendar).getByRole("button", { name: "Saturday, October 31, 2026" });
    await expect(saturday).toHaveAttribute("aria-disabled", "true");

    // The arrows still reach it, but Enter doesn't pick it.
    await waitFor(() => expect(within(calendar).getByRole("button", { name: /October 28/ })).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    await expect(saturday).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(screen.getByRole("dialog")).toBeInTheDocument();
    await expect(input).toHaveValue("10/28/2026");
  },
};
