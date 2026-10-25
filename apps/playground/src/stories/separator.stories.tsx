import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button, Separator } from "yosegi";

const meta = {
  title: "Layout/Separator",
  component: Separator,
  parameters: {
    stage: "field",
    docs: {
      description: {
        component: "A hairline between groups of content, across or down, or with a word in the middle like “or”.",
      },
    },
  },
  args: { orientation: "horizontal", decorative: true },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
  render: (args) => (
    <div
      style={{
        display: "flex",
        "flex-direction": args.orientation === "vertical" ? "row" : "column",
        gap: "12px",
        height: args.orientation === "vertical" ? "20px" : undefined,
      }}
    >
      <span>Account</span>
      <Separator {...args} />
      <span>Billing</span>
    </div>
  ),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Across the full width, between groups. */
export const Horizontal: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "12px" }}>
      <p>Account</p>
      <Separator />
      <p style={{ color: "var(--yosegi-color-fg-muted)" }}>Profile, email and password.</p>
    </div>
  ),
};

/** Down, between items in a row. */
export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", "align-items": "center", gap: "12px", height: "20px" }}>
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Changelog</span>
      <Separator orientation="vertical" />
      <span>Support</span>
    </div>
  ),
};

/** Two lines with a word between them. */
export const WithALabel: Story = {
  name: "With a label",
  render: () => (
    <div style={{ display: "grid", gap: "12px" }}>
      <Button label="Continue with GitHub" variant="outline" />
      <Separator>or</Separator>
      <Button label="Continue with email" />
    </div>
  ),
};

/** decorative={false} gives it role="separator", for groups that matter. */
export const Announced: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "12px" }}>
      <p>Edit</p>
      <Separator decorative={false} />
      <p>Delete</p>
    </div>
  ),
};
