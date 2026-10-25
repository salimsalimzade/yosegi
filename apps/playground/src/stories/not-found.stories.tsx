import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button, NotFound } from "yosegi";

const meta = {
  title: "Feedback/NotFound",
  component: NotFound,
  parameters: {
    stage: "fill",
    docs: {
      description: {
        component: "A centred message for a page or item that doesn't exist, with a large code and a way back.",
      },
    },
  },
  args: {
    code: "404",
    title: "Page not found",
    description: "The page you're looking for doesn't exist or has moved.",
    titleAs: "h2",
  },
  argTypes: {
    code: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    titleAs: { control: "inline-radio", options: ["h1", "h2", "h3", "h4"] },
    actions: { control: false },
  },
  render: (args) => <NotFound {...args} actions={<Button label="Go home" as="a" href="#" />} />,
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** The router's catch-all route; titleAs="h2" here, h1 by default. */
export const Page: Story = {
  render: () => (
    <NotFound
      code="404"
      title="Page not found"
      titleAs="h2"
      description="The page you're looking for doesn't exist or has moved. Check the address, or start again from home."
      actions={
        <>
          <Button label="Go home" as="a" href="#" />
          <Button label="Go back" variant="outline" onClick={() => history.back()} />
        </>
      }
    />
  ),
};

/** A single thing that's gone, inside a page: --yosegi-not-found-code-size and padding make it smaller. */
export const OneItem: Story = {
  name: "One item",
  render: () => (
    <NotFound
      style={{
        "--yosegi-not-found-padding": "var(--yosegi-space-800) var(--yosegi-space-400)",
        "--yosegi-not-found-code-size": "48px",
      }}
      code="404"
      title="This note doesn't exist"
      titleAs="h3"
      description="It may have been deleted, or the link is wrong."
      actions={<Button label="All notes" variant="outline" />}
    />
  ),
};
