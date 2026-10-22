import type { Component } from "solid-js";
import { For } from "solid-js";
import {
  ArchiveIcon,
  ArrowRightIcon,
  Button,
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DashIcon,
  DownloadIcon,
  FileIcon,
  GridIcon,
  InboxIcon,
  InfoIcon,
  type IconProps,
  ListIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  SearchOffIcon,
  SettingsIcon,
  ShareIcon,
  ShieldIcon,
  TickIcon,
  toast,
  TrashIcon,
  WarningIcon,
} from "yosegi";
import { Case } from "../ui/case";
import styles from "./icons.module.scss";

interface Icon {
  /** The file name in the design system's Icons group and in public/icons. */
  file: string;
  component: string;
  Icon: Component<IconProps>;
  /** Where the library draws it, if anywhere. */
  usedBy?: string;
}

const icons: Icon[] = [
  { file: "tick", component: "TickIcon", Icon: TickIcon, usedBy: "Checkbox, Combobox, Toast" },
  { file: "dash", component: "DashIcon", Icon: DashIcon, usedBy: "Checkbox" },
  { file: "plus", component: "PlusIcon", Icon: PlusIcon, usedBy: "NumberField" },
  { file: "minus", component: "MinusIcon", Icon: MinusIcon, usedBy: "NumberField" },
  { file: "close", component: "CloseIcon", Icon: CloseIcon, usedBy: "Dialog, Popover, Toast" },
  { file: "calendar", component: "CalendarIcon", Icon: CalendarIcon, usedBy: "DatePicker" },
  { file: "chevron-left", component: "ChevronLeftIcon", Icon: ChevronLeftIcon, usedBy: "DatePicker" },
  { file: "chevron-right", component: "ChevronRightIcon", Icon: ChevronRightIcon, usedBy: "DatePicker" },
  { file: "chevron-down", component: "ChevronDownIcon", Icon: ChevronDownIcon, usedBy: "Combobox" },
  { file: "search", component: "SearchIcon", Icon: SearchIcon, usedBy: "Command" },
  { file: "arrow-right", component: "ArrowRightIcon", Icon: ArrowRightIcon },
  { file: "download", component: "DownloadIcon", Icon: DownloadIcon },
  { file: "trash", component: "TrashIcon", Icon: TrashIcon },
  { file: "settings", component: "SettingsIcon", Icon: SettingsIcon },
  { file: "shield", component: "ShieldIcon", Icon: ShieldIcon },
  { file: "file", component: "FileIcon", Icon: FileIcon },
  { file: "share", component: "ShareIcon", Icon: ShareIcon },
  { file: "list", component: "ListIcon", Icon: ListIcon },
  { file: "grid", component: "GridIcon", Icon: GridIcon },
  { file: "info", component: "InfoIcon", Icon: InfoIcon },
  { file: "archive", component: "ArchiveIcon", Icon: ArchiveIcon },
  { file: "inbox", component: "InboxIcon", Icon: InboxIcon },
  { file: "search-off", component: "SearchOffIcon", Icon: SearchOffIcon },
  { file: "warning", component: "WarningIcon", Icon: WarningIcon },
];

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
