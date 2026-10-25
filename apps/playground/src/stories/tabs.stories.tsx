import type { Meta, StoryObj } from "storybook-solidjs-vite";
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
