import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Accordion, type AccordionSection } from "yosegi";

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
