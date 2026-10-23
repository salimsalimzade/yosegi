---
"yosegi": minor
---

ErrorState builds itself when it has a `title`: `<ErrorState icon={<WarningIcon />} title="Something went wrong" description="…" detail="Error 503 · ref 8f2c" actions={…} />`.

- `icon`, `title`, `description`, `detail` and `actions` fill it in that order, with any children after the description. `titleAs` changes the heading's element, h2 by default. It still renders `role="alert"`.
- `title` is now the heading, not the HTML title attribute.
- Without a `title`, put the parts together as before.
