import type { JSX } from "@solidjs/web";
import { createContext, useContext } from "solid-js";
import type { ComboboxLabels } from "../combobox/combobox";
import type { DatePickerLabels } from "../date-picker/date-picker";
import type { DialogLabels } from "../dialog/dialog";
import type { FileUploadLabels } from "../file-upload/file-upload";
import type { NumberFieldLabels } from "../number-field/number-field";
import type { PopoverLabels } from "../popover/popover";
import type { StepperLabels } from "../stepper/stepper";
import type { FilterLabels } from "../table/filter";
import type { PaginationLabels } from "../table/pagination";
import type { TableLabels } from "../table/table";
import type { ToasterLabels } from "../toast/toast";

/** Each component's labels, by name, as its own `labels` prop takes them. */
export interface LocaleLabels {
  combobox?: Partial<ComboboxLabels>;
  datePicker?: Partial<DatePickerLabels>;
  dialog?: Partial<DialogLabels>;
  fileUpload?: Partial<FileUploadLabels>;
  filter?: Partial<FilterLabels>;
  numberField?: Partial<NumberFieldLabels>;
  pagination?: Partial<PaginationLabels>;
  popover?: Partial<PopoverLabels>;
  stepper?: Partial<StepperLabels>;
  /** With `filter` and `pagination` inside, for the Filter and Pagination a Table builds. */
  table?: Partial<TableLabels>;
  toaster?: Partial<ToasterLabels>;
}

/**
 * The locale and labels for every component inside, set once near the root
 * of the app. Without one, everything is in English (en-US). A component's own `locale` and `labels` still win, and a
 * LocaleProvider inside another changes only what it sets.
 */
export interface LocaleProviderProps {
  /** For dates, numbers, the search and the sort. English (en-US) by default. */
  locale?: string;
  labels?: LocaleLabels;
  children?: JSX.Element;
}

/** The locale when neither a component nor a LocaleProvider sets one, so a page reads the same everywhere. */
export const defaultLocale = "en-US";

type Labels<K extends keyof LocaleLabels> = Required<NonNullable<LocaleLabels[K]>>;

interface LocaleContextValue {
  locale: () => string;
  labels: <K extends keyof LocaleLabels>(name: K) => LocaleLabels[K];
}

const LocaleContext = createContext<LocaleContextValue>({ locale: () => defaultLocale, labels: () => undefined });

const isGroup = (value: unknown): value is object => typeof value === "object" && value !== null;

// Later layers win, key by key. A group of labels inside, like Table's
// `filter`, merges the same way instead of being replaced whole.
function merge(...layers: (object | undefined)[]) {
  const merged: Record<string, unknown> = {};
  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer ?? {})) {
      if (value === undefined) continue;
      merged[key] = isGroup(value) && isGroup(merged[key]) ? { ...merged[key], ...value } : value;
    }
  }
  return merged;
}

export function LocaleProvider(props: LocaleProviderProps) {
  const outer = useContext(LocaleContext);

  return (
    <LocaleContext
      value={{
        locale: () => props.locale ?? outer.locale(),
        labels: (name) => merge(outer.labels(name), props.labels?.[name]) as LocaleLabels[typeof name],
      }}
    >
      {props.children}
    </LocaleContext>
  );
}

/** The locale a component uses: its own, then the nearest LocaleProvider's, then English (en-US). */
export function useLocale(own?: () => string | undefined) {
  const context = useContext(LocaleContext);
  return () => own?.() ?? context.locale();
}

/** The labels a component uses: its own, then the nearest LocaleProvider's, then its English defaults. */
export function useLabels<K extends keyof LocaleLabels>(
  name: K,
  defaults: Labels<K>,
  own: () => LocaleLabels[K] | undefined,
): () => Labels<K> {
  const context = useContext(LocaleContext);
  return () => merge(defaults, context.labels(name), own()) as Labels<K>;
}
