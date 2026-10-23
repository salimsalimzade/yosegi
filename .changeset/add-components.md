---
"yosegi": minor
---

Add the first components: Button, ButtonGroup, Spinner, TextField, NumberField, DatePicker, Checkbox, Combobox, Command, Accordion, Tabs, Tooltip, Popover, Dialog, Toast (with `toast()` and `<Toaster />`), Table, Item, Separator, NotFound, ErrorState and EmptyState. Each renders a stable `yosegi-{component}-{part}` class next to yours and exposes its state as `data-*` attributes. Component styles are SCSS modules, so apps that compile Yosegi from source need `sass-embedded`.

Export the icon set: 24 outline icons such as `PlusIcon` and `ChevronDownIcon`, drawn in `currentColor` at 16px by default, taking any SVG attribute. Button takes `download` for links to files.
