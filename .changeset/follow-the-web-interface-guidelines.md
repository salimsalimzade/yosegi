---
"yosegi": patch
---

Touch, scrolling and focus follow the web interface guidelines more closely.

- Taps act at once: buttons, links, inputs and anything focusable get `touch-action: manipulation`, and the grey tap flash is gone, since controls draw their own states.
- Scrolling inside Dialog, the Filter panel, Select, Combobox, Command and a scrolling Table stops at their ends instead of moving the page behind them. The `scroll-y` mixin does it.
- Toasts and the Filter panel keep clear of a phone's notch and home bar.
- In a Table with `height` or `maxHeight`, a row that takes focus scrolls to just below the headings, not under them.
- A Checkbox has no dead strip between its box and its label.
- An inline Command shows a focus ring around its box while its input has keyboard focus.
