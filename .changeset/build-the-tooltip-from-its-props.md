---
"yosegi": minor
---

Tooltip builds itself when it has a `trigger`: `<Tooltip trigger="Archive" content="Move to the archive" />`.

- `trigger` works as on Popover and Dialog: text, or a Button's props like `{ icon: <PlusIcon />, variant: "ghost", "aria-label": "New note" }`, for an outline Button by default.
- `content` is the text, and `arrow={false}` leaves out the arrow. `class` and `style` go to the content. `open`, `placement`, `openDelay`, `closeDelay`, `gutter` and `disabled` work as before.
- Without a `trigger`, put the parts together as before.
