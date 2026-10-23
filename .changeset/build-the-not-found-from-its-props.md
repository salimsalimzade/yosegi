---
"yosegi": minor
---

NotFound builds itself when it has a `title`: `<NotFound code="404" title="Page not found" description="…" actions={…} />`.

- `code`, `title`, `description` and `actions` fill it in that order, with any children after the description. `titleAs` changes the heading's element, h1 by default.
- `--yosegi-not-found-code-size` sets the size of the code, 72px by default.
- `title` is now the heading, not the HTML title attribute.
- Without a `title`, put the parts together as before.
