---
"yosegi": minor
---

Every word a component writes itself can now be changed, for another language, through a `labels` prop. Give only the ones you change; the rest stay in English.

- `Table` takes `TableLabels`, like `rowsPerPage`, `range` and `noMatches`, with `filter` and `pagination` for the Filter and Pagination inside it: `<Table labels={{ rowsPerPage: "Zeilen pro Seite", pagination: { next: "Weiter" } }} />`. `Table.Range` and `Table.PageSize` take the labels they use.
- `Filter` takes `FilterLabels`, `Combobox` `ComboboxLabels`, `Pagination` `PaginationLabels`, `DatePicker` `DatePickerLabels`, `NumberField` `NumberFieldLabels`, `Dialog` `DialogLabels`, `Popover` `PopoverLabels` and `Toaster` `ToasterLabels`. Each type is exported.
- Labels with a count or a name are functions, like `chosen: (count) => …`, so each language can place the number and say its own plural. Table passes its counts already written in its `locale`.
- A Table row's checkbox is now named after its first cell, “Select INV-1042”, not its id.
- The Filter panel's footer wraps when its labels are too long for one line, keeping Show on the end side.
