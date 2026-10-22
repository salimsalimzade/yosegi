# yosegi

Yosegi is my personal design system for SolidJS applications.

The name comes from yosegi-zaiku, a Japanese woodcraft where many small pieces of wood are fitted together into one pattern. That’s the idea here too: small, consistent components that fit together into one interface.

There are already plenty of great design systems out there. I built this one anyway, to learn how they really work and to have something that fits exactly how I build apps.

## Structure

This repo is a pnpm workspace built on SolidJS 2.

- `packages/ui`: the component library, published to npm as `yosegi`
- `apps/playground`: a sandbox for building components
- `apps/web`: the website, a "Hello world" page for now

Apps use `yosegi` through `workspace:*`, so they compile the library's source directly. `pnpm publish` swaps in the `publishConfig.exports` that point at `dist/`.

## Developing

```sh
pnpm install
pnpm dev:playground   # the playground, at http://localhost:5173
pnpm dev:web          # the website, at http://localhost:5174
pnpm dev              # both at once
```

The playground is laid out like the design system: a sidebar grouped into Actions, Forms, Disclosure, Navigation, Overlays, Feedback and Layout, and a page for each component under `/playground` (`/playground/button`, `/playground/date-picker`, …) that shows every case on its own. The Assets group has the Icons page, with all 24 icons to copy or download. A switch at the top changes between the light and dark themes. Changes to `packages/ui` show up as you save.

## Components

Button, ButtonGroup, Spinner, TextField, NumberField, DatePicker, Checkbox, Combobox, Command, Accordion, Tabs, Tooltip, Popover, Dialog, Toast, Table, Item, Separator, NotFound, ErrorState and EmptyState.

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
