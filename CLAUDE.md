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
- Each component lives in its own folder, `packages/ui/src/components/<name>/`, and gets its own SCSS module named after the component file: `button.tsx` is styled by `button.module.scss`, in the same folder. The one exception is the table family: Pagination and Filter live next to Table in `components/table/` (`pagination.tsx`, `filter.tsx`), each with its own module.
- Write module class names in lowercase, with dashes between words (`.root`, `.error-message`), and read them as `styles.root` or `styles["error-message"]`.
- Every part also renders its stable public class, `yosegi-{component}-{part}`, next to the module class and the app's class. States are `data-*` attributes. To style another component from a module, target its stable class with `:global(.yosegi-button)`.
- Start every module with `@use "../../styles/sass" as *;` and wrap its rules in `@include component { … }`. That mixin writes the layer order and puts the rules in `yosegi.components`, so the app's own CSS can always override them.
- Shared patterns belong in the Sass toolkit, `packages/ui/src/styles/sass/`: token functions (`space(300)`, `color(fg-muted)`, `knob(button, radius, …)`) in `functions.scss`, mixins in `mixins.scss`. Add a mixin when a pattern appears in a second component.
- Use the `--yosegi-*` tokens instead of hardcoded values. If a value is missing, add a token to `tokens.css` first.

## Components

- Behaviour is written by hand. Shared pieces live in `packages/ui/src/primitives/`: controlled state, field wiring, positioning (`@floating-ui/dom`), dismissal, focus and icons. Icons start as SVGs in `packages/ui/src/icons/`, one per file, named like `search-off.svg` and matching the design system's Icons group. `pnpm generate` cleans them with SVGO and writes `primitives/icons.tsx` (`SearchOffIcon`) and the playground's `public/icons/`, so never edit those by hand. `index.ts` exports every icon, and `pnpm build` fails while they are out of date. Icons can't use ids (masks, gradients): draw them with strokes and fills in `currentColor`.
- The API follows the design system's `index.d.ts`: a root that holds state and parts on it, such as `Tooltip.Trigger`.
- Pass `children` explicitly rather than through a props spread, and never call `onSettled` inside a `ref` callback.
- A prop that holds JSX (`children`, `icon`) creates its elements every time it's read. Resolve it once with `children(() => props.icon)` and read that.
- Run `pnpm dev:storybook` to try components, at port 6006. The Storybook lives in `apps/playground`, with its config in `.storybook/`, and builds with that app's Vite config. Its sidebar mirrors the design system's groups. Each component gets `apps/playground/src/stories/<name>.stories.tsx`, titled `<Group>/<Name>`: a `Playground` story with the props on controls, then one story per case, each with a JSDoc saying what it shows. Write each story's JSX in full, since it becomes the docs' "Show code". Keep rows, columns, sections and JSX out of `args`, because Storybook wraps args in a store. Pass them in `render` instead. Put fixtures the stories share in `apps/playground/src/ui/`.
- Never import global CSS from `src/index.ts`. Apps opt in with `import "yosegi-solid/styles.css"`.
