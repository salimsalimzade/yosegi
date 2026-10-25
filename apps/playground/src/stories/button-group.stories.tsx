import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, For } from "solid-js";
import { Button, ButtonGroup, GridIcon, ListIcon } from "yosegi-solid";

const meta = {
  title: "Actions/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    docs: {
      description: {
        component: "A row or column of related Buttons, either spaced apart or attached into one control.",
      },
    },
  },
  args: { attached: false, orientation: "horizontal", "aria-label": "Note actions" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button label="Save" />
      <Button label="Preview" variant="outline" />
      <Button label="Cancel" variant="outline" />
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Related actions in a row, with one solid main action. */
export const SpacedActions: Story = {
  name: "Spaced actions",
  render: () => (
    <ButtonGroup aria-label="Note actions">
      <Button label="Save" />
      <Button label="Preview" variant="outline" />
      <Button label="Cancel" variant="ghost" />
    </ButtonGroup>
  ),
};

/** A segmented control: one choice among a few. Click to switch. */
export const AttachedToggles: Story = {
  name: "Attached toggles",
  render: () => {
    const [range, setRange] = createSignal("Week");
    return (
      <ButtonGroup attached aria-label="Range">
        <For each={["Day", "Week", "Month", "Year"]}>
          {(value) => (
            <Button label={value} variant="outline" aria-pressed={range() === value} onClick={() => setRange(value)} />
          )}
        </For>
      </ButtonGroup>
    );
  },
};

/** Attached icon buttons, each with an aria-label. */
export const IconToolbar: Story = {
  name: "Icon toolbar",
  render: () => {
    const [view, setView] = createSignal("List");
    return (
      <ButtonGroup attached aria-label="View">
        <Button
          variant="outline"
          icon={<ListIcon />}
          aria-label="List"
          aria-pressed={view() === "List"}
          onClick={() => setView("List")}
        />
        <Button
          variant="outline"
          icon={<GridIcon />}
          aria-label="Grid"
          aria-pressed={view() === "Grid"}
          onClick={() => setView("Grid")}
        />
      </ButtonGroup>
    );
  },
};

/** orientation="vertical"; labels line up on the left. */
export const Vertical: Story = {
  render: () => {
    const [sort, setSort] = createSignal("Newest first");
    return (
      <ButtonGroup attached orientation="vertical" aria-label="Sort" style={{ width: "160px" }}>
        <For each={["Newest first", "Oldest first", "A to Z"]}>
          {(value) => (
            <Button label={value} variant="outline" aria-pressed={sort() === value} onClick={() => setSort(value)} />
          )}
        </For>
      </ButtonGroup>
    );
  },
};
