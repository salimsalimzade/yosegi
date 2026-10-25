import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { For } from "solid-js";
import { Button, Checkbox, Popover, type PopoverProps, ShareIcon, toast } from "yosegi-solid";

const meta = {
  title: "Overlays/Popover",
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          "A small panel that opens next to a button for a quick task, like sharing or filtering, without leaving the page.",
      },
    },
  },
  args: {
    trigger: "Details",
    title: "Reading list",
    description: "12 notes, last edited today.",
    placement: "bottom-start",
    arrow: true,
    closeButton: true,
    modal: false,
  },
  argTypes: {
    trigger: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    placement: {
      control: "select",
      options: ["top", "top-start", "top-end", "right", "bottom", "bottom-start", "bottom-end", "left"],
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/**
 * A title, a close button, a description, a field from its props and a footer.
 * Focus moves inside; Escape returns it to the button.
 */
export const Share: Story = {
  render: () => (
    <Popover
      trigger={{ label: "Share", icon: <ShareIcon /> }}
      title="Share note"
      description="Anyone with the link can read this note."
      field={{ label: "Link", readOnly: true, defaultValue: "yosegi.app/n/8f2c" }}
      footer={<Button label="Copy link" size="sm" onClick={() => toast.success("Link copied")} />}
      placement="bottom-start"
    />
  ),
};

/** A narrower panel (--yosegi-popover-width: 240px) with checkboxes. Text as the trigger is an outline Button. */
export const Filter: Story = {
  render: () => (
    <Popover trigger="Filter" title="Show notes" placement="bottom-start" style={{ "--yosegi-popover-width": "240px" }}>
      <div style={{ display: "grid", gap: "10px" }}>
        <Checkbox label="Pinned" defaultChecked />
        <Checkbox label="With dates" defaultChecked />
        <Checkbox label="Archived" />
      </div>
    </Popover>
  ),
};

/** placement picks the side; it flips when there's no room. closeButton={false} leaves just the text. */
export const Placements: Story = {
  render: () => (
    <For each={["top", "right", "bottom", "left"] as PopoverProps["placement"][]}>
      {(placement) => (
        <Popover
          trigger={{ label: placement, variant: "ghost" }}
          description={`Opens on the ${placement}.`}
          closeButton={false}
          placement={placement}
          style={{ "--yosegi-popover-width": "200px" }}
        />
      )}
    </For>
  ),
};

/** arrow={false}: the panel sits flush, still placed against the button. */
export const WithoutTheArrow: Story = {
  name: "Without the arrow",
  render: () => (
    <Popover
      trigger="Details"
      title="Reading list"
      description="12 notes, last edited today."
      arrow={false}
      placement="bottom-start"
    />
  ),
};

/** modal keeps focus inside until it's finished or closed. */
export const Modal: Story = {
  render: () => (
    <Popover
      modal
      trigger={{ label: "New folder", variant: "solid" }}
      title="New folder"
      field={{ label: "Name", placeholder: "e.g. Travel" }}
      footer={<Button label="Create" size="sm" onClick={() => toast.success("Folder created")} />}
      placement="bottom-start"
    />
  ),
};
