import { omit } from "solid-js";
import { Accordion, type AccordionProps } from "yosegi";
import { Case, Cases } from "../ui/case";

const faq = [
  { value: "what", q: "What is Yosegi?", a: "A small design system for SolidJS. Plain pieces, one accent colour, and parts you can style however you like." },
  { value: "colours", q: "Can I change the colours?", a: "Yes. Set a system token such as --yosegi-color-bg-accent, or a component knob such as --yosegi-accordion-border." },
  { value: "kobalte", q: "Does it follow Kobalte?", a: "The parts and data attributes match Kobalte: Accordion, Item, Header, Trigger and Content." },
];

function Faq(props: AccordionProps & { locked?: boolean }) {
  return (
    <Accordion {...omit(props, "locked")} style={{ width: "100%", "max-width": "560px" }}>
      {faq.map((item) => (
        <Accordion.Item value={item.value}>
          <Accordion.Header>
            <Accordion.Trigger>{item.q}</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <p>{item.a}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
      {props.locked && (
        <Accordion.Item value="locked" disabled>
          <Accordion.Header>
            <Accordion.Trigger>Can items be locked?</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <p>This one is disabled, so it cannot be opened.</p>
          </Accordion.Content>
        </Accordion.Item>
      )}
    </Accordion>
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
