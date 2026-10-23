---
"yosegi": minor
---

Follow the design system for Select, Combobox and Table, and add Pagination and Filter.

- Select: `Select.Trigger` holds `Select.Value` (with its `placeholder`) and the chevron; `Select.Content` renders `Select.Listbox`, which takes a render function. Options can have a `group`, shown under its heading. Read-only boxes are muted, with no chevron.
- Combobox is now the search select: a box that opens a list with a search row at the top (`Combobox.Search`). With `multiple` it picks several, shown as `Combobox.Chips` in a `Combobox.Control` that never grows, with a `+N` counter for the rest. It also takes `max`, `clearable`, `onCreate`, and for searching on a server `onInputChange`, `minQueryLength`, `loading`, `error`, `onRetry` and `hint`. The typed input (`Combobox.Input`) is gone: search only happens in the panel.
- Table builds the whole box from `data` and `columns`. A column names the field it reads (`key`, or `value` for a computed one), its `label`, and how it shows: `format` for the text, `cell` to render it with icons or anything else. `sortable`, `filter` (options or a range, listed in Filter with counts) and `searchable` are per column. The table takes `rowKey`, `pageSize`, `selectable` with `selectionActions`, `onRowClick`, `rowHref`, `title`, `description`, `actions` and `empty`, and its `query` (search, filters, sort, page) can be controlled. With `manual`, a server does the work: pass the page as `data`, `rowCount` and `loading`, and listen to `onQueryChange`. `applyTableQuery` runs the same steps on an array.
- Table gains the box: `Table.Box`, `TopBar`, `Title`, `Description`, `Actions`, `Toolbar`, `SelectionBar`, `Empty`, `BottomBar` and `Range`, and `selection` on `Head` and `Cell` for a checkbox column.
- Rows per page: `Table.PageSize` (10 by default; 20, 50, 100) sits with the range in `Table.BottomBar`. Changing it keeps the first row on screen, and in a table box narrower than 640px, Previous and Next keep only their arrows.
- `TextField.Icon`: a 16px icon before the input, like the search glass.
- Pagination: numbered pages with “…” gaps, Previous and Next.
- Filter: a Filter button and a side panel of option and range sections; Show applies them together and each active filter becomes a chip.
- `FilterIcon` joins the icon set.
- Icons are generated: `pnpm generate` turns each SVG in `packages/ui/src/icons/` into a component, cleaning it with SVGO and turning fixed colours into `currentColor`. The 25 icons draw exactly as before.
- TextField, NumberField, Select, Combobox, DatePicker and Checkbox build themselves when they have no children: `<Select label="Status" placeholder="Choose a status" description="…" errorMessage={error} options={…} />`. Pass the parts as children to arrange them yourself. TextField also takes `icon`, `multiline`, `type` and `autocomplete`, and shows a Spinner while `loading`; Combobox takes `searchPlaceholder` and `emptyText`, and Select and Combobox take `renderOption` to draw each row.
- Select and Combobox take your own option objects: `getOptionValue`, `getOptionLabel`, `getOptionGroup` and `getOptionDisabled` read them, and each defaults to the field of the same name, so `{ value, label }` options need none. `value` stays the id; `onChange` also gets the picked object (`onChange(id, customer)`, or `(ids, customers)` with `multiple`), and `filter` and `renderOption` get your objects too. Without a label, `aria-label` names the control.
- `errorMessage` on any field marks it invalid while it's set, and an `ErrorMessage` part with no children shows it. `validationState="valid"` still wins.
- Table takes `pageSizeOptions` for Rows per page (10, 20, 50 and 100 by default), and `height` or `maxHeight` to scroll the rows under headings that stay put. The query carries `pageSize`.
