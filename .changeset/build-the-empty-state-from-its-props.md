---
"yosegi": minor
---

EmptyState builds itself when it has a `title`: `<EmptyState icon={<InboxIcon />} title="No notes yet" description="…" actions={<Button label="New note" />} />`.

- `icon`, `title`, `description` and `actions` fill it in that order, with any children after the description. `titleAs` changes the heading's element, h2 by default.
- `title` is now the heading, not the HTML title attribute.
- Without a `title`, put the parts together as before.
