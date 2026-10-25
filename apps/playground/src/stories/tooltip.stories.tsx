import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { For } from "solid-js";
import { CalendarIcon, InfoIcon, PlusIcon, Tooltip, type TooltipProps } from "yosegi-solid";

const meta = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          "A short text label that appears when a person hovers or focuses an element, for naming icon buttons and adding a hint.",
      },
    },
  },
  args: {
    trigger: "Archive",
    content: "Move to the archive",
    placement: "top",
    openDelay: 300,
    arrow: true,
    disabled: false,
  },
  argTypes: {
    trigger: { control: "text" },
    content: { control: "text" },
    placement: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Hover for 300ms, or Tab to a button: keyboard focus opens it right away. Escape closes it. */
export const OnHoverAndFocus: Story = {
  name: "On hover and focus",
  render: () => (
    <>
      <Tooltip trigger="Archive" content="Move to the archive" />
      <Tooltip trigger="Share" content="Copy a link" />
    </>
  ),
};

/** The tooltip adds a description; the button still has its own aria-label. */
export const NamingIconButtons: Story = {
  name: "Naming icon buttons",
  render: () => (
    <>
      <Tooltip trigger={{ icon: <PlusIcon />, variant: "ghost", "aria-label": "New note" }} content="New note" />
      <Tooltip
        trigger={{ icon: <CalendarIcon />, variant: "ghost", "aria-label": "Pick a date" }}
        content="Pick a date"
      />
      <Tooltip
        trigger={{ icon: <InfoIcon />, variant: "ghost", "aria-label": "Synced 2 min ago" }}
        content="Synced 2 min ago"
      />
    </>
  ),
};

/** Always open here, so each side is visible at once. */
export const Placements: Story = {
  parameters: { stage: "center" },
  render: () => (
    <div style={{ display: "flex", gap: "96px", padding: "48px 72px" }}>
      <For each={["top", "right", "bottom", "left"] as TooltipProps["placement"][]}>
        {(placement) => (
          <Tooltip open placement={placement} trigger={{ label: placement, size: "sm" }} content={placement} />
        )}
      </For>
    </div>
  ),
};

/** openDelay={0} opens at once; disabled never opens; arrow={false} leaves just the text. */
export const InstantDisabledAndWithoutTheArrow: Story = {
  name: "Instant, disabled and without the arrow",
  render: () => (
    <>
      <Tooltip openDelay={0} trigger="No delay" content="Right away" />
      <Tooltip disabled trigger="Disabled tooltip" content="Never shown" />
      <Tooltip openDelay={0} arrow={false} trigger="No arrow" content="Just the text" />
    </>
  ),
};
