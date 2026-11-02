import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { expect, screen, waitFor } from "storybook/test";
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

// Tests: run by Vitest (`pnpm test`), hidden from the sidebar and the docs.

/** Test: keyboard focus opens the tooltip at once and names it in aria-describedby; Escape and leaving close it. */
export const FocusAndEscape: Story = {
  name: "Focus and Escape (test)",
  tags: ["!dev", "!autodocs"],
  render: () => (
    <>
      <Tooltip trigger="Archive" content="Move to the archive" />
      <Tooltip trigger="Share" content="Copy a link" />
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const archive = canvas.getByRole("button", { name: "Archive" });
    await userEvent.tab();
    await expect(archive).toHaveFocus();

    const tip = await screen.findByRole("tooltip");
    await expect(tip).toHaveTextContent("Move to the archive");
    await expect(archive).toHaveAccessibleDescription("Move to the archive");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
    await expect(archive).toHaveFocus();

    await userEvent.tab();
    await expect(await screen.findByRole("tooltip")).toHaveTextContent("Copy a link");
  },
};

/** Test: hovering opens it after the delay, and moving away closes it. */
export const HoverTest: Story = {
  name: "Hover (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Tooltip trigger="Archive" content="Move to the archive" openDelay={100} />,
  play: async ({ canvas, userEvent }) => {
    const archive = canvas.getByRole("button", { name: "Archive" });
    await userEvent.hover(archive);
    await expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await expect(await screen.findByRole("tooltip")).toHaveTextContent("Move to the archive");

    await userEvent.unhover(archive);
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  },
};
