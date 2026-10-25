# yosegi-solid

## 0.2.1

### Patch Changes

- e93afe8: drop some links from readme and add some links for metadata

## 0.2.0

### Minor Changes

- a1dc50a: add kbd component and readme file

## 0.1.1

### Patch Changes

- 0ca8ca8: changed the package name from yosegi to yosegi-solid

## 0.1.0

### Minor Changes

- 3f4af6e: `LocaleProvider` sets the locale and labels for every component inside it, once, near the root of the app: `<LocaleProvider locale="de-DE" labels={{ pagination: { next: "Weiter" }, table: { rowsPerPage: "Zeilen pro Seite" } }}>`.
  
  - `labels` is a `LocaleLabels`: each component's labels under its name, `combobox`, `datePicker`, `dialog`, `filter`, `numberField`, `pagination`, `popover`, `table` and `toaster`, as its own `labels` prop takes them.
  - A component's own `locale` and `labels` still win, label by label. Then the nearest provider's, then English: the en-US locale and the English labels.
  - A provider inside another changes only what it sets, and Table's `filter` and `pagination` labels merge the same way.
- 91e2e58: Add the first components: Button, ButtonGroup, Spinner, TextField, NumberField, DatePicker, Checkbox, Combobox, Command, Accordion, Tabs, Tooltip, Popover, Dialog, Toast (with `toast()` and `<Toaster />`), Table, Item, Separator, NotFound, ErrorState and EmptyState. Each renders a stable `yosegi-{component}-{part}` class next to yours and exposes its state as `data-*` attributes. Component styles are SCSS modules, so apps that compile Yosegi from source need `sass-embedded`.
  
  Export the icon set: 24 outline icons such as `PlusIcon` and `ChevronDownIcon`, drawn in `currentColor` at 16px by default, taking any SVG attribute. Button takes `download` for links to files.
- e039bad: Add design tokens, light and dark themes, fonts and global styles. Import `yosegi-solid/styles.css` once at your app's entry, or `yosegi-solid/tokens.css` for the tokens alone. Every token is a `--yosegi-*` custom property you can override in your own CSS, and `data-yosegi-theme` forces a theme. Red Hat Mono and Red Hat Text are self-hosted through `yosegi-solid/fonts.css`.
- 46e3ea9: Accordion builds itself when it has `sections`: `<Accordion sections={[{ value: "what", title: "What is Yosegi?", content: "…" }]} />`.
  
  - Each section is an `AccordionSection`: `value`, `title` (text or any JSX), `content` and `disabled`. `titleAs` changes every heading's element, h3 by default.
  - `value`, `defaultValue`, `onChange`, `multiple` and `collapsible` work as before, and so do the keyboard and the open and close animation.
  - Without `sections`, put the parts together as before.
- b0fb914: Command builds itself when it has `items`: `<Command items={[{ value: "New note", icon: <PlusIcon />, shortcut: "⌘N", group: "Notes" }]} onSelect={run} />`.
  
  - Each item is a `CommandAction`: `value`, `label` (the value by default), `icon`, `keywords`, `shortcut`, `group`, `disabled` and its own `onSelect`. Items with a `group` sit under its heading, as Select's options do, with a line between groups.
  - `placeholder` and `empty` set the search's placeholder and the text when nothing matches. `onSelect` runs for any item. `Command.Dialog` takes the same props.
  - Without `items`, put the parts together as before.
- 6e893a5: Dialog builds itself when it has a `trigger` or a `title`: `<Dialog trigger="Rename" title="Rename project" footer={…}>{fields}</Dialog>`.
  
  - `trigger` works as on Popover: text, or a Button's props like `{ label: "Delete", variant: "danger", icon: <TrashIcon /> }`, for an outline Button by default. Leave it out and open the dialog with `open` and `onOpenChange`, say from a row action; a `title` alone is enough to build it. Popover still needs a `trigger`, since it has nothing else to sit next to.
  - `title`, `description` and `footer` fill the window around the children, and `closeButton={false}` leaves out the ×. `role="alertdialog"` keeps a click outside from closing it. `class` and `style` go to the window, and the overlay shows while it's modal.
  - Without a trigger or a title, put the parts together as before.
  - The × stays on the end side when there is no title.
- 837bfd0: EmptyState builds itself when it has a `title`: `<EmptyState icon={<InboxIcon />} title="No notes yet" description="…" actions={<Button label="New note" />} />`.
  
  - `icon`, `title`, `description` and `actions` fill it in that order, with any children after the description. `titleAs` changes the heading's element, h2 by default.
  - `title` is now the heading, not the HTML title attribute.
  - Without a `title`, put the parts together as before.
- d9d2701: ErrorState builds itself when it has a `title`: `<ErrorState icon={<WarningIcon />} title="Something went wrong" description="…" detail="Error 503 · ref 8f2c" actions={…} />`.
  
  - `icon`, `title`, `description`, `detail` and `actions` fill it in that order, with any children after the description. `titleAs` changes the heading's element, h2 by default. It still renders `role="alert"`.
  - `title` is now the heading, not the HTML title attribute.
  - Without a `title`, put the parts together as before.
- 66e30f7: Filter builds itself when it has `sections`: `<Filter sections={[{ name: "status", title: "Status", options: [{ value: "paid", label: "Paid", count: 12 }] }, { name: "amount", title: "Amount", type: "range", format }]} />`.
  
  - Each section is a `FilterSection`: a `name` and `title`, then either `options` (each a `FilterSectionOption` with `value`, `label`, `count` and `disabled`) or `type: "range"` with `format`, `placeholderFrom` and `placeholderTo`.
  - It builds the Filter button, the chips and the panel, whose heading is `title` (“Filters” by default). `value`, `onChange`, `resultCount` and `noun` work as before.
  - Without `sections`, put the parts together as before.
- 890ae16: Item builds itself when it has a `title`: `<Item media={<ShieldIcon />} mediaVariant="icon" title="New sign-in" description="…" actions={<Button label="Review" size="sm" />} />`.
  
  - `media` (framed by `mediaVariant`, as on `Item.Media`), `title`, `description` and `actions` make the row, with any children after the content. Variants, sizes, `as`, `selected` and `disabled` work as before.
  - `title` is now the row's title, not the HTML title attribute.
  - Without a `title`, put the parts together as before, as for a row with `Item.Header` and `Item.Footer`.
- 3dee5ca: NotFound builds itself when it has a `title`: `<NotFound code="404" title="Page not found" description="…" actions={…} />`.
  
  - `code`, `title`, `description` and `actions` fill it in that order, with any children after the description. `titleAs` changes the heading's element, h1 by default.
  - `--yosegi-not-found-code-size` sets the size of the code, 72px by default.
  - `title` is now the heading, not the HTML title attribute.
  - Without a `title`, put the parts together as before.
- 6e893a5: Popover builds itself when it has a `trigger`: `<Popover trigger={{ label: "Share", icon: <ShareIcon /> }} title="Share note" description="…" footer={…}>{body}</Popover>`.
  
  - `trigger` takes text, or a Button's props (`ButtonTriggerProps`: everything but `as` and `aria-pressed`), and renders an outline Button by default that says it's open with `aria-expanded` and `aria-controls` and gets focus back on close. For any other element, put the parts together.
  - `field` takes a TextField's props and renders it under the description: `field={{ label: "Link", readOnly: true, defaultValue: url }}`.
  - `title`, `description` and `footer` fill the panel around the children, and `arrow={false}` and `closeButton={false}` leave those out. `class` and `style` go to the panel, so `--yosegi-popover-width` still works.
  - Without a `trigger`, put the parts together as before. `Popover.Header` holds the title and close button on one line, and `Popover.Footer` holds buttons on the end side. The `yosegi-popover-header` class is now the stable class of `Popover.Header`, so a plain `<div class="yosegi-popover-header">` no longer gets its layout.
  - `Popover.Arrow` and `Tooltip.Arrow` no longer take `size`, which did nothing.
- 0fbccd9: Tabs builds itself when it has `tabs`: `<Tabs aria-label="Notes" tabs={[{ value: "all", label: "All", count: 12, content: … }]} />`.
  
  - Each tab is a `TabsItem`: `value`, `label` (text or any JSX), `count` for the number after the label, `disabled`, and `content` for its panel.
  - `aria-label` names the tab list. `value`, `defaultValue`, `onChange`, `orientation` and `activationMode` work as before, and the first enabled tab still starts selected.
  - Without `tabs`, put the parts together as before.
- 2ad349d: Tooltip builds itself when it has a `trigger`: `<Tooltip trigger="Archive" content="Move to the archive" />`.
  
  - `trigger` works as on Popover and Dialog: text, or a Button's props like `{ icon: <PlusIcon />, variant: "ghost", "aria-label": "New note" }`, for an outline Button by default.
  - `content` is the text, and `arrow={false}` leaves out the arrow. `class` and `style` go to the content. `open`, `placement`, `openDelay`, `closeDelay`, `gutter` and `disabled` work as before.
  - Without a `trigger`, put the parts together as before.
- 4d9c358: Components are in English (en-US) until you set a locale, on the component or on a `LocaleProvider`. Before, DatePicker, NumberField and Table wrote dates and numbers in the visitor's browser language next to English labels, and a page rendered on a server could disagree with the browser.
  
  - Combobox, Select and Command match typed letters in the provider's locale too, so a browser in Turkish or Azerbaijani no longer changes how “I” matches.
  - `applyTableQuery` and the table's search and sort use en-US when no locale is given.
- f655cbb: Follow the design system for Select, Combobox and Table, and add Pagination and Filter.
  
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
- 37bd2a2: Button takes its text as `label`: `<Button label="Save" variant="outline" />`. Children still work the same way, so `<Button>Save</Button>` is unchanged. The components and playground now use `label`.
- 97d2f74: Table takes a `locale`, for its dates, numbers, search and sort: `<Table data={invoices} columns={columns} locale="de-DE" />`. English (en-US) is the default.
  
  - `Table.Range` and `Filter` take `locale` too. A Filter range reads and shows typed numbers in the locale's marks, so “1234,5” is 1234.5 in German.
  - `applyTableQuery(data, columns, query, pageSize, locale)` takes the same locale, so a server searches and sorts the cells as people see them.
- 100bcc2: The text components write themselves can now be changed, for another language, through a `labels` prop. Give only the labels you change; the rest stay in English. Text that already had a prop keeps it: `aria-label` names Toaster's region and Pagination's list, and Combobox keeps `loadingText`, `errorText`, `searchPlaceholder` and `emptyText`.
  
  - `Table` takes `TableLabels`, like `rowsPerPage`, `range` and `noMatches`, with `filter` and `pagination` for the Filter and Pagination inside it: `<Table labels={{ rowsPerPage: "Zeilen pro Seite", pagination: { next: "Weiter" } }} />`. `Table.Range` and `Table.PageSize` take the labels they use.
  - `Filter` takes `FilterLabels`, `Combobox` `ComboboxLabels`, `Pagination` `PaginationLabels`, `DatePicker` `DatePickerLabels`, `NumberField` `NumberFieldLabels`, `Dialog` `DialogLabels`, `Popover` `PopoverLabels` and `Toaster` `ToasterLabels`. Each type is exported.
  - Labels with a count or a name are functions, like `chosen: (count) => …`, so each language can place the number and say its own plural. Table's `selected` and `selectedOf` get the count as a number and as text written in its `locale`.
  - A Filter range chip writes a number in the Filter's `locale` when its section has no `format`.
  - A Table row's checkbox is now named after its first cell, “Select INV-1042”, not its id.
  - The Filter panel's footer wraps when its labels are too long for one line, keeping Show on the end side.

### Patch Changes

- ed52ff8: Escape closes only the layer that opened last, like a tooltip over a popover. Before, the layer that opened first took it, so a tooltip held open with `open` kept Escape from every other layer.
- 0357bcd: Accordion content no longer shows one frame without its closing animation. Whether it's closing or hidden now follows from the open state in the same update, instead of being set by an effect one update later.
- 5250871: Touch, scrolling and focus follow the web interface guidelines more closely.
  
  - Taps act at once: buttons, links, inputs and anything focusable get `touch-action: manipulation`, and the grey tap flash is gone, since controls draw their own states.
  - Scrolling inside Dialog, the Filter panel, Select, Combobox, Command and a scrolling Table stops at their ends instead of moving the page behind them. The `scroll-y` mixin does it.
  - Toasts and the Filter panel keep clear of a phone's notch and home bar.
  - In a Table with `height` or `maxHeight`, a row that takes focus scrolls to just below the headings, not under them.
  - A Checkbox has no dead strip between its box and its label.
  - An inline Command shows a focus ring around its box while its input has keyboard focus.
