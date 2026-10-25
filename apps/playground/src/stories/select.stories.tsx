import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal } from "solid-js";
import { Select, type SelectOption } from "yosegi";

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
