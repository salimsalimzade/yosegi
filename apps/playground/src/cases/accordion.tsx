import { omit } from "solid-js";
import { Accordion, type AccordionProps, type AccordionSection } from "yosegi";
import { Case, Cases } from "../ui/case";

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
    value: "kobalte",
    title: "Does it follow Kobalte?",
    content: "The parts and data attributes match Kobalte: Accordion, Item, Header, Trigger and Content.",
  },
];

const locked: AccordionSection = {
  value: "locked",
  title: "Can items be locked?",
  content: "This one is disabled, so it cannot be opened.",
  disabled: true,
};

function Faq(props: AccordionProps & { locked?: boolean }) {
  return (
    <Accordion
      {...omit(props, "locked")}
      style={{ width: "100%", "max-width": "560px" }}
      sections={props.locked ? [...faq, locked] : faq}
    />
  );
}

export function AccordionPage() {
  return (
    <>
      <Case title="One at a time" description="Opening one closes the other; ↑ ↓ move between headings." layout="fill">
        <Faq collapsible defaultValue={["what"]} locked />
      </Case>
      <Cases>
        <Case title="Several open" description="multiple lets any number stay open." layout="fill">
          <Faq multiple defaultValue={["what", "colours"]} />
        </Case>
        <Case title="Always one open" description="Without collapsible, the open item can't be closed." layout="fill">
          <Faq defaultValue={["kobalte"]} />
        </Case>
      </Cases>
    </>
  );
}
