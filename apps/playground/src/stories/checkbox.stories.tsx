import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { expect } from "storybook/test";
import { createSignal, For } from "solid-js";
import { Checkbox } from "yosegi-solid";

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  parameters: {
    stage: "field",
    docs: {
      description: {
        component: "A box a person ticks to turn one option on or off, with a label and optional hint or error.",
      },
    },
  },
  args: {
    label: "Send me a weekly summary",
    description: "Every Monday, one email, no ads.",
    indeterminate: false,
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
    validationState: { control: "inline-radio", options: ["valid", "invalid"] },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

export const CheckedWithAHint: Story = {
  name: "Checked, with a hint",
  render: () => (
    <Checkbox label="Send me a weekly summary" defaultChecked description="Every Monday, one email, no ads." />
  ),
};

export const Unchecked: Story = {
  render: () => <Checkbox label="Make this project public" />,
};

/** A select-all box when some are selected. Click the rows below it. */
export const Indeterminate: Story = {
  render: () => {
    const notes = ["Trip to Kyoto", "Reading list", "Groceries"];
    const [picked, setPicked] = createSignal(["Reading list"]);
    const toggle = (note: string, on: boolean) =>
      setPicked((list) => (on ? [...list, note] : list.filter((n) => n !== note)));
    return (
      <>
        <Checkbox
          label="Select all notes"
          checked={picked().length === notes.length}
          indeterminate={picked().length > 0 && picked().length < notes.length}
          onChange={(on) => setPicked(on ? notes : [])}
          description={`${picked().length} of ${notes.length} selected.`}
        />
        <For each={notes}>
          {(note) => (
            <Checkbox
              label={note}
              checked={picked().includes(note)}
              onChange={(on) => toggle(note, on)}
              style={{ "margin-left": "26px" }}
            />
          )}
        </For>
      </>
    );
  },
};

/** Tick it to clear the error. */
export const Invalid: Story = {
  render: () => {
    const [terms, setTerms] = createSignal(false);
    return (
      <Checkbox
        label="I accept the terms"
        checked={terms()}
        onChange={setTerms}
        validationState={terms() ? "valid" : "invalid"}
        errorMessage="Accept the terms to continue."
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <>
      <Checkbox label="Sync over mobile data" defaultChecked disabled />
      <Checkbox label="Archive old notes" disabled />
    </>
  ),
};

// Tests: run by Vitest (`pnpm test`), hidden from the sidebar and the docs.

/** Test: the box and its label tick and untick it, and so does Space. */
export const Ticking: Story = {
  name: "Ticking (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Checkbox label="Weekly summary" description="Every Monday, one email." />,
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Weekly summary" });
    await expect(checkbox).toHaveAccessibleDescription("Every Monday, one email.");
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(canvas.getByText("Weekly summary"));
    await expect(checkbox).toBeChecked();

    await userEvent.keyboard(" ");
    await expect(checkbox).toHaveFocus();
    await expect(checkbox).not.toBeChecked();
  },
};

/** Test: an indeterminate box reads as mixed, and a click ticks it. */
export const IndeterminateTest: Story = {
  name: "Indeterminate (test)",
  tags: ["!dev", "!autodocs"],
  render: () => {
    const [checked, setChecked] = createSignal(false);
    return <Checkbox label="All notes" checked={checked()} indeterminate={!checked()} onChange={setChecked} />;
  },
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "All notes" });
    await expect(checkbox).toBePartiallyChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(checkbox).not.toBePartiallyChecked();
  },
};

/** Test: a disabled box can't be ticked. */
export const DisabledTest: Story = {
  name: "Disabled (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Checkbox label="Mentions" disabled />,
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Mentions" });
    await expect(checkbox).toBeDisabled();
    checkbox.click();
    await expect(checkbox).not.toBeChecked();
  },
};
