---
"yosegi": minor
---

Tabs builds itself when it has `tabs`: `<Tabs aria-label="Notes" tabs={[{ value: "all", label: "All", count: 12, content: … }]} />`.

- Each tab is a `TabsItem`: `value`, `label` (text or any JSX), `count` for the number after the label, `disabled`, and `content` for its panel.
- `aria-label` names the tab list. `value`, `defaultValue`, `onChange`, `orientation` and `activationMode` work as before, and the first enabled tab still starts selected.
- Without `tabs`, put the parts together as before.
