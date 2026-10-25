import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button, ErrorState, WarningIcon } from "yosegi";

const meta = {
  title: "Feedback/ErrorState",
  component: ErrorState,
  parameters: {
    stage: "fill",
    docs: {
      description: {
        component:
          "A centred message for something that failed to load or save, with a reference people can quote and a way to retry.",
      },
    },
  },
  args: {
    title: "Something went wrong",
    description: "We couldn't load your notes. Check your connection and try again.",
    detail: "Error 503 · ref 8f2c",
    titleAs: "h2",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    detail: { control: "text" },
    titleAs: { control: "inline-radio", options: ["h1", "h2", "h3", "h4"] },
    icon: { control: false },
    actions: { control: false },
  },
  render: (args) => <ErrorState {...args} icon={<WarningIcon />} actions={<Button label="Try again" />} />,
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** A failed first load, with a reference people can quote. */
export const WholePage: Story = {
  name: "Whole page",
  render: () => (
    <ErrorState
      icon={<WarningIcon />}
      title="Something went wrong"
      description="We couldn't load your notes. Check your connection and try again."
      detail="Error 503 · ref 8f2c"
      actions={
        <>
          <Button label="Try again" />
          <Button label="Contact support" variant="ghost" />
        </>
      }
    />
  ),
};

/** Smaller padding and a small button, inside a part of the page; titleAs="h3". */
export const OneSection: Story = {
  name: "One section",
  render: () => (
    <ErrorState
      style={{ "--yosegi-error-state-padding": "var(--yosegi-space-800) var(--yosegi-space-400)" }}
      icon={<WarningIcon />}
      title="Couldn't save"
      titleAs="h3"
      description="Your changes are kept on this device. We'll retry when you're back online."
      actions={<Button label="Retry now" variant="outline" size="sm" />}
    />
  ),
};
