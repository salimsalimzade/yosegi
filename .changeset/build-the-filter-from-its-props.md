---
"yosegi": minor
---

Filter builds itself when it has `sections`: `<Filter sections={[{ name: "status", title: "Status", options: [{ value: "paid", label: "Paid", count: 12 }] }, { name: "amount", title: "Amount", type: "range", format }]} />`.

- Each section is a `FilterSection`: a `name` and `title`, then either `options` (each a `FilterSectionOption` with `value`, `label`, `count` and `disabled`) or `type: "range"` with `format`, `placeholderFrom` and `placeholderTo`.
- It builds the Filter button, the chips and the panel, whose heading is `title` (“Filters” by default). `value`, `onChange`, `resultCount` and `noun` work as before.
- Without `sections`, put the parts together as before.
