import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button, EmptyState, InboxIcon, PlusIcon, SearchOffIcon } from "yosegi";

const meta = {
  title: "Feedback/EmptyState",
  component: EmptyState,
  parameters: {
    stage: "fill",
    docs: {
      description: {
        component: "A centred message for a list or page that has nothing in it yet, with the action that fills it.",
      },
    },
  },
  args: {
    title: "No notes yet",
    description: "Notes you create show up here.",
    titleAs: "h2",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    titleAs: { control: "inline-radio", options: ["h1", "h2", "h3", "h4"] },
    icon: { control: false },
    actions: { control: false },
  },
  render: (args) => (
    <EmptyState {...args} icon={<InboxIcon />} actions={<Button label="New note" icon={<PlusIcon />} />} />
  ),
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Nothing here yet, with the action that fills it. */
export const FirstTime: Story = {
  name: "First time",
  render: () => (
    <EmptyState
      icon={<InboxIcon />}
      title="No notes yet"
      description="Notes you create show up here."
      actions={<Button label="New note" icon={<PlusIcon />} />}
    />
  ),
};

/** Repeat the search, and offer to clear it. */
export const NoResults: Story = {
  name: "No results",
  render: () => (
    <EmptyState
      icon={<SearchOffIcon />}
      title="No results for “kyoto trip”"
      description="Try fewer words, or check the spelling."
      actions={<Button label="Clear search" variant="outline" />}
    />
  ),
};

/** Inside a section, with less padding; titleAs="h3". */
export const CompactNoIcon: Story = {
  name: "Compact, no icon",
  render: () => (
    <EmptyState
      style={{ "--yosegi-empty-state-padding": "var(--yosegi-space-600) 0" }}
      title="No comments"
      titleAs="h3"
      description="Be the first to say something."
    />
  ),
};
