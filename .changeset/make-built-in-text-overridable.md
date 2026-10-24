---
"yosegi": minor
---

The text components write themselves can now be changed, for another language, through a `labels` prop. Give only the labels you change; the rest stay in English. Text that already had a prop keeps it: `aria-label` names Toaster's region and Pagination's list, and Combobox keeps `loadingText`, `errorText`, `searchPlaceholder` and `emptyText`.

- `Table` takes `TableLabels`, like `rowsPerPage`, `range` and `noMatches`, with `filter` and `pagination` for the Filter and Pagination inside it: `<Table labels={{ rowsPerPage: "Zeilen pro Seite", pagination: { next: "Weiter" } }} />`. `Table.Range` and `Table.PageSize` take the labels they use.
- `Filter` takes `FilterLabels`, `Combobox` `ComboboxLabels`, `Pagination` `PaginationLabels`, `DatePicker` `DatePickerLabels`, `NumberField` `NumberFieldLabels`, `Dialog` `DialogLabels`, `Popover` `PopoverLabels` and `Toaster` `ToasterLabels`. Each type is exported.
- Labels with a count or a name are functions, like `chosen: (count) => …`, so each language can place the number and say its own plural. Table's `selected` and `selectedOf` get the count as a number and as text written in its `locale`.
- A Filter range chip writes a number in the Filter's `locale` when its section has no `format`.
- A Table row's checkbox is now named after its first cell, “Select INV-1042”, not its id.
- The Filter panel's footer wraps when its labels are too long for one line, keeping Show on the end side.
