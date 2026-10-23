---
"yosegi": minor
---

Dialog builds itself when it has a `trigger` or a `title`: `<Dialog trigger="Rename" title="Rename project" footer={…}>{fields}</Dialog>`.

- `trigger` works as on Popover: text, or a Button's props like `{ label: "Delete", variant: "danger", icon: <TrashIcon /> }`, for an outline Button by default. Leave it out and open the dialog with `open` and `onOpenChange`, say from a row action; a `title` alone is enough to build it. Popover still needs a `trigger`, since it has nothing else to sit next to.
- `title`, `description` and `footer` fill the window around the children, and `closeButton={false}` leaves out the ×. `role="alertdialog"` keeps a click outside from closing it. `class` and `style` go to the window, and the overlay shows while it's modal.
- Without a trigger or a title, put the parts together as before.
- The × stays on the end side when there is no title.
