---
"yosegi": minor
---

Popover builds itself when it has a `trigger`: `<Popover trigger={{ label: "Share", icon: <ShareIcon /> }} title="Share note" description="…" footer={…}>{body}</Popover>`.

- `trigger` takes text, or a Button's props (`ButtonTriggerProps`: everything but `as` and `aria-pressed`), and renders an outline Button by default that says it's open with `aria-expanded` and `aria-controls` and gets focus back on close. For any other element, put the parts together.
- `field` takes a TextField's props and renders it under the description: `field={{ label: "Link", readOnly: true, defaultValue: url }}`.
- `title`, `description` and `footer` fill the panel around the children, and `arrow={false}` and `closeButton={false}` leave those out. `class` and `style` go to the panel, so `--yosegi-popover-width` still works.
- Without a `trigger`, put the parts together as before. `Popover.Header` holds the title and close button on one line, and `Popover.Footer` holds buttons on the end side. The `yosegi-popover-header` class is now the stable class of `Popover.Header`, so a plain `<div class="yosegi-popover-header">` no longer gets its layout.
- `Popover.Arrow` and `Tooltip.Arrow` no longer take `size`, which did nothing.
