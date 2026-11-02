import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { expect } from "storybook/test";
import { Accordion, type AccordionSection } from "yosegi-solid";

const faq: AccordionSection[] = [
  {
    value: "what",
    title: "What is Yosegi?",
    content:
      "A small design system for SolidJS. Plain pieces, one accent colour, and parts you can style however you like.",
  },
  {
    value: "colours",
    title: "Can I change the colours?",
    content:
      "Yes. Set a system token such as --yosegi-color-bg-accent, or a component knob such as --yosegi-accordion-border.",
  },
  {
    value: "parts",
    title: "Which parts can I style?",
    content:
      "Every part: Accordion, Item, Header, Trigger and Content. Each renders a stable class and data attributes.",
  },
];

const locked: AccordionSection = {
  value: "locked",
  title: "Can items be locked?",
  content: "This one is disabled, so it cannot be opened.",
  disabled: true,
};

const meta = {
  title: "Disclosure/Accordion",
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          "A stack of headings that each show or hide a section of content, for FAQs, settings groups and long forms.",
      },
    },
  },
  args: { sections: faq, defaultValue: ["what"], collapsible: true, multiple: false },
  argTypes: {
    sections: { control: "object" },
  },
  render: (args) => <Accordion {...args} style={{ width: "100%", "max-width": "560px" }} />,
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Opening one closes the other; ↑ ↓ move between headings. */
export const OneAtATime: Story = {
  name: "One at a time",
  render: () => (
    <Accordion
      collapsible
      defaultValue={["what"]}
      sections={[...faq, locked]}
      style={{ width: "100%", "max-width": "560px" }}
    />
  ),
};

/** multiple lets any number stay open. */
export const SeveralOpen: Story = {
  name: "Several open",
  render: () => (
    <Accordion
      multiple
      defaultValue={["what", "colours"]}
      sections={faq}
      style={{ width: "100%", "max-width": "560px" }}
    />
  ),
};

/** Without collapsible, the open item can't be closed. */
export const AlwaysOneOpen: Story = {
  name: "Always one open",
  render: () => <Accordion defaultValue={["parts"]} sections={faq} style={{ width: "100%", "max-width": "560px" }} />,
};

// Tests: run by Vitest (`pnpm test`), hidden from the sidebar and the docs.

/** Test: one at a time: opening a section closes the other, and a collapsible one closes on a second click. */
export const OneAtATimeTest: Story = {
  name: "One at a time (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Accordion collapsible defaultValue={["what"]} sections={[...faq, locked]} />,
  play: async ({ canvas, userEvent }) => {
    const button = (name: string) => canvas.getByRole("button", { name });
    await expect(button("What is Yosegi?")).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("region", { name: "What is Yosegi?" })).toBeVisible();

    await userEvent.click(button("Can I change the colours?"));
    await expect(button("Can I change the colours?")).toHaveAttribute("aria-expanded", "true");
    await expect(button("What is Yosegi?")).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(button("Can I change the colours?"));
    await expect(button("Can I change the colours?")).toHaveAttribute("aria-expanded", "false");

    await expect(button("Can items be locked?")).toBeDisabled();
  },
};

/** Test: with multiple, sections open and close on their own. */
export const SeveralOpenTest: Story = {
  name: "Several open (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Accordion multiple defaultValue={["what"]} sections={faq} />,
  play: async ({ canvas, userEvent }) => {
    const button = (name: string) => canvas.getByRole("button", { name });
    await userEvent.click(button("Which parts can I style?"));
    await expect(button("What is Yosegi?")).toHaveAttribute("aria-expanded", "true");
    await expect(button("Which parts can I style?")).toHaveAttribute("aria-expanded", "true");
  },
};

/** Test: without collapsible, the open section stays open on a second click. */
export const AlwaysOneOpenTest: Story = {
  name: "Always one open (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Accordion defaultValue={["parts"]} sections={faq} />,
  play: async ({ canvas, userEvent }) => {
    const parts = canvas.getByRole("button", { name: "Which parts can I style?" });
    await userEvent.click(parts);
    await expect(parts).toHaveAttribute("aria-expanded", "true");
  },
};
