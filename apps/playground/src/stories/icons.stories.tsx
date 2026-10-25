import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { For } from "solid-js";
import { ArrowRightIcon, Button, InfoIcon, PlusIcon, SettingsIcon, TickIcon, TrashIcon } from "yosegi";
import { IconGallery } from "../ui/icon-gallery";

const swatch = { display: "inline-flex", "align-items": "center", gap: "var(--yosegi-space-200)" };

// Every icon takes the same props, so SettingsIcon stands in for all of them in the table.
const meta = {
  title: "Assets/Icons",
  component: SettingsIcon,
  parameters: {
    docs: {
      description: {
        component:
          'Yosegi\'s outline icons: a 16px grid, a 1.5px stroke and currentColor, so each follows the text around it. `import { PlusIcon } from "yosegi"`, then `<PlusIcon width height />`. To add one, see **Adding an icon**: put its SVG in `packages/ui/src/icons/` and run `pnpm generate`.',
      },
    },
  },
  args: { width: 24, height: 24 },
  argTypes: {
    width: { control: { type: "range", min: 12, max: 64, step: 2 } },
    height: { control: { type: "range", min: 12, max: 64, step: 2 } },
  },
} satisfies Meta<typeof SettingsIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Click one to copy its component. The download gives the standalone SVG, the same file as in the design system. */
export const AllIcons: Story = {
  name: "All icons",
  parameters: { stage: "fill" },
  render: () => <IconGallery />,
};

/** 16px by default (24px for the large ones). Set width and height, or size them with CSS. */
export const Sizes: Story = {
  render: () => (
    <For each={[14, 16, 18, 20, 24]}>
      {(size) => (
        <span style={{ ...swatch, "flex-direction": "column", color: "var(--yosegi-color-fg-muted)" }}>
          <SettingsIcon width={size} height={size} style={{ color: "var(--yosegi-color-fg)" }} />
          <span>{size}</span>
        </span>
      )}
    </For>
  ),
};

/** They draw in currentColor, so they match what's around them. */
export const ColourFollowsText: Story = {
  name: "Colour follows text",
  render: () => (
    <>
      <span style={swatch}>
        <InfoIcon /> Default
      </span>
      <span style={{ ...swatch, color: "var(--yosegi-color-fg-muted)" }}>
        <InfoIcon /> Muted
      </span>
      <span style={{ ...swatch, color: "var(--yosegi-color-fg-accent)" }}>
        <TickIcon /> Accent
      </span>
      <span style={{ ...swatch, color: "var(--yosegi-color-fg-danger)" }}>
        <TrashIcon /> Danger
      </span>
    </>
  ),
};

/** Buttons size them with their text; icon-only buttons need an aria-label. */
export const InComponents: Story = {
  name: "In components",
  render: () => (
    <>
      <Button label="New note" icon={<PlusIcon />} />
      <Button label="Continue" variant="outline" icon={<ArrowRightIcon />} iconPosition="end" />
      <Button variant="outline" icon={<SettingsIcon />} aria-label="Settings" />
      <Button label="Delete" variant="danger" icon={<TrashIcon />} />
    </>
  ),
};
