---
"yosegi": minor
---

`LocaleProvider` sets the locale and labels for every component inside it, once, near the root of the app: `<LocaleProvider locale="de-DE" labels={{ pagination: { next: "Weiter" }, table: { rowsPerPage: "Zeilen pro Seite" } }}>`.

- `labels` is a `LocaleLabels`: each component's labels under its name, `combobox`, `datePicker`, `dialog`, `filter`, `numberField`, `pagination`, `popover`, `table` and `toaster`, as its own `labels` prop takes them.
- A component's own `locale` and `labels` still win, label by label. Then the nearest provider's, then English: the en-US locale and the English labels.
- A provider inside another changes only what it sets, and Table's `filter` and `pagination` labels merge the same way.
