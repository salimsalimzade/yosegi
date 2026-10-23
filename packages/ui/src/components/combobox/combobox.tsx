import type { JSX } from "@solidjs/web";
import {
  children,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  omit,
  onCleanup,
  Show,
  untrack,
  useContext,
} from "solid-js";
import { nextItem } from "../../primitives/active-descendant";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createDismiss } from "../../primitives/create-dismiss";
import { createField, type Field, type FieldState, type FieldTextProps } from "../../primitives/create-field";
import { createFloating, type Placement } from "../../primitives/create-floating";
import { callHandler, dataAttr } from "../../primitives/dom";
import { createFieldParts } from "../../primitives/field-parts";
import { ChevronDownIcon, CloseIcon, PlusIcon, SearchIcon, TickIcon } from "../../primitives/icons";
import {
  groupOptions,
  optionKey,
  resolveOptions,
  type Option,
  type OptionAccessors,
  type ResolvedOption,
} from "../../primitives/option-groups";
import { Portal } from "../../primitives/portal";
import { Button } from "../button/button";
import { Spinner } from "../spinner/spinner";
import styles from "./combobox.module.scss";

export type ComboboxOption = Option;

type Direction = "next" | "prev" | "first" | "last";

/** The value of the create row in the list, which no real option can have. */
const CREATE = "\u0000create";

interface ComboboxContextValue {
  field: Field;
  multiple: () => boolean;
  /** The chosen values, in the order they were picked. */
  chosen: () => string[];
  isChosen: (value: string) => boolean;
  /** An option by value, including chosen ones no longer in `options` (after a new search). */
  optionFor: (value: string) => ComboboxOption | undefined;
  /** The options to list: all of them, or those matching the search when it's local. */
  visible: () => ComboboxOption[];
  query: () => string;
  search: (text: string) => void;
  open: () => boolean;
  openPanel: (query?: string) => void;
  close: (options?: { focus?: boolean }) => void;
  pick: (value: string) => void;
  remove: (value: string) => void;
  clearAll: () => void;
  clearable: () => boolean;
  /** Multiple, with max chosen: the rows not chosen are unavailable. */
  atMax: () => boolean;
  max: () => number | undefined;
  /** The query needs more letters before anything is searched. */
  tooShort: () => boolean;
  minQueryLength: () => number;
  /** Loading, shown after 300ms and kept for at least 300ms. */
  loading: () => boolean;
  loadingText: () => JSX.Element;
  error: () => boolean;
  errorText: () => JSX.Element;
  retry: () => void;
  hint: () => JSX.Element;
  /** The create row's query, when it should show. */
  createQuery: () => string | undefined;
  active: () => string | undefined;
  setActive: (value: string | undefined) => void;
  move: (direction: Direction) => void;
  /** Picks the highlighted row: an option, or the create row. */
  pickActive: () => void;
  /** The field's label in lower case, for “4 more tags”. */
  noun: () => string;
  listboxId: string;
  optionId: (value: string) => string;
  reference: () => HTMLElement | undefined;
  setReference: (el: HTMLElement) => void;
  setContent: (el: HTMLElement | undefined) => void;
  setListbox: (el: HTMLElement | undefined) => void;
  setOverflow: (el: HTMLElement | undefined) => void;
}

const ComboboxContext = createContext<ComboboxContextValue>();
const useCombobox = () => useContext(ComboboxContext);

/** Set inside Combobox.Control, where the Trigger is just the chevron. */
const ControlContext = createContext<boolean>(false);

/** With no children, Combobox builds itself from label, placeholder, description and errorMessage. */
interface ComboboxBaseProps<T>
  extends FieldState,
    FieldTextProps,
    OptionAccessors<T>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** { value, label, group?, disabled? }, or your own objects read through getOptionValue and getOptionLabel. */
  options: readonly T[];
  /** contains (default), startsWith, or your own test. Ignored when you search on a server. */
  filter?: "contains" | "startsWith" | ((option: T, query: string) => boolean);
  /** Adds a "Create “…”" row when nothing matches the search exactly. */
  onCreate?: (query: string) => void;
  /** Fires as people type in the search box. Fetch options here; the list then shows them as they are. */
  onInputChange?: (query: string) => void;
  /** Below this many characters nothing is fetched and the list asks for more. 0 by default. */
  minQueryLength?: number;
  /** Options are being fetched. With no options: skeleton rows. With options: they stay, and a Spinner turns in the search box. */
  loading?: boolean;
  /** Announced while loading. "Loading…" by default. */
  loadingText?: JSX.Element;
  /** The last fetch failed: the list shows errorText and a Try again button. Not a validation error. */
  error?: boolean;
  /** "Couldn’t load options." by default. */
  errorText?: JSX.Element;
  onRetry?: () => void;
  /** A line at the foot of the list, like "Type to search 2,400 cities." */
  hint?: JSX.Element;
  /** bottom-start by default. */
  placement?: Placement;
  /** Sends the value, or one value per chosen option, with a form. */
  name?: string;
  /** Shown in the box until something is picked. */
  placeholder?: JSX.Element;
  /** The search box's placeholder. "Search…" by default. */
  searchPlaceholder?: string;
  /** Shown when nothing matches the search. */
  emptyText?: ComboboxContentProps["emptyText"];
  /** Renders each row's content, like an icon or a detail on the right. The tick, search and keys stay the same. */
  renderOption?: (option: T) => JSX.Element;
}

/** The search select: picks one option from a long list, searched in the panel. */
export interface ComboboxSingleProps<T = ComboboxOption> extends ComboboxBaseProps<T> {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  /** The option's value and the option, or null for both when cleared. */
  onChange?: (value: string | null, option: T | null) => void;
}

/** Picks several options, shown as chips; those that don't fit become a +N counter that opens them. */
export interface ComboboxMultipleProps<T = ComboboxOption> extends ComboboxBaseProps<T> {
  multiple: true;
  /** How many can be chosen; once reached, the other rows are unavailable. */
  max?: number;
  /** Clear all in the list's foot and the hidden chips panel. True by default. */
  clearable?: boolean;
  value?: string[];
  defaultValue?: string[];
  /** The chosen values, and the options among those seen so far. */
  onChange?: (value: string[], options: T[]) => void;
}

export type ComboboxProps<T = ComboboxOption> = ComboboxSingleProps<T> | ComboboxMultipleProps<T>;

const firstEnabled = (values: string[]) => values[0];

function ComboboxRoot<T = ComboboxOption>(props: ComboboxProps<T>) {
  const id = `yosegi-combobox-${createUniqueId()}`;
  const field = createField(props, "yosegi-combobox");
  const multiple = () => props.multiple === true;
  const toList = (value: string | string[] | null | undefined) =>
    value === undefined ? undefined : value === null ? [] : Array.isArray(value) ? value : [value];

  const [chosen, setChosen] = createControllableSignal<string[]>({
    value: () => toList(props.value),
    defaultValue: () => toList(props.defaultValue) ?? [],
    equals: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]),
    onChange: (next) => {
      const items = next.flatMap((value) => (known.has(value) ? [known.get(value)!.item] : []));
      if (props.multiple) props.onChange?.(next, items);
      else props.onChange?.(next[0] ?? null, items[0] ?? null);
    },
  });

  const [open, setOpen] = createSignal(false, { ownedWrite: true });
  const [query, setQuery] = createSignal("", { ownedWrite: true });
  const [active, setActive] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  const element = () => createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const [reference, setReference] = element();
  const [content, setContent] = element();
  const [listbox, setListbox] = element();
  const [overflow, setOverflow] = element();

  // Remember every option seen, so chips and the value keep their labels
  // when a new search replaces the options.
  const known = new Map<string, ResolvedOption<T>>();
  const options = createMemo(() => {
    const resolved = resolveOptions(props.options, props);
    for (const option of resolved) known.set(option.value, option);
    return resolved;
  });
  const optionFor = (value: string) => (options(), known.get(value));

  const minQueryLength = () => props.minQueryLength ?? 0;
  const serverSearch = () => props.onInputChange !== undefined;
  const tooShort = () => query().trim().length > 0 && query().trim().length < minQueryLength();

  const matches = (option: ResolvedOption<T>, q: string) => {
    if (typeof props.filter === "function") return props.filter(option.item, q);
    const label = option.label.toLocaleLowerCase();
    const needle = q.trim().toLocaleLowerCase();
    return props.filter === "startsWith" ? label.startsWith(needle) : label.includes(needle);
  };

  const visible = createMemo(() => {
    const q = query();
    if (tooShort()) return [];
    if (serverSearch() || q.trim() === "") return options();
    return options().filter((option) => matches(option, q));
  });

  const max = () => (props.multiple ? props.max : undefined);
  const atMax = () => max() !== undefined && chosen().length >= max()!;
  const isChosen = (value: string) => chosen().includes(value);
  const unavailable = (option: ComboboxOption) => !!option.disabled || (atMax() && !isChosen(option.value));

  const createQuery = () => {
    const q = query().trim();
    if (!props.onCreate || !q || tooShort()) return undefined;
    const exact = visible().some((option) => option.label.toLocaleLowerCase() === q.toLocaleLowerCase());
    return exact ? undefined : q;
  };

  // The rows the arrow keys move through, in order.
  const rows = () => [
    ...visible()
      .filter((option) => !unavailable(option))
      .map((option) => option.value),
    ...(createQuery() !== undefined ? [CREATE] : []),
  ];

  // Loading shows only after 300ms, so fast answers never flash, and once
  // shown it stays at least 300ms.
  const [loadingShown, setLoadingShown] = createSignal(false, { ownedWrite: true });
  let loadingTimer: ReturnType<typeof setTimeout> | undefined;
  let shownAt = 0;
  createEffect(
    () => !!props.loading,
    (loading) => {
      clearTimeout(loadingTimer);
      if (loading) {
        if (untrack(loadingShown)) return;
        loadingTimer = setTimeout(() => {
          shownAt = Date.now();
          setLoadingShown(true);
        }, 300);
      } else if (untrack(loadingShown)) {
        loadingTimer = setTimeout(() => setLoadingShown(false), Math.max(0, 300 - (Date.now() - shownAt)));
      }
    },
  );
  onCleanup(() => clearTimeout(loadingTimer));

  // New results keep the highlighted row if it's still there; otherwise the first one is highlighted.
  createEffect(
    () => (open() ? rows() : undefined),
    (list) => {
      if (!list) return;
      const current = untrack(active);
      if (current === undefined || !list.includes(current)) setActive(firstEnabled(list));
    },
  );

  // Keep the highlighted row in view.
  createEffect(
    () => [open() && active(), listbox()] as const,
    ([current, list]) => {
      if (current && list) document.getElementById(optionId(current))?.scrollIntoView({ block: "nearest" });
    },
  );

  const search = (text: string) => {
    setQuery(text);
    if (text.trim().length === 0 || text.trim().length >= minQueryLength()) props.onInputChange?.(text);
  };

  const openPanel = (initial = "") => {
    if (field.disabled() || field.readOnly()) return;
    setOpen(true);
    search(initial);
    // Highlight the chosen option (one) or the first row, once the rows are known.
    const current = untrack(chosen)[0];
    setActive(!multiple() && current !== undefined ? current : undefined);
  };

  const close = ({ focus = false } = {}) => {
    setOpen(false);
    setActive(undefined);
    if (untrack(query) !== "") search("");
    if (focus) {
      const ref = reference();
      // In a Control, focus the chevron button; on its own, the box.
      (ref?.matches("button") ? ref : ref?.querySelector<HTMLElement>(".yosegi-combobox-trigger"))?.focus();
    }
  };

  const pick = (value: string) => {
    const option = optionFor(value);
    if (!option || option.disabled) return;
    if (!multiple()) {
      setChosen([value]);
      close({ focus: true });
      return;
    }
    if (isChosen(value)) setChosen(chosen().filter((v) => v !== value));
    else if (!atMax()) setChosen([...chosen(), value]);
  };

  const optionId = (value: string) => `${id}-option-${value === CREATE ? "create" : optionKey(value)}`;

  createFloating({
    open,
    reference,
    floating: content,
    placement: () => props.placement ?? "bottom-start",
    gutter: () => 4,
    sameWidth: () => true,
    name: "combobox",
  });

  createDismiss({
    enabled: open,
    inside: () => [content(), reference(), overflow()],
    onDismiss: (reason) => close({ focus: reason === "escape" }),
  });

  const rest = omit(
    props as ComboboxBaseProps<T> & {
      multiple?: boolean;
      max?: number;
      clearable?: boolean;
      value?: unknown;
      defaultValue?: unknown;
      onChange?: unknown;
    },
    "options",
    "value",
    "defaultValue",
    "onChange",
    "filter",
    "onCreate",
    "onInputChange",
    "minQueryLength",
    "loading",
    "loadingText",
    "error",
    "errorText",
    "onRetry",
    "hint",
    "placement",
    "name",
    "multiple",
    "max",
    "clearable",
    "label",
    "description",
    "errorMessage",
    "placeholder",
    "searchPlaceholder",
    "emptyText",
    "renderOption",
    "getOptionValue",
    "getOptionLabel",
    "getOptionGroup",
    "getOptionDisabled",
    "validationState",
    "required",
    "disabled",
    "readOnly",
    "class",
    "children",
    "aria-label",
  );

  return (
    <ComboboxContext
      value={{
        field,
        multiple,
        chosen,
        isChosen,
        optionFor,
        visible,
        query,
        search,
        open,
        openPanel,
        close,
        pick,
        remove: (value) => setChosen(chosen().filter((v) => v !== value)),
        clearAll: () => setChosen([]),
        clearable: () => (props.multiple ? props.clearable !== false : false),
        atMax,
        max,
        tooShort,
        minQueryLength,
        loading: loadingShown,
        loadingText: () => props.loadingText ?? "Loading…",
        error: () => !!props.error,
        errorText: () => props.errorText ?? "Couldn’t load options.",
        retry: () => props.onRetry?.(),
        hint: () => props.hint,
        createQuery,
        active,
        setActive,
        move: (direction) => {
          const item = nextItem(listbox(), active(), direction);
          if (item) setActive(item.dataset.value);
        },
        pickActive: () => {
          const current = active();
          if (current === CREATE) props.onCreate?.(query().trim());
          else if (current !== undefined) pick(current);
        },
        noun: () => document.getElementById(field.labelId)?.textContent?.trim().toLocaleLowerCase() || "options",
        listboxId: `${id}-listbox`,
        optionId,
        reference,
        setReference,
        setContent,
        setListbox,
        setOverflow,
      }}
    >
      <div
        {...rest}
        class={[styles.root, "yosegi-combobox", props.class]}
        data-multiple={dataAttr(multiple())}
        data-expanded={dataAttr(open())}
        data-invalid={dataAttr(field.invalid())}
        data-disabled={dataAttr(field.disabled())}
        data-readonly={dataAttr(field.readOnly())}
        data-loading={dataAttr(props.loading)}
        aria-busy={props.loading ? "true" : undefined}
        // Without parts, the name goes on the box, which is what gets focus.
        aria-label={"children" in props ? props["aria-label"] : undefined}
      >
        {"children" in props ? (
          props.children
        ) : (
          <FieldLayout label={props.label} description={props.description} labelPart={Label}>
            <Show
              when={multiple()}
              fallback={
                <Trigger aria-label={props["aria-label"]}>
                  <Value placeholder={props.placeholder} />
                </Trigger>
              }
            >
              <Control>
                <Chips placeholder={props.placeholder} />
                <Trigger />
              </Control>
            </Show>
            <Portal>
              <Content emptyText={props.emptyText}>
                <Show when={props.searchPlaceholder} fallback={<Search />}>
                  <Search placeholder={props.searchPlaceholder} />
                </Show>
                <Listbox
                  children={props.renderOption && ((option) => props.renderOption!((option as ResolvedOption<T>).item))}
                />
              </Content>
            </Portal>
          </FieldLayout>
        )}
        <Show when={props.name}>
          <For each={chosen()}>{(value) => <input type="hidden" name={props.name} value={value} />}</For>
        </Show>
      </div>
    </ComboboxContext>
  );
}

const isPrintable = (event: KeyboardEvent) =>
  event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

/** On its own: the box, a button with the chevron after its children. Inside Control: just the chevron. */
function Trigger(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const combobox = useCombobox();
  const inControl = useContext(ControlContext);
  const rest = omit(props, "class", "ref", "onClick", "onKeyDown", "children");
  const label = children(() => props.children);

  return (
    <button
      type="button"
      aria-label={inControl ? "Show options" : undefined}
      {...rest}
      ref={[(el: HTMLButtonElement) => !inControl && combobox.setReference(el), props.ref as any]}
      id={inControl ? undefined : combobox.field.controlId}
      class={[styles.trigger, "yosegi-combobox-trigger", props.class]}
      aria-haspopup="listbox"
      aria-expanded={combobox.open() ? "true" : "false"}
      aria-controls={combobox.listboxId}
      aria-required={combobox.field.required() ? "true" : undefined}
      aria-invalid={combobox.field.invalid() ? "true" : undefined}
      aria-readonly={combobox.field.readOnly() ? "true" : undefined}
      aria-describedby={combobox.field.describedBy()}
      aria-errormessage={combobox.field.errorMessage()}
      disabled={combobox.field.disabled()}
      onClick={(event) => {
        callHandler(props.onClick, event);
        // Inside Control, the Control's own click handles it.
        if (event.defaultPrevented || inControl) return;
        if (combobox.open()) combobox.close({ focus: true });
        else combobox.openPanel();
      }}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        if (event.defaultPrevented || combobox.open()) return;
        if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          combobox.openPanel();
        } else if (isPrintable(event)) {
          // Typing on the box starts a search with that letter.
          event.preventDefault();
          combobox.openPanel(event.key);
        }
      }}
    >
      <Show when={!inControl}>{label.toArray().length > 0 ? label() : <Value />}</Show>
      <ChevronDownIcon />
    </button>
  );
}

/** The chosen option's label, or the placeholder. */
function Value(props: JSX.HTMLAttributes<HTMLSpanElement> & { placeholder?: JSX.Element }) {
  const combobox = useCombobox();
  const rest = omit(props, "class", "placeholder", "children");
  const label = () => {
    const value = combobox.chosen()[0];
    return value === undefined ? undefined : (combobox.optionFor(value)?.label ?? value);
  };
  return (
    <span
      {...rest}
      class={[styles.value, "yosegi-combobox-value", props.class]}
      data-placeholder-shown={dataAttr(label() === undefined)}
    >
      {label() ?? props.placeholder}
    </span>
  );
}

/** The box that holds the chips (multiple). Never grows. A click on it opens the list. */
function Control(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const combobox = useCombobox();
  const rest = omit(props, "class", "ref", "onClick", "children");
  return (
    <ControlContext value={true}>
      <div
        {...rest}
        ref={[(el: HTMLDivElement) => combobox.setReference(el), props.ref as any]}
        class={[styles.control, "yosegi-combobox-control", props.class]}
        onClick={(event) => {
          callHandler(props.onClick, event);
          if (event.defaultPrevented) return;
          // Clicks inside the portaled panels bubble here through Solid; only the box itself counts.
          const target = event.target as Element;
          if (!event.currentTarget.contains(target)) return;
          // Chips and the counter handle their own clicks.
          if (target.closest(".yosegi-combobox-chip, .yosegi-combobox-chip-count")) return;
          if (combobox.open()) combobox.close({ focus: true });
          else combobox.openPanel();
        }}
      >
        {props.children}
      </div>
    </ControlContext>
  );
}

const CHIP_GAP = 4;

/** A removable chip per chosen option that fits, then the +N counter and the panel it opens. */
function Chips(props: JSX.HTMLAttributes<HTMLSpanElement> & { placeholder?: JSX.Element }) {
  const combobox = useCombobox();
  const rest = omit(props, "class", "placeholder", "children");
  const [fit, setFit] = createSignal(Number.POSITIVE_INFINITY, { ownedWrite: true });
  const [overflowOpen, setOverflowOpen] = createSignal(false, { ownedWrite: true });
  const [counter, setCounter] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const [panel, setPanel] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  let container: HTMLSpanElement | undefined;
  let measure: HTMLSpanElement | undefined;

  const label = (value: string) => combobox.optionFor(value)?.label ?? value;
  // At least one chip shows, even before the first measurement.
  const visibleCount = () => Math.max(fit(), combobox.chosen().length > 0 ? 1 : 0);
  const shown = () => combobox.chosen().slice(0, visibleCount());
  const hidden = () => combobox.chosen().slice(visibleCount());

  // Measure every chip in a hidden row that always holds them all, so the
  // count never feeds back into the layout it measures.
  const update = () => {
    if (!container || !measure) return;
    const widths = [...measure.querySelectorAll<HTMLElement>("[data-measure-chip]")].map((chip) => chip.offsetWidth);
    const counterWidth = measure.querySelector<HTMLElement>("[data-measure-count]")?.offsetWidth ?? 0;
    const available = container.clientWidth;
    const all = widths.reduce((sum, width) => sum + width, 0) + CHIP_GAP * Math.max(0, widths.length - 1);
    if (all <= available) return setFit(widths.length);
    let used = 0;
    let count = 0;
    for (const width of widths) {
      const next = used + (count > 0 ? CHIP_GAP : 0) + width;
      if (next + CHIP_GAP + counterWidth > available) break;
      used = next;
      count++;
    }
    // At least one chip shows, shortened with “…”.
    setFit(Math.max(1, count));
  };

  createEffect(
    () => combobox.chosen().map(label).join("\u0000"),
    () => {
      // The measuring row is up to date by now; measure again next frame in case fonts or layout settle.
      update();
      requestAnimationFrame(update);
    },
  );

  createEffect(
    () => undefined,
    () => {
      if (!container) return;
      const observer = new ResizeObserver(() => update());
      observer.observe(container);
      return () => observer.disconnect();
    },
  );

  // Removing the last hidden chip closes the panel.
  createEffect(
    () => hidden().length,
    (count) => {
      if (count === 0 && untrack(overflowOpen)) setOverflowOpen(false);
    },
  );

  createFloating({
    open: overflowOpen,
    reference: counter,
    floating: panel,
    placement: () => "bottom-start",
    gutter: () => 4,
    name: "combobox-overflow",
  });

  createDismiss({
    enabled: overflowOpen,
    inside: () => [panel(), counter()],
    onDismiss: (reason) => {
      setOverflowOpen(false);
      if (reason === "escape") counter()?.focus();
    },
  });

  const removeAndRefocus = (value: string, event: Event) => {
    const button = event.currentTarget as HTMLElement;
    const all = [...(container?.querySelectorAll<HTMLElement>(".yosegi-combobox-chip-remove") ?? [])];
    const index = all.indexOf(button);
    combobox.remove(value);
    // Focus the chip before it, or what comes after the chips.
    requestAnimationFrame(() => {
      const remaining = [...(container?.querySelectorAll<HTMLElement>(".yosegi-combobox-chip-remove") ?? [])];
      (
        remaining[Math.max(0, index - 1)] ??
        container?.parentElement?.querySelector<HTMLElement>(".yosegi-combobox-trigger")
      )?.focus();
    });
  };

  const Chip = (chipProps: { value: string }) => (
    <span class={[styles.chip, "yosegi-combobox-chip"]} title={label(chipProps.value)}>
      <span class={[styles["chip-label"], "yosegi-combobox-chip-label"]}>{label(chipProps.value)}</span>
      <button
        type="button"
        class={[styles["chip-remove"], "yosegi-combobox-chip-remove"]}
        aria-label={`Remove ${label(chipProps.value)}`}
        disabled={combobox.field.disabled() || combobox.field.readOnly()}
        onClick={(event) => {
          event.stopPropagation();
          removeAndRefocus(chipProps.value, event);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Backspace" && event.key !== "Delete") return;
          event.preventDefault();
          removeAndRefocus(chipProps.value, event);
        }}
      >
        <CloseIcon />
      </button>
    </span>
  );

  return (
    <span
      {...rest}
      ref={(el: HTMLSpanElement) => (container = el)}
      class={[styles.chips, "yosegi-combobox-chips", props.class]}
    >
      <Show
        when={combobox.chosen().length > 0}
        fallback={
          <span class={[styles.value, "yosegi-combobox-value"]} data-placeholder-shown="">
            {props.placeholder}
          </span>
        }
      >
        <For each={shown()}>{(value) => <Chip value={value} />}</For>
        <Show when={hidden().length > 0}>
          <button
            ref={setCounter}
            type="button"
            class={[styles["chip-count"], "yosegi-combobox-chip-count"]}
            aria-label={`Show ${hidden().length} more ${combobox.noun()}`}
            aria-haspopup="dialog"
            aria-expanded={overflowOpen() ? "true" : "false"}
            onClick={(event) => {
              event.stopPropagation();
              setOverflowOpen(!overflowOpen());
            }}
          >
            +{hidden().length}
          </button>
        </Show>
      </Show>

      {/* Every chip at its natural width, for measuring. */}
      <span ref={(el: HTMLSpanElement) => (measure = el)} class={styles.measure} aria-hidden="true" inert>
        <For each={combobox.chosen()}>
          {(value) => (
            <span class={styles.chip} data-measure-chip="">
              <span class={styles["chip-label"]}>{label(value)}</span>
              <span class={styles["chip-remove"]} />
            </span>
          )}
        </For>
        <span class={styles["chip-count"]} data-measure-count="">
          +{combobox.chosen().length}
        </span>
      </span>

      <Show when={overflowOpen()}>
        <Portal>
          <div
            ref={(el: HTMLDivElement) => {
              setPanel(el);
              combobox.setOverflow(el);
            }}
            role="dialog"
            aria-label={`${hidden().length} more ${combobox.noun()}`}
            class={[styles.overflow, "yosegi-combobox-overflow"]}
          >
            <p class={[styles["overflow-title"], "yosegi-combobox-overflow-title"]}>
              {hidden().length} more {combobox.noun()}
            </p>
            <ul class={[styles["overflow-list"], "yosegi-combobox-overflow-list"]}>
              <For each={hidden()}>
                {(value) => (
                  <li class={[styles["overflow-item"], "yosegi-combobox-overflow-item"]}>
                    <span title={label(value)}>{label(value)}</span>
                    <button
                      type="button"
                      class={[styles["chip-remove"], "yosegi-combobox-chip-remove"]}
                      aria-label={`Remove ${label(value)}`}
                      onClick={() => combobox.remove(value)}
                    >
                      <CloseIcon />
                    </button>
                  </li>
                )}
              </For>
            </ul>
            <div class={[styles.footer, styles["overflow-footer"], "yosegi-combobox-overflow-footer"]}>
              <span aria-live="polite">{combobox.chosen().length} chosen</span>
              <Show when={combobox.clearable()}>
                <Button
                  label="Clear all"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    combobox.clearAll();
                    setOverflowOpen(false);
                  }}
                />
              </Show>
            </div>
          </div>
        </Portal>
      </Show>
    </span>
  );
}

export interface ComboboxContentProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Shown when nothing matches. By default: No results for “query”. */
  emptyText?: JSX.Element | ((query: string) => JSX.Element);
  /** Leave empty to render Search and Listbox; add them yourself to change them. */
  children?: JSX.Element;
}

interface ContentContextValue {
  emptyText: (query: string) => JSX.Element;
}

const ContentContext = createContext<ContentContextValue>({
  emptyText: (query) => (
    <>
      <strong>No results for “{query}”.</strong>
      <span>Check the spelling, or try another word.</span>
    </>
  ),
});

/** The floating panel: Search on top, Listbox below. Renders both by itself when it has no children. */
function Content(props: ComboboxContentProps) {
  const combobox = useCombobox();
  const rest = omit(props, "class", "ref", "emptyText", "onPointerDown", "children");
  const resolved = children(() => props.children);
  const isSearch = (node: unknown) => node instanceof Element && node.classList.contains("yosegi-combobox-search");
  const fallback = useContext(ContentContext);

  const announcement = () => {
    if (combobox.error()) return "";
    if (combobox.tooShort()) return `Type ${combobox.minQueryLength()} or more letters to search.`;
    if (combobox.loading()) return combobox.loadingText();
    const count = combobox.visible().length;
    if (combobox.query().trim() && count === 0 && !combobox.createQuery())
      return `No results for “${combobox.query().trim()}”.`;
    return combobox.query().trim() ? `${count} ${count === 1 ? "result" : "results"}` : "";
  };

  return (
    <Show when={combobox.open()}>
      <ContentContext
        value={{
          emptyText: (query) => {
            const text = props.emptyText;
            if (typeof text === "function") return text(query);
            return text ?? fallback.emptyText(query);
          },
        }}
      >
        <div
          {...rest}
          ref={[(el: HTMLDivElement) => combobox.setContent(el), props.ref as any]}
          class={[styles.content, "yosegi-combobox-content", props.class]}
          data-multiple={dataAttr(combobox.multiple())}
          onPointerDown={(event) => {
            callHandler(props.onPointerDown, event);
            // Clicking a row mustn't take focus from the search box.
            if (!(event.target instanceof HTMLInputElement)) event.preventDefault();
          }}
        >
          <Show
            when={resolved.toArray().length > 0}
            fallback={
              <>
                <Search />
                <div class={[styles.body, "yosegi-combobox-body"]}>
                  <Listbox />
                </div>
              </>
            }
          >
            {resolved.toArray().filter(isSearch)}
            <div class={[styles.body, "yosegi-combobox-body"]}>
              {resolved.toArray().filter((node) => !isSearch(node))}
            </div>
          </Show>
          <p class={styles["visually-hidden"]} aria-live="polite">
            {announcement()}
          </p>
        </div>
      </ContentContext>
    </Show>
  );
}

/** The search row at the top of Content. The only place a Combobox is typed into. */
function Search(props: JSX.InputHTMLAttributes<HTMLInputElement> & { placeholder?: string }) {
  const combobox = useCombobox();
  const rest = omit(props, "class", "ref", "onInput", "onKeyDown");
  const [input, setInput] = createSignal<HTMLInputElement | undefined>(undefined, { ownedWrite: true });

  // The panel stays hidden until it has a position, so its search box can't
  // take focus straight away. Try for a few frames.
  const focus = (el: HTMLInputElement, frames = 10) => {
    if (!el.isConnected) return;
    el.focus({ preventScroll: true });
    if (document.activeElement === el) el.setSelectionRange(el.value.length, el.value.length);
    else if (frames > 0) requestAnimationFrame(() => focus(el, frames - 1));
  };
  createEffect(
    () => input(),
    (el) => {
      if (el) focus(el);
    },
  );

  const keys: Record<string, () => void> = {
    ArrowDown: () => combobox.move("next"),
    ArrowUp: () => combobox.move("prev"),
    Home: () => combobox.move("first"),
    End: () => combobox.move("last"),
    Enter: () => combobox.pickActive(),
    Escape: () => combobox.close({ focus: true }),
    // The panel sits at the end of the page, so Tab goes back to the box.
    Tab: () => combobox.close({ focus: true }),
  };

  return (
    <div class={[styles.search, "yosegi-combobox-search"]}>
      <SearchIcon />
      <input
        type="text"
        autocomplete="off"
        spellcheck={false}
        aria-label="Search options"
        placeholder="Search…"
        {...rest}
        ref={[setInput, props.ref as any]}
        class={[styles["search-input"], "yosegi-combobox-search-input", props.class]}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="true"
        aria-controls={combobox.listboxId}
        aria-activedescendant={combobox.active() !== undefined ? combobox.optionId(combobox.active()!) : undefined}
        value={combobox.query()}
        onInput={(event) => {
          combobox.search(event.currentTarget.value);
          callHandler(props.onInput, event);
        }}
        onKeyDown={(event) => {
          callHandler(props.onKeyDown, event);
          const action = keys[event.key];
          if (event.defaultPrevented || !action) return;
          event.preventDefault();
          action();
        }}
      />
      <Show when={combobox.loading() && combobox.visible().length > 0}>
        <Spinner size={14} />
      </Show>
    </div>
  );
}

export interface ComboboxListboxProps extends Omit<JSX.HTMLAttributes<HTMLUListElement>, "children"> {
  /** Render each option's content yourself. */
  children?: (option: ComboboxOption) => JSX.Element;
}

/** The matching options, with group headings, the create row, hints, loading, error and empty text. */
function Listbox(props: ComboboxListboxProps) {
  const combobox = useCombobox();
  const content = useContext(ContentContext);
  const rest = omit(props, "class", "ref", "children");

  const Item = (itemProps: { option: ComboboxOption }) => {
    const option = itemProps.option;
    const chosen = () => combobox.isChosen(option.value);
    const off = () => !!option.disabled || (combobox.atMax() && !chosen());
    return (
      <li
        id={combobox.optionId(option.value)}
        role="option"
        class={[styles.item, "yosegi-combobox-item"]}
        title={option.label}
        aria-selected={chosen() ? "true" : "false"}
        aria-disabled={off() ? "true" : undefined}
        data-item=""
        data-value={option.value}
        data-active={dataAttr(combobox.active() === option.value)}
        data-disabled={dataAttr(off())}
        onPointerMove={() => !off() && combobox.setActive(option.value)}
        onClick={() => combobox.pick(option.value)}
      >
        <Show when={combobox.multiple()}>
          <span class={[styles["item-checkbox"], "yosegi-combobox-item-checkbox"]} aria-hidden="true">
            <Show when={chosen()}>
              <TickIcon />
            </Show>
          </span>
        </Show>
        <span class={[styles["item-label"], "yosegi-combobox-item-label"]}>
          {props.children ? props.children(option) : option.label}
        </span>
        <Show when={!combobox.multiple() && chosen()}>
          <TickIcon />
        </Show>
      </li>
    );
  };

  const skeleton = () => (
    <div class={[styles.skeleton, "yosegi-combobox-skeleton"]} aria-hidden="true">
      <For each={[72, 56, 64, 48]}>
        {(width) => (
          <div class={[styles["skeleton-row"], "yosegi-combobox-skeleton-row"]}>
            <Show when={combobox.multiple()}>
              <span class={[styles["skeleton-bar"], "yosegi-combobox-skeleton-bar"]} data-shape="box" />
            </Show>
            <span
              class={[styles["skeleton-bar"], "yosegi-combobox-skeleton-bar"]}
              style={{ "--yosegi-skeleton-width": `${width}%` }}
            />
          </div>
        )}
      </For>
    </div>
  );

  const limitReached = () => combobox.atMax();
  const nothingFound = () =>
    combobox.query().trim() !== "" &&
    !combobox.tooShort() &&
    combobox.visible().length === 0 &&
    combobox.createQuery() === undefined;

  return (
    <>
      <Show when={combobox.error()}>
        <div role="alert" class={[styles.error, "yosegi-combobox-error"]}>
          <p class={[styles["error-title"], "yosegi-combobox-error-title"]}>{combobox.errorText()}</p>
          <p>Check your connection, then try again.</p>
          <Button label="Try again" variant="outline" size="sm" onClick={() => combobox.retry()} />
        </div>
      </Show>
      <Show when={!combobox.error()}>
        <Show when={combobox.loading() && combobox.visible().length === 0} fallback={undefined}>
          {skeleton()}
        </Show>
        <ul
          {...rest}
          ref={[(el: HTMLUListElement) => combobox.setListbox(el), props.ref as any]}
          id={combobox.listboxId}
          role="listbox"
          aria-multiselectable={combobox.multiple() ? "true" : undefined}
          aria-labelledby={document.getElementById(combobox.field.labelId) ? combobox.field.labelId : undefined}
          aria-label={document.getElementById(combobox.field.labelId) ? undefined : "Options"}
          class={[styles.listbox, "yosegi-combobox-listbox", props.class]}
        >
          <For each={groupOptions(combobox.visible())}>
            {(group, index) =>
              group.name === undefined ? (
                <For each={group.options}>{(option) => <Item option={option} />}</For>
              ) : (
                <li role="presentation">
                  <div
                    id={`${combobox.listboxId}-group-${index()}`}
                    class={[styles.section, "yosegi-combobox-section"]}
                  >
                    {group.name}
                  </div>
                  <ul
                    role="group"
                    aria-labelledby={`${combobox.listboxId}-group-${index()}`}
                    class={[styles.group, "yosegi-combobox-group"]}
                  >
                    <For each={group.options}>{(option) => <Item option={option} />}</For>
                  </ul>
                </li>
              )
            }
          </For>
          <Show when={combobox.createQuery()}>
            {(query) => (
              <>
                <Show when={combobox.visible().length > 0}>
                  <li role="separator" class={[styles.separator, "yosegi-combobox-separator"]} />
                </Show>
                <li
                  id={combobox.optionId(CREATE)}
                  role="option"
                  aria-selected="false"
                  class={[styles.item, styles.create, "yosegi-combobox-item", "yosegi-combobox-create"]}
                  data-item=""
                  data-value={CREATE}
                  data-active={dataAttr(combobox.active() === CREATE)}
                  onPointerMove={() => combobox.setActive(CREATE)}
                  onClick={() => combobox.pickActive()}
                >
                  <PlusIcon />
                  <span class={[styles["item-label"], "yosegi-combobox-item-label"]}>Create “{query()}”</span>
                </li>
              </>
            )}
          </Show>
        </ul>
        <Show when={nothingFound() && !combobox.loading()}>
          <p class={[styles.empty, "yosegi-combobox-empty"]}>{content.emptyText(combobox.query().trim())}</p>
        </Show>
        <Show when={combobox.tooShort()}>
          <p class={[styles.hint, "yosegi-combobox-hint"]}>
            Type {combobox.minQueryLength()} or more letters to search.
          </p>
        </Show>
        <Show when={limitReached()}>
          <p class={[styles.hint, "yosegi-combobox-hint"]}>
            {combobox.chosen().length} of {combobox.max()} chosen. Remove one to pick another.
          </p>
        </Show>
        <Show when={combobox.hint() && !combobox.tooShort() && !limitReached()}>
          <p class={[styles.hint, "yosegi-combobox-hint"]}>{combobox.hint()}</p>
        </Show>
        <Show when={combobox.multiple() && combobox.chosen().length > 0}>
          <div class={[styles.footer, "yosegi-combobox-footer"]}>
            <span aria-live="polite">{combobox.chosen().length} chosen</span>
            <Show when={combobox.clearable()}>
              <Button label="Clear all" variant="ghost" size="sm" onClick={() => combobox.clearAll()} />
            </Show>
          </div>
        </Show>
      </Show>
    </>
  );
}

const { Layout: FieldLayout, ...fieldParts } = createFieldParts(
  () => useCombobox().field,
  { label: styles.label, description: styles.description, errorMessage: styles["error-message"] },
  "yosegi-combobox",
);

// Clicking the label focuses the box without opening it, as for Select.
function Label(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
  const combobox = useCombobox();
  const rest = omit(props, "onClick", "children");
  return (
    <fieldParts.Label
      {...rest}
      onClick={(event: MouseEvent) => {
        callHandler(props.onClick, event);
        event.preventDefault();
        const ref = combobox.reference();
        (ref?.matches("button") ? ref : ref?.querySelector<HTMLElement>(".yosegi-combobox-trigger"))?.focus();
      }}
    >
      {props.children}
    </fieldParts.Label>
  );
}

export const Combobox = Object.assign(ComboboxRoot, {
  Label,
  Trigger,
  Value,
  Control,
  Chips,
  Description: fieldParts.Description,
  ErrorMessage: fieldParts.ErrorMessage,
  Portal,
  Content,
  Search,
  Listbox,
});
