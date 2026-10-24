---
"yosegi": minor
---

Table takes a `locale`, for its dates, numbers, search and sort: `<Table data={invoices} columns={columns} locale="de-DE" />`. English (en-US) is the default.

- `Table.Range` and `Filter` take `locale` too. A Filter range reads and shows typed numbers in the locale's marks, so “1234,5” is 1234.5 in German.
- `applyTableQuery(data, columns, query, pageSize, locale)` takes the same locale, so a server searches and sorts the cells as people see them.
