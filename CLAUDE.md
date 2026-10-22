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
- Each component lives in its own folder, `packages/ui/src/components/<name>/`, and gets its own SCSS module named after the component file: `button.tsx` is styled by `button.module.scss`, in the same folder.
- Write module class names in lowercase, with dashes between words (`.root`, `.error-message`), and read them as `styles.root` or `styles["error-message"]`.
- Every part also renders its stable public class, `yosegi-{component}-{part}`, next to the module class and the app's class. States are `data-*` attributes. To style another component from a module, target its stable class with `:global(.yosegi-button)`.
- Start every module with `@use "../../styles/sass" as *;` and wrap its rules in `@include component { … }`. That mixin writes the layer order and puts the rules in `yosegi.components`, so the app's own CSS can always override them.
- Shared patterns belong in the Sass toolkit, `packages/ui/src/styles/sass/`: token functions (`space(300)`, `color(fg-muted)`, `knob(button, radius, …)`) in `functions.scss`, mixins in `mixins.scss`. Add a mixin when a pattern appears in a second component.
- Use the `--yosegi-*` tokens instead of hardcoded values. If a value is missing, add a token to `tokens.css` first.

## Components

- Behaviour is written by hand (Kobalte supports Solid 1 only). Shared pieces live in `packages/ui/src/primitives/`: controlled state, field wiring, positioning (`@floating-ui/dom`), dismissal, focus and icons. The icons in `primitives/icons.tsx` are public too: `index.ts` exports them, and each matches a file in `apps/playground/public/icons/` and in the design system's Icons group, so a new icon goes in all three.
- The API follows the design system's `index.d.ts`: a root that holds state and parts on it, such as `Tooltip.Trigger`.
- Pass `children` explicitly rather than through a props spread, and never call `onSettled` inside a `ref` callback.
- A prop that holds JSX (`children`, `icon`) creates its elements every time it's read. Resolve it once with `children(() => props.icon)` and read that.
- Run `pnpm dev:playground` to try components. The playground mirrors the design system: `apps/playground/src/catalog.ts` lists each component under its group, and `apps/playground/src/cases/<name>.tsx` shows its cases, each in its own `<Case>`. A new component gets an entry and a cases file. Its page is at `/playground/<slug>`; `/` is the site's empty front page.
- Never import global CSS from `src/index.ts`. Apps opt in with `import "yosegi/styles.css"`.
