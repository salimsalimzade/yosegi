# CLAUDE.md

## File and folder names

- Use lowercase for every file and folder name.
- Separate words with a dash (kebab-case). Don't use camelCase, PascalCase, underscores or spaces.
- This applies to names only. Identifiers inside the code keep their usual casing, so the `DatePicker` component lives in `date-picker.tsx`.
- Dots are only for suffixes and extensions, as in `vite.config.ts` or `tsconfig.build.json`.

| Good | Bad |
| --- | --- |
| `date-picker.tsx` | `DatePicker.tsx`, `datePicker.tsx`, `date_picker.tsx` |
| `not-found.tsx` | `NotFound.tsx`, `not_found.tsx` |
| `use-media-query.ts` | `useMediaQuery.ts` |
| `form-field/` | `FormField/`, `form_field/` |

Exceptions are the standard uppercase files that tools look for by name: `README.md`, `LICENSE`, `CHANGELOG.md` and `CLAUDE.md`.
