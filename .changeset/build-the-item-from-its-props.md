---
"yosegi": minor
---

Item builds itself when it has a `title`: `<Item media={<ShieldIcon />} mediaVariant="icon" title="New sign-in" description="…" actions={<Button label="Review" size="sm" />} />`.

- `media` (framed by `mediaVariant`, as on `Item.Media`), `title`, `description` and `actions` make the row, with any children after the content. Variants, sizes, `as`, `selected` and `disabled` work as before.
- `title` is now the row's title, not the HTML title attribute.
- Without a `title`, put the parts together as before, as for a row with `Item.Header` and `Item.Footer`.
