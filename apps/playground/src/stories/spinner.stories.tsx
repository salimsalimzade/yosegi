import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button, Spinner } from "yosegi";

const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          "A small turning ring that says something is in progress; used inside Button and TextField loading states.",
      },
    },
  },
  args: { size: 16, label: "Loading" },
  argTypes: {
    size: { control: { type: "range", min: 8, max: 48, step: 2 } },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** 16px by default; set size for others. */
export const Sizes: Story = {
  render: () => (
    <>
      <Spinner size={12} label="Loading" />
      <Spinner label="Loading" />
      <Spinner size={20} label="Loading" />
      <Spinner size={24} label="Loading" />
    </>
  ),
};

/** It draws in currentColor, so it matches what's around it. */
export const ColourFollowsText: Story = {
  name: "Colour follows text",
  render: () => (
    <>
      <Spinner style={{ color: "var(--yosegi-color-fg-muted)" }} label="Loading" />
      <Spinner style={{ color: "var(--yosegi-color-fg-accent)" }} label="Loading" />
      <Button label="Save" loading loadingText="Saving…" />
    </>
  ),
};

/** Decorative next to visible text; label it when it stands alone. */
export const WithWords: Story = {
  name: "With words",
  render: () => (
    <span
      style={{ display: "inline-flex", "align-items": "center", gap: "8px", color: "var(--yosegi-color-fg-muted)" }}
    >
      <Spinner />
      Loading notes…
    </span>
  ),
};
