import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button, Kbd, KbdGroup } from "yosegi-solid";

const meta = {
  title: "Layout/Kbd",
  component: Kbd,
  parameters: {
    // Only Playground passes args on; every other story draws fixed keys, so a control would change nothing.
    controls: { disable: true },
    docs: {
      description: {
        component: "A key drawn as a keycap, and KbdGroup for keys pressed together, like ⌘ K.",
      },
    },
  },
  args: { children: "K" },
  argTypes: {
    children: { control: "text" },
    label: { control: "text" },
    // A kbd has no role to name, so screen readers skip an aria-label on it.
    "aria-label": { table: { disable: true } },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {
  parameters: { controls: { disable: false } },
};

/** Single keys: symbols, letters and named keys. */
export const Keys: Story = {
  render: () => (
    <>
      <Kbd label="Command">⌘</Kbd>
      <Kbd label="Shift">⇧</Kbd>
      <Kbd>K</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>Esc</Kbd>
    </>
  ),
};

/** KbdGroup with keys builds one Kbd for each, side by side. */
export const Combination: Story = {
  render: () => (
    <>
      <KbdGroup keys={[{ key: "⌘", label: "Command" }, "K"]} />
      <KbdGroup keys={["Ctrl", "Shift", "P"]} />
    </>
  ),
};

/**
 * label is what screen readers say instead of a symbol they read badly, like ⌘. It's hidden on
 * screen; text keys like Ctrl don't need one. In keys, give the key and its label together.
 */
export const LabelledSymbols: Story = {
  name: "Labelled symbols",
  render: () => (
    <>
      <Kbd label="Command">⌘</Kbd>
      <Kbd label="Option">⌥</Kbd>
      <KbdGroup keys={[{ key: "⌃", label: "Control" }, { key: "⇧", label: "Shift" }, "P"]} />
    </>
  ),
};

/** separator goes between the keys: "+" for held together, "then" for one after another. */
export const WithASeparator: Story = {
  name: "With a separator",
  render: () => (
    <>
      <KbdGroup keys={["Ctrl", "C"]} separator="+" />
      <KbdGroup keys={["G", "I"]} separator="then" />
    </>
  ),
};

/** Kbds written inside the group, for keys that need more than text. */
export const ComposedByHand: Story = {
  name: "Composed by hand",
  render: () => (
    <KbdGroup>
      <Kbd label="Command">⌘</Kbd>
      <Kbd label="Option">⌥</Kbd>
      <Kbd>Space</Kbd>
    </KbdGroup>
  ),
};

/** In running text, to tell someone which keys to press. */
export const InText: Story = {
  name: "In text",
  parameters: { stage: "field" },
  render: () => (
    <p>
      Press <KbdGroup keys={[{ key: "⌘", label: "Command" }, "K"]} /> to open the command palette, or <Kbd>/</Kbd> to
      search.
    </p>
  ),
};

/** On a button, as a hint for its shortcut. */
export const OnAButton: Story = {
  name: "On a button",
  render: () => (
    <Button
      label={
        <>
          Search <KbdGroup keys={[{ key: "⌘", label: "Command" }, "K"]} />
        </>
      }
      variant="outline"
    />
  ),
};
