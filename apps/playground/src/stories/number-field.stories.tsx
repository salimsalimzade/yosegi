import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal } from "solid-js";
import { NumberField } from "yosegi-solid";

const meta = {
  title: "Forms/NumberField",
  component: NumberField,
  parameters: {
    stage: "field",
    docs: {
      description: { component: "A labelled input for a number, with − and + buttons, limits and steps." },
    },
  },
  args: {
    label: "Copies",
    defaultValue: 2,
    minValue: 1,
    maxValue: 10,
    step: 1,
    description: "From 1 to 10.",
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
    validationState: { control: "inline-radio", options: ["valid", "invalid"] },
  },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Try the buttons, or the arrow keys, Page Up and Down, Home and End. */
export const Default: Story = {
  render: () => <NumberField label="Copies" defaultValue={2} minValue={1} maxValue={10} description="From 1 to 10." />,
};

/** At the minimum, so − is disabled. */
export const AtTheLimit: Story = {
  name: "At the limit",
  render: () => (
    <NumberField label="Guests" defaultValue={1} minValue={1} maxValue={8} description="At least one guest." />
  ),
};

/** Out of range; step down to fix it. */
export const Invalid: Story = {
  render: () => {
    const [copies, setCopies] = createSignal(12);
    return (
      <NumberField
        label="Copies"
        value={copies()}
        onChange={setCopies}
        validationState={copies() > 10 ? "invalid" : "valid"}
        description="From 1 to 10."
        errorMessage="Enter a number from 1 to 10."
      />
    );
  },
};

export const Disabled: Story = {
  render: () => <NumberField label="Copies" defaultValue={3} disabled />,
};

/** formatOptions for currency, percent or units. */
export const Formatted: Story = {
  render: () => (
    <NumberField
      label="Budget"
      defaultValue={96000}
      step={1000}
      formatOptions={{ style: "currency", currency: "JPY" }}
    />
  ),
};

export const Percent: Story = {
  render: () => (
    <NumberField
      label="Discount"
      defaultValue={0.15}
      step={5}
      minValue={0}
      maxValue={1}
      formatOptions={{ style: "percent" }}
    />
  ),
};
