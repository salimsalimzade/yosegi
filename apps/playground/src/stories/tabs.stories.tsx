import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { expect } from "storybook/test";
import { Checkbox, Tabs } from "yosegi-solid";

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  parameters: {
    stage: "fill",
    docs: {
      description: {
        component: "A row of labels that switches between views of the same place, showing one panel at a time.",
      },
    },
  },
  args: {
    "aria-label": "Notes",
    defaultValue: "all",
    orientation: "horizontal",
    activationMode: "automatic",
    tabs: [
      { value: "all", label: "All", count: 12, content: "12 notes, newest first." },
      { value: "pinned", label: "Pinned", count: 3, content: "3 pinned notes." },
      { value: "archive", label: "Archive", content: "Nothing archived yet." },
    ],
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    activationMode: { control: "inline-radio", options: ["automatic", "manual"] },
    tabs: { control: "object" },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/**
 * ← → move between tabs and switch panels; the disabled one is skipped. count adds the number after a label.
 */
export const HorizontalWithCounts: Story = {
  name: "Horizontal, with counts",
  render: () => (
    <Tabs
      aria-label="Notes"
      defaultValue="all"
      tabs={[
        {
          value: "all",
          label: "All",
          count: 12,
          content: "12 notes, newest first. “Shared” is disabled until you invite someone.",
        },
        { value: "pinned", label: "Pinned", count: 3, content: "3 pinned notes." },
        { value: "archive", label: "Archive", content: "Nothing archived yet." },
        { value: "shared", label: "Shared", disabled: true },
      ]}
    />
  ),
};

/** For settings pages with a side list; ↑ ↓ move. */
export const Vertical: Story = {
  render: () => (
    <Tabs
      aria-label="Settings"
      orientation="vertical"
      defaultValue="notifications"
      tabs={[
        { value: "profile", label: "Profile", content: "Your name and photo." },
        {
          value: "notifications",
          label: "Notifications",
          content: (
            <div style={{ display: "grid", gap: "12px", "max-width": "380px" }}>
              <Checkbox label="Weekly summary" description="Every Monday, one email." defaultChecked />
              <Checkbox label="Mentions" />
            </div>
          ),
        },
        { value: "billing", label: "Billing", disabled: true },
      ]}
    />
  ),
};

/** activationMode="manual": arrows move focus, Enter or Space switches. */
export const ManualActivation: Story = {
  name: "Manual activation",
  render: () => (
    <Tabs
      aria-label="Range"
      activationMode="manual"
      defaultValue="day"
      tabs={[
        { value: "day", label: "Day", content: "Today's notes." },
        { value: "week", label: "Week", content: "This week's notes." },
        { value: "month", label: "Month", content: "This month's notes." },
      ]}
    />
  ),
};

// Tests: run by Vitest (`pnpm test`), hidden from the sidebar and the docs.

const testTabs = [
  { value: "all", label: "All", content: "12 notes, newest first." },
  { value: "pinned", label: "Pinned", content: "3 pinned notes." },
  { value: "shared", label: "Shared", disabled: true },
  { value: "archive", label: "Archive", content: "Nothing archived yet." },
];

/** Test: a click picks a tab and shows its panel; only the picked tab is in the Tab order. */
export const PickWithTheMouse: Story = {
  name: "Pick with the mouse (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Tabs aria-label="Notes" defaultValue="all" tabs={testTabs} />,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("12 notes, newest first.");

    const pinned = canvas.getByRole("tab", { name: "Pinned" });
    await userEvent.click(pinned);
    await expect(pinned).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "Pinned" })).toHaveTextContent("3 pinned notes.");
    await expect(pinned).toHaveAttribute("tabindex", "0");
    await expect(canvas.getByRole("tab", { name: "All" })).toHaveAttribute("tabindex", "-1");
  },
};

/** Test: arrows move and pick, skipping disabled tabs and wrapping round; Home and End jump to the ends. */
export const Keyboard: Story = {
  name: "Keyboard (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Tabs aria-label="Notes" defaultValue="all" tabs={testTabs} />,
  play: async ({ canvas, userEvent }) => {
    const tab = (name: string) => canvas.getByRole("tab", { name });
    tab("All").focus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(tab("Pinned")).toHaveFocus();
    await expect(tab("Pinned")).toHaveAttribute("aria-selected", "true");

    // Shared is disabled.
    await userEvent.keyboard("{ArrowRight}");
    await expect(tab("Archive")).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(tab("All")).toHaveFocus();

    await userEvent.keyboard("{End}");
    await expect(tab("Archive")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(tab("All")).toHaveFocus();
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("12 notes, newest first.");
  },
};

/** Test: with manual activation, arrows only move focus; Enter picks. */
export const ManualKeyboard: Story = {
  name: "Manual activation keyboard (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Tabs aria-label="Notes" activationMode="manual" defaultValue="all" tabs={testTabs} />,
  play: async ({ canvas, userEvent }) => {
    const tab = (name: string) => canvas.getByRole("tab", { name });
    tab("All").focus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(tab("Pinned")).toHaveFocus();
    await expect(tab("All")).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{Enter}");
    await expect(tab("Pinned")).toHaveAttribute("aria-selected", "true");
  },
};
