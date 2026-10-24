---
"yosegi": minor
---

Components are in English (en-US) until you set a locale, on the component or on a `LocaleProvider`. Before, DatePicker, NumberField and Table wrote dates and numbers in the visitor's browser language next to English labels, and a page rendered on a server could disagree with the browser.

- Combobox, Select and Command match typed letters in the provider's locale too, so a browser in Turkish or Azerbaijani no longer changes how “I” matches.
- `applyTableQuery` and the table's search and sort use en-US when no locale is given.
