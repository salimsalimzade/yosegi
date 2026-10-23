import type { Component } from "solid-js";
import { For } from "solid-js";
import * as yosegi from "yosegi";
import {
  ArrowRightIcon,
  Button,
  DownloadIcon,
  InfoIcon,
  type IconProps,
  PlusIcon,
  SettingsIcon,
  TickIcon,
  toast,
  TrashIcon,
} from "yosegi";
import { Case } from "../ui/case";
import styles from "./icons.module.scss";

interface Icon {
  /** The file name in packages/ui/src/icons, public/icons and the design system's Icons group. */
  file: string;
  component: string;
  Icon: Component<IconProps>;
  /** Where the library draws it, if anywhere. */
  usedBy?: string;
}

/** Where the library draws its own icons. These come first; the rest follow by name. */
const usedBy: Record<string, string> = {
  TickIcon: "Checkbox, Select, Combobox, Filter, Toast",
  DashIcon: "Checkbox",
  PlusIcon: "NumberField",
  MinusIcon: "NumberField",
  CloseIcon: "Dialog, Popover, Toast, Filter, Combobox",
  CalendarIcon: "DatePicker",
  ChevronLeftIcon: "DatePicker, Pagination",
  ChevronRightIcon: "DatePicker, Pagination",
  ChevronDownIcon: "Select, Combobox, Table",
  SearchIcon: "Command, Combobox, Table",
  FilterIcon: "Filter",
};

/** SearchOffIcon → search-off */
const fileName = (component: string) =>
  component
    .replace(/Icon$/, "")
    .replace(/[A-Z]/g, (char, index) => (index ? "-" : "") + char.toLowerCase());

// Every icon the kit exports, so a new SVG shows up here after `pnpm generate`.
const order = Object.keys(usedBy);
const icons: Icon[] = Object.entries(yosegi)
  .filter(([name]) => name.endsWith("Icon"))
  .map(([component, Icon]) => ({ file: fileName(component), component, Icon: Icon as Component<IconProps>, usedBy: usedBy[component] }))
  .sort((a, b) => {
    const rank = (icon: Icon) => (order.includes(icon.component) ? order.indexOf(icon.component) : order.length);
    return rank(a) - rank(b) || a.file.localeCompare(b.file);
  });

const copy = async (icon: Icon) => {
  const text = `<${icon.component} />`;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${text}`);
  } catch {
    toast.error("Couldn't copy", { description: text });
  }
};

export function IconsPage() {
  return (
    <>
      <Case
        title="All icons"
        description="Click one to copy its component. The download gives the standalone SVG, the same file as in the design system."
        layout="fill"
      >
        <ul class={styles.grid}>
          <For each={icons}>
            {(icon) => (
              <li class={styles.tile}>
                <button type="button" class={styles.copy} onClick={() => copy(icon)}>
                  <icon.Icon class={styles.glyph} />
                  <span class={styles.file}>{icon.file}</span>
                  <code class={styles.component}>{icon.component}</code>
                  <span class={styles["used-by"]}>{icon.usedBy ?? "For apps"}</span>
                </button>
                <Button
                  as="a"
                  href={`/icons/${icon.file}.svg`}
                  download
                  class={styles.download}
                  size="sm"
                  variant="ghost"
                  icon={<DownloadIcon />}
                  aria-label={`Download ${icon.file}.svg`}
                />
              </li>
            )}
          </For>
        </ul>
      </Case>
      <Case title="Sizes" description="16px by default (24px for the large ones). Set width and height, or size them with CSS.">
        <For each={[14, 16, 18, 20, 24]}>
          {(size) => (
            <span class={styles.size}>
              <SettingsIcon width={size} height={size} />
              <span>{size}</span>
            </span>
          )}
        </For>
      </Case>
      <Case title="Colour follows text" description="They draw in currentColor, so they match what's around them.">
        <span class={styles.swatch}>
          <InfoIcon /> Default
        </span>
        <span class={styles.swatch} style={{ color: "var(--yosegi-color-fg-muted)" }}>
          <InfoIcon /> Muted
        </span>
        <span class={styles.swatch} style={{ color: "var(--yosegi-color-fg-accent)" }}>
          <TickIcon /> Accent
        </span>
        <span class={styles.swatch} style={{ color: "var(--yosegi-color-fg-danger)" }}>
          <TrashIcon /> Danger
        </span>
      </Case>
      <Case title="In components" description="Buttons size them with their text; icon-only buttons need an aria-label.">
        <Button icon={<PlusIcon />}>New note</Button>
        <Button variant="outline" icon={<ArrowRightIcon />} iconPosition="end">
          Continue
        </Button>
        <Button variant="outline" icon={<SettingsIcon />} aria-label="Settings" />
        <Button variant="danger" icon={<TrashIcon />}>
          Delete
        </Button>
      </Case>
    </>
  );
}
