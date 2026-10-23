---
"yosegi": minor
---

Accordion builds itself when it has `sections`: `<Accordion sections={[{ value: "what", title: "What is Yosegi?", content: "…" }]} />`.

- Each section is an `AccordionSection`: `value`, `title` (text or any JSX), `content` and `disabled`. `titleAs` changes every heading's element, h3 by default.
- `value`, `defaultValue`, `onChange`, `multiple` and `collapsible` work as before, and so do the keyboard and the open and close animation.
- Without `sections`, put the parts together as before.
