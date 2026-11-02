import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal } from "solid-js";
import { expect, screen, waitFor, within } from "storybook/test";
import { Select, type SelectOption } from "yosegi-solid";

const statuses: SelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived", disabled: true },
];

const roles: SelectOption[] = [
  { value: "owner", label: "Owner", group: "Full access" },
  { value: "admin", label: "Admin", group: "Full access" },
  { value: "editor", label: "Editor", group: "Can edit" },
  { value: "author", label: "Author", group: "Can edit" },
  { value: "viewer", label: "Viewer", group: "Read only" },
  { value: "guest", label: "Guest", group: "Read only" },
];

/** Your own objects: the API's shape, not { value, label }. */
const plans = [
  { code: "free", title: "Free", seats: 1 },
  { code: "team", title: "Team", seats: 10 },
  { code: "business", title: "Business", seats: 50 },
  { code: "legacy", title: "Legacy", seats: 5, retired: true },
];

const categories: SelectOption[] = [
  { value: "travel", label: "Travel, food and long weekends in the mountains" },
  { value: "work", label: "Work" },
  { value: "home", label: "Home" },
];

const meta = {
  title: "Forms/Select",
  component: Select,
  parameters: {
    stage: "field",
    docs: {
      description: {
        component:
          "A button that opens a short list, for about 3 to 10 options: open, pick, done. No search; for longer lists use Combobox.",
      },
    },
  },
  args: {
    label: "Status",
    options: statuses,
    placeholder: "Choose a status",
    description: "Who can see the post depends on it.",
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
    options: { control: "object" },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** The placeholder, in muted text. Archived can't be picked. */
export const NothingChosenYet: Story = {
  name: "Nothing chosen yet",
  render: () => (
    <Select
      label="Status"
      options={statuses}
      placeholder="Choose a status"
      description="Who can see the post depends on it."
    />
  ),
};

/** Controlled: the value lives in the page. */
export const Chosen: Story = {
  render: () => {
    const [status, setStatus] = createSignal<string | null>("review");
    return (
      <>
        <Select
          label="Status"
          options={statuses}
          placeholder="Choose a status"
          value={status()}
          onChange={setStatus}
          description="Who can see the post depends on it."
        />
        <p>
          Chosen: <code>{status() ?? "nothing"}</code>
        </p>
      </>
    );
  },
};

/** Options with a group sit under its heading. */
export const Groups: Story = {
  render: () => <Select label="Role" options={roles} placeholder="Choose a role" defaultValue="editor" />,
};

/** renderOption draws each option's row. */
export const YourOwnRows: Story = {
  name: "Your own rows",
  render: () => (
    <Select
      label="Status"
      options={statuses}
      defaultValue="published"
      renderOption={(option) => (
        <>
          {option.label} <small style={{ color: "var(--yosegi-color-fg-muted)" }}>{option.value}</small>
        </>
      )}
    />
  ),
};

/**
 * options are { code, title, seats, retired }: getOptionValue, getOptionLabel and getOptionDisabled read them.
 * onChange gets the code and the plan.
 */
export const YourOwnObjects: Story = {
  name: "Your own objects",
  render: () => {
    const [seats, setSeats] = createSignal<number | null>(null);
    return (
      <>
        <Select
          label="Plan"
          placeholder="Choose a plan"
          options={plans}
          getOptionValue={(plan) => plan.code}
          getOptionLabel={(plan) => plan.title}
          getOptionDisabled={(plan) => !!plan.retired}
          onChange={(_, plan) => setSeats(plan.seats)}
        />
        <p>
          Seats: <code>{seats() ?? "nothing chosen"}</code>
        </p>
      </>
    );
  },
};

/** The ErrorMessage replaces the Description. */
export const Invalid: Story = {
  render: () => (
    <Select
      label="Status"
      options={statuses}
      placeholder="Choose a status"
      description="Who can see the post depends on it."
      errorMessage="Choose a status."
    />
  ),
};

/** Say why in the Description. */
export const Disabled: Story = {
  render: () => (
    <Select
      label="Status"
      options={statuses}
      defaultValue="published"
      disabled
      description="Published posts are locked."
    />
  ),
};

/** A muted box with no chevron; the value is still sent with a form. */
export const ReadOnly: Story = {
  name: "Read-only",
  render: () => (
    <Select label="Status" options={statuses} defaultValue="scheduled" readOnly description="Set by your editor." />
  ),
};

/** Ends with “…” in the box and in rows. */
export const LongValue: Story = {
  name: "Long value",
  render: () => <Select label="Category" options={categories} defaultValue="travel" placeholder="Choose a category" />,
};

/**
 * Enter, Space, ↓ or ↑ opens it; ↑ ↓ move, Home and End jump, Enter or Space picks, Escape closes.
 * A letter moves to the next option starting with it.
 */
export const Keyboard: Story = {
  render: () => <Select label="Status" options={statuses} placeholder="Choose a status" />,
};

// Tests: run by Vitest (`pnpm test`), hidden from the sidebar and the docs.

/** Test: a click opens the list, a click on an option picks it and closes the list. */
export const PickWithTheMouse: Story = {
  name: "Pick with the mouse (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Select label="Status" options={statuses} placeholder="Choose a status" />,
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole("combobox", { name: "Status" });
    await expect(box).toHaveTextContent("Choose a status");

    await userEvent.click(box);
    const list = await screen.findByRole("listbox");
    await expect(box).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(within(list).getByRole("option", { name: "Scheduled" }));
    await expect(box).toHaveTextContent("Scheduled");
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  },
};

/** Test: arrows move over the options, skipping disabled ones, Enter picks, Escape closes and focus stays on the box. */
export const PickWithTheKeyboard: Story = {
  name: "Pick with the keyboard (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Select label="Status" options={statuses} placeholder="Choose a status" />,
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole("combobox", { name: "Status" });
    const active = () => document.getElementById(box.getAttribute("aria-activedescendant") ?? "");

    box.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(box).toHaveAttribute("aria-expanded", "true");
    await expect(active()).toHaveTextContent("Draft");

    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(active()).toHaveTextContent("Scheduled");

    // Archived is disabled, so End stops on Published.
    await userEvent.keyboard("{End}");
    await expect(active()).toHaveTextContent("Published");

    await userEvent.keyboard("{Enter}");
    await expect(box).toHaveTextContent("Published");
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await expect(box).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");
    await expect(box).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await expect(box).toHaveTextContent("Published");
    await expect(box).toHaveFocus();
  },
};

/** Test: typed letters move to the option they start; after a pause, typing starts a new prefix. */
export const TypeToFind: Story = {
  name: "Type to find (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Select label="Status" options={statuses} placeholder="Choose a status" />,
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole("combobox", { name: "Status" });
    const active = () => document.getElementById(box.getAttribute("aria-activedescendant") ?? "");

    await userEvent.click(box);
    await userEvent.keyboard("p");
    await expect(active()).toHaveTextContent("Published");

    // Letters within half a second build one prefix: “in” finds In review.
    await new Promise((resolve) => setTimeout(resolve, 600));
    await userEvent.keyboard("in");
    await expect(active()).toHaveTextContent("In review");
  },
};

/** Test: a disabled Select doesn't open. */
export const DisabledDoesNotOpen: Story = {
  name: "Disabled doesn't open (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Select label="Status" options={statuses} defaultValue="published" disabled />,
  play: async ({ canvas }) => {
    const box = canvas.getByRole("combobox", { name: "Status" });
    await expect(box).toBeDisabled();
    box.click();
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  },
};
