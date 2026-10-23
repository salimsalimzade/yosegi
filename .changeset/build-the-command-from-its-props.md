---
"yosegi": minor
---

Command builds itself when it has `items`: `<Command items={[{ value: "New note", icon: <PlusIcon />, shortcut: "⌘N", group: "Notes" }]} onSelect={run} />`.

- Each item is a `CommandAction`: `value`, `label` (the value by default), `icon`, `keywords`, `shortcut`, `group`, `disabled` and its own `onSelect`. Items with a `group` sit under its heading, as Select's options do, with a line between groups.
- `placeholder` and `empty` set the search's placeholder and the text when nothing matches. `onSelect` runs for any item. `Command.Dialog` takes the same props.
- Without `items`, put the parts together as before.
