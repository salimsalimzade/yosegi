# yosegi

Yosegi is my personal design system for SolidJS applications.

The name comes from yosegi-zaiku, a Japanese woodcraft where many small pieces of wood are fitted together into one pattern. That’s the idea here too: small, consistent components that fit together into one interface.

There are already plenty of great design systems out there. I built this one anyway, to learn how they really work and to have something that fits exactly how I build apps.

## Structure

This repo is a pnpm workspace built on SolidJS 2.

- `packages/ui`: the component library, published to npm as `yosegi`
- `apps/playground`: the Storybook, where every component is built, tried and documented
- `apps/web`: the website, a "Hello world" page for now

Apps use `yosegi` through `workspace:*`, so they compile the library's source directly. `pnpm publish` swaps in the `publishConfig.exports` that point at `dist/`.

## Developing

```sh
pnpm install
pnpm dev:storybook    # the Storybook, at http://localhost:6006
pnpm dev:web          # the website, at http://localhost:5174
pnpm dev              # both at once
pnpm generate         # icon components from packages/ui/src/icons/*.svg
pnpm build:storybook  # a static Storybook in apps/playground/dist
```

The Storybook is laid out like the design system: a sidebar grouped into Actions, Forms, Disclosure, Navigation, Overlays, Feedback and Layout, then Assets for the icons and Setup for LocaleProvider. Each component has a Docs page with its props, types and defaults, a Playground story with every prop on a control, and one story per case with its code to copy. The toolbar switches between the light and dark themes and between phone, tablet and desktop widths, and the Accessibility panel runs axe on each story. Changes to `packages/ui` show up as you save.

The stories are in `apps/playground/src/stories/`, and the config is in `apps/playground/.storybook/`. The Icons page has every icon to copy or download. To add one, put its SVG in `packages/ui/src/icons/` and run `pnpm generate`; **Assets › Icons › Adding an icon** has the steps and the rules.

## Components

Button, ButtonGroup, Spinner, TextField, NumberField, DatePicker, Checkbox, Select, Combobox, Filter, Command, Accordion, Tabs, Pagination, Tooltip, Popover, Dialog, Toast, Table, Item, Separator, NotFound, ErrorState, EmptyState and LocaleProvider.

Each one is a root that holds state, with its parts on it:

```tsx
import { TextField } from "yosegi";

<TextField validationState={error() ? "invalid" : "valid"}>
  <TextField.Label>Project name</TextField.Label>
  <TextField.Input />
  <TextField.Description>You can change it later.</TextField.Description>
  <TextField.ErrorMessage>Give the project a name.</TextField.ErrorMessage>
</TextField>
```

Toasts need one `<Toaster />` near the root of the app; then call `toast("Saved")`, `toast.success(…)`, `toast.error(…)` or `toast.promise(…)` from anywhere.

Every part renders a stable class, `yosegi-{component}-{part}`, next to any `class` you pass, and shows its state as `data-*` attributes (`data-expanded`, `data-invalid`, …). To restyle a component, set its `--yosegi-{component}-*` knobs or target those classes and attributes.

Component styles are SCSS modules, so an app that compiles Yosegi from source needs `sass-embedded` installed.

## Locale and labels

Everything is in English (en-US) until you say otherwise.

Dates and numbers come from the browser's built-in `Intl`, so a `locale` changes month and day names, number marks and how typed dates and numbers are read. DatePicker, NumberField, Table and Filter take one:

```tsx
<DatePicker label="Lieferung" locale="de-DE" />
```

The words components write themselves, like “Choose a date” or “Rows per page”, change through a `labels` prop. Give only the ones you change; the rest stay English. Labels with a count are functions, so each language can say its own plural:

```tsx
<Pagination count={12} labels={{ previous: "Zurück", next: "Weiter", page: (page) => `Seite ${page}` }} />
```

To set both once for the whole app, wrap it in a `LocaleProvider`. A component's own `locale` and `labels` still win:

```tsx
import { LocaleProvider } from "yosegi";

<LocaleProvider locale="de-DE" labels={{ pagination: { next: "Weiter" }, table: { rowsPerPage: "Zeilen pro Seite" } }}>
  <App />
</LocaleProvider>
```

Month and day names come from each browser's own locale data, so a language can look different from one browser to another. Some browsers have no Azerbaijani names, for example, and show “2026 M10” for `az`. Check the languages you ship in the browsers your users have.

## Styles

Import the global styles once, at your app's entry:

```ts
import "yosegi/styles.css";
```

That loads everything, in the right order:

- `yosegi/fonts.css`: Red Hat Mono and Red Hat Text. The font files ship inside the package, one variable woff2 per style and subset, so nothing loads from a CDN.
- `yosegi/tokens.css`: the palette, the system tokens, and the light and dark themes.
- `yosegi/global.css`: a reset that removes browser defaults, and base styles for plain HTML.

If you only want Yosegi's values, import `yosegi/tokens.css` on its own. Without `yosegi/fonts.css` the type falls back to system fonts.

Every token is a CSS custom property starting with `--yosegi-`. To change one, such as the font, redefine it in your own CSS:

```css
:root {
  --yosegi-font-family-sans: "Inter Tight", system-ui, sans-serif;
}
```

The theme follows the OS setting. To force one, on the whole page or on one part of it, set `data-yosegi-theme`:

```html
<html data-yosegi-theme="dark">
```

Yosegi keeps all of its styles in cascade layers (`yosegi.reset`, `yosegi.tokens`, `yosegi.base`, `yosegi.components`). CSS you write outside a layer always wins over them, so overrides don't need `!important` or extra specificity.

## Releasing

Run `pnpm changeset` to describe any change to `yosegi` and commit the file it creates. The Release workflow is paused for now, so nothing is published. Once it's turned on, while there are changesets on `main` it keeps a "version packages" pull request open. Merging it bumps the version, updates `CHANGELOG.md` and publishes to npm using trusted publishing.

## Deploying

The Deploy workflow builds each app and deploys it to its own Cloudflare Pages project. It's paused for now and only runs when started by hand from the Actions tab. Once Cloudflare is set up, it will deploy pushes to `main` to production and give pull requests preview URLs.

| App | Pages project |
| --- | --- |
| `apps/web` | `yosegi-web` |
| `apps/playground` | `yosegi-playground` |

It needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. Subdomains are set as custom domains on each Pages project.
