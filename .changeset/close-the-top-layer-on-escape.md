---
"yosegi": patch
---

Escape closes only the layer that opened last, like a tooltip over a popover. Before, the layer that opened first took it, so a tooltip held open with `open` kept Escape from every other layer.
