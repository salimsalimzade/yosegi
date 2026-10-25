import "yosegi-solid/styles.css";
import { render } from "@solidjs/web";
import { createDecorator, createJSXDecorator, type Preview } from "storybook-solidjs-vite";
import { Toaster } from "yosegi-solid";
import styles from "./stage.module.scss";

type Theme = "system" | "light" | "dark";

// One Toaster for the whole preview, so a docs page with many stories still shows each toast once.
render(() => <Toaster />, document.body.appendChild(document.createElement("div")));

/** Follows the toolbar's theme switch: no attribute follows the OS, or it forces light or dark. */
const withTheme = createDecorator((Story, context) => {
  const theme = context.globals.theme as Theme;
  if (theme === "system") delete document.documentElement.dataset.yosegiTheme;
  else document.documentElement.dataset.yosegiTheme = theme;
  return Story();
});

/** Puts a story on a themed stage; parameters.stage picks row (default), stack, field, fill or center. */
const withStage = createJSXDecorator((Story, context) => (
  <div class={styles.stage} data-layout={context.parameters.stage ?? "row"}>
    <Story />
  </div>
));

// The HTML attributes every part passes through. Docgen lists them on each component; the tables
// show Yosegi's own props instead.
const inheritedDomProps = [
  "accesskey",
  "aria-controls",
  "aria-current",
  "aria-describedby",
  "aria-disabled",
  "aria-expanded",
  "aria-hidden",
  "aria-labelledby",
  "aria-live",
  "class",
  "contenteditable",
  "dir",
  "draggable",
  "hidden",
  "id",
  "inert",
  "inputmode",
  "lang",
  "popover",
  "role",
  "slot",
  "spellcheck",
  "style",
  "tabIndex",
  "title",
  "translate",
];

export default {
  tags: ["autodocs"],
  decorators: [withStage, withTheme],
  argTypes: Object.fromEntries(inheritedDomProps.map((name) => [name, { table: { disable: true } }])),
  globalTypes: {
    theme: {
      description: "Yosegi theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "system", title: "System" },
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "system" },
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true, sort: "requiredFirst" },
    // The toolbar's viewport menu: pick one to see the story at that width.
    viewport: {
      options: {
        phone: { name: "Phone", styles: { width: "375px", height: "667px" }, type: "mobile" },
        tablet: { name: "Tablet", styles: { width: "768px", height: "1024px" }, type: "tablet" },
        desktop: { name: "Desktop", styles: { width: "1280px", height: "800px" }, type: "desktop" },
      },
    },
    options: {
      // The guides, then the design system's groups with components A to Z; stories keep the order
      // they're written in.
      storySort: {
        method: "alphabetical",
        order: [
          "Introduction",
          "Guides",
          ["Getting started", "Theming"],
          "Actions",
          "Forms",
          "Disclosure",
          "Navigation",
          "Overlays",
          "Feedback",
          "Layout",
          "Assets",
          "Setup",
        ],
      },
    },
  },
} satisfies Preview;
