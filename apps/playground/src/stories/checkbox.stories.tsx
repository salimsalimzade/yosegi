import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, For } from "solid-js";
import { Checkbox } from "yosegi";

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
