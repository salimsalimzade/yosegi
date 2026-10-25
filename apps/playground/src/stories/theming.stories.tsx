import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { ThemeSample } from "../ui/theme-sample";
import "../ui/themes/brand.css";
import "../ui/themes/compact.css";
import "../ui/themes/knobs.css";
import "../ui/themes/palette.css";
import "../ui/themes/parts.css";
import "../ui/themes/sepia.css";
import "../ui/themes/square.css";

// The live examples on Guides › Theming. The page shows each one next to its CSS, so they stay out of
// the sidebar and hide their JSX.
const meta = {
  title: "Guides/Theming",
  tags: ["!dev", "!autodocs"],
  parameters: { docs: { canvas: { sourceState: "none" } } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Yosegi's own accent on the left, a blue one on the right. */
export const BrandColour: Story = {
  name: "Brand colour",
  render: () => (
    <>
      <ThemeSample />
      <ThemeSample class="brand" />
    </>
  ),
};

/** Every colour replaced, in both themes. */
export const OwnPalette: Story = {
  name: "Your own palette",
  render: () => (
    <>
      <ThemeSample />
      <ThemeSample class="palette" />
    </>
  ),
};

/** A smaller spacing scale and shorter controls. */
export const Compact: Story = {
  render: () => (
    <>
      <ThemeSample />
      <ThemeSample class="compact" />
    </>
  ),
};

/** Every radius set to zero. */
export const SquareCorners: Story = {
  name: "Square corners",
  render: () => (
    <>
      <ThemeSample />
      <ThemeSample class="square" />
    </>
  ),
};

/** Pill buttons, a round checkbox, flat inputs and a thicker tab indicator. */
export const Knobs: Story = {
  render: () => (
    <>
      <ThemeSample />
      <ThemeSample class="knobs" />
    </>
  ),
};

/** Labels, the selected tab and outline buttons, through their classes and states. */
export const Parts: Story = {
  render: () => (
    <>
      <ThemeSample />
      <ThemeSample class="parts" />
    </>
  ),
};

/** The light and dark themes forced on one part of the page each, whatever the rest uses. */
export const ScopedThemes: Story = {
  name: "Scoped themes",
  render: () => (
    <>
      <ThemeSample theme="light" />
      <ThemeSample theme="dark" />
    </>
  ),
};

/** A third theme, defined in the app's own CSS. */
export const CustomTheme: Story = {
  name: "Custom theme",
  render: () => (
    <>
      <ThemeSample />
      <ThemeSample theme="sepia" />
    </>
  ),
};
