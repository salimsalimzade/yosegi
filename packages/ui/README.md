# yosegi-solid

A small design system for SolidJS: calm, accessible components, one accent colour, and every value a CSS custom property you can change.

## Install

```sh
pnpm add yosegi-solid
```

It needs `solid-js` and `@solidjs/web` 2. Build your app with Vite and `@solidjs/vite-plugin`: the plugin compiles Yosegi from its source, and its component styles ship as CSS modules, so there's nothing else to install.

## Use it

Import the global styles once, at your app's entry:

```tsx
import "yosegi-solid/styles.css";
import { render } from "@solidjs/web";
import { App } from "./app";

render(() => <App />, document.getElementById("root")!);
```

That loads the fonts, the tokens with the light and dark themes, and a reset. Then use the components:

```tsx
import { Button, TextField } from "yosegi-solid";

<TextField label="Project name" description="You can change it later." />
<Button label="Create project" />
```

Every component works from props alone. For full control, build it from its parts: the root holds the state, and the parts hang off it.

```tsx
<TextField validationState={error() ? "invalid" : "valid"}>
  <TextField.Label>Project name</TextField.Label>
  <TextField.Input />
  <TextField.Description>You can change it later.</TextField.Description>
  <TextField.ErrorMessage>Give the project a name.</TextField.ErrorMessage>
</TextField>
```

Toasts need one `<Toaster />` near the root of the app; then call `toast("Saved")`, `toast.success(…)`, `toast.error(…)` or `toast.promise(…)` from anywhere.

## Components

Button, ButtonGroup, Spinner, TextField, NumberField, DatePicker, Checkbox, Select, Combobox, Filter, Command, Accordion, Tabs, Pagination, Tooltip, Popover, Dialog, Toast, Table, Item, Separator, Kbd, NotFound, ErrorState, EmptyState and LocaleProvider, plus an icon set (`PlusIcon`, `SearchIcon`, …).

## Make it yours

Every token is a CSS custom property starting with `--yosegi-`. Redefine one in your own CSS and every component follows:

```css
:root,
[data-yosegi-theme] {
  --yosegi-color-bg-accent: light-dark(#3451b2, #a5b4fc);
}

:root {
  --yosegi-font-family-sans: "Inter", system-ui, sans-serif;
}
```

Yosegi keeps its styles in cascade layers, so CSS you write outside a layer always wins without `!important`. One component at a time, set its knobs, such as `--yosegi-button-radius`, or target its stable classes (`yosegi-button`, `yosegi-tabs-trigger`) and `data-*` states.

The theme follows the OS. To force one, on the page or on one part of it, set `data-yosegi-theme="light"` or `"dark"`.

The Storybook's **Guides › Theming** page has a live example for colours, spacing, corners, type, themes and every knob.

## Other imports

| Import | What it loads |
| --- | --- |
| `yosegi-solid/styles.css` | Everything below, in the right order |
| `yosegi-solid/tokens.css` | The palette, the system tokens, and the light and dark themes |
| `yosegi-solid/global.css` | A reset and base styles for plain HTML |
| `yosegi-solid/fonts.css` | Red Hat Text and Red Hat Mono, self-hosted |

Using your own fonts? Import `tokens.css` and `global.css` instead of `styles.css`.

## Language

Everything is in English until you say otherwise. Wrap the app in a `LocaleProvider` to format dates and numbers for a locale and to change the words components write themselves:

```tsx
import { LocaleProvider } from "yosegi-solid";

<LocaleProvider locale="de-DE" labels={{ pagination: { next: "Weiter" } }}>
  <App />
</LocaleProvider>
```

## Licence

MIT
