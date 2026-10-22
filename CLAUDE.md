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

## Styles

- Global styles live in `packages/ui/src/styles/`. `fonts.css` declares the fonts, whose woff2 files and licence live in `packages/ui/src/fonts/`, `tokens.css` holds the design tokens and themes, `global.css` holds the reset and base layers, and `index.css` loads all three.
- The cascade layers are `yosegi.reset, yosegi.tokens, yosegi.base, yosegi.components`. Every entry file starts with that `@layer` statement, so the order holds whichever file loads first.
- Components use system tokens (`--yosegi-color-*`), never the palette (`--yosegi-green-700`).
- Each component gets its own CSS module, named after the component file: `button.tsx` is styled by `button.module.css`, in the same folder.
- Write class names in camelCase (`.root`, `.iconStart`) so they read as `styles.iconStart` in the component.
- Wrap every rule of a component's CSS module in `@layer yosegi.components { … }`, so the app's own CSS can always override it.
- Use the `--yosegi-*` tokens instead of hardcoded values. If a value is missing, add a token to `tokens.css` first.
- Never import global CSS from `src/index.ts`. Apps opt in with `import "yosegi/styles.css"`.
