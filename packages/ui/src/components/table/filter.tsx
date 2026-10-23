import type { JSX } from "@solidjs/web";
import {
  children,
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  For,
  omit,
  onCleanup,
  Show,
  untrack,
  useContext,
} from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { callHandler, focusFirst, getFocusable } from "../../primitives/dom";
import { CloseIcon, FilterIcon } from "../../primitives/icons";
import { Portal } from "../../primitives/portal";
import { Button, type ButtonProps } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import styles from "./filter.module.scss";

export type FilterRangeValue = { from?: number; to?: number };
export type FilterValue = Record<string, string[] | FilterRangeValue>;

interface SectionInfo {
  title: () => string;
  type: "options" | "range";
  /** Each option's label, by value. */
  labels: Map<string, () => string>;
  format?: (value: number) => string;
}

interface FilterContextValue {
  value: () => FilterValue;
  draft: () => FilterValue;
  setDraftKey: (name: string, value: string[] | FilterRangeValue | undefined) => void;
  open: () => boolean;
  openPanel: () => void;
  /** Closes without applying the draft, and puts focus back on the Filter button. */
  close: () => void;
  apply: () => void;
  clearAll: () => void;
  remove: (name: string) => void;
  /** How many filters are on. */
  activeCount: () => number;
  /** What the draft would give, for the Show button; undefined while counting or without resultCount. */
  draftCount: () => number | undefined;
  noun: () => string;
  sections: () => Map<string, SectionInfo>;
  register: (name: string, info: SectionInfo) => void;
  unregister: (name: string) => void;
  /** Changes whenever a section or option registers, so chips can read their labels. */
  version: () => number;
  bump: () => void;
  contentId: string;
  setTrigger: (el: HTMLElement) => void;
  setContent: (el: HTMLElement) => void;
}

const FilterContext = createContext<FilterContextValue>();
const useFilter = () => useContext(FilterContext);

const isActive = (value: string[] | FilterRangeValue | undefined) =>
  Array.isArray(value) ? value.length > 0 : !!value && (value.from !== undefined || value.to !== undefined);

const clean = (value: FilterValue) =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => isActive(v))) as FilterValue;

/** A Filter button and a side panel with every filterable column; Show applies them together. */
export interface FilterProps {
  value?: FilterValue;
  defaultValue?: FilterValue;
  /** Called when people press Show, Clear all, or remove a chip. */
  onChange?: (value: FilterValue) => void;
  /** How many results the draft would give, for the Show button. */
  resultCount?: (draft: FilterValue) => number | Promise<number>;
  /** What is filtered: “Show 28 invoices”. “results” by default. */
  noun?: string;
  children?: JSX.Element;
}

function FilterRoot(props: FilterProps) {
  const [value, setValue] = createControllableSignal<FilterValue>({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? {},
    onChange: (next) => props.onChange?.(next),
    equals: () => false,
  });
  const [draft, setDraft] = createSignal<FilterValue>({}, { ownedWrite: true });
  const [open, setOpen] = createSignal(false, { ownedWrite: true });
  const [draftCount, setDraftCount] = createSignal<number | undefined>(undefined, { ownedWrite: true });
  const [sections, setSections] = createSignal(new Map<string, SectionInfo>(), { ownedWrite: true });
  const [version, setVersion] = createSignal(0, { ownedWrite: true });
  const [trigger, setTrigger] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const [content, setContent] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });

  const close = () => {
    setOpen(false);
    trigger()?.focus();
  };

  // Count what the draft would give. A slow answer for an older draft never
  // replaces a newer one.
  let counting = 0;
  createEffect(
    () => (open() ? ([draft(), props.resultCount] as const) : undefined),
    (opened) => {
      const [current, resultCount] = opened ?? [];
      if (!current || !resultCount) return;
      const ticket = ++counting;
      const result = resultCount(clean(current));
      if (typeof result === "number") return void setDraftCount(result);
      setDraftCount(undefined);
      result.then((count) => ticket === counting && setDraftCount(count)).catch(() => {});
    },
  );

  // Focus moves into the panel's first section when it opens.
  createEffect(
    () => (open() ? content() : undefined),
    (el) => {
      if (!el) return;
      const body = el.querySelector<HTMLElement>("[data-filter-body]") ?? el;
      focusFirst(body);
      if (!el.contains(document.activeElement)) requestAnimationFrame(() => focusFirst(body));
    },
  );

  return (
    <FilterContext
      value={{
        value,
        draft,
        setDraftKey: (name, next) => setDraft((current) => ({ ...current, [name]: next ?? [] })),
        open,
        openPanel: () => {
          setDraft({ ...untrack(value) });
          setOpen(true);
        },
        close,
        apply: () => {
          setValue(clean(untrack(draft)));
          close();
        },
        clearAll: () => {
          setDraft({});
          setValue({});
        },
        remove: (name) => {
          const next = { ...untrack(value) };
          delete next[name];
          setValue(next);
        },
        activeCount: () => Object.values(value()).filter(isActive).length,
        draftCount,
        noun: () => props.noun ?? "results",
        sections,
        register: (name, info) => {
          setSections((map) => new Map(map).set(name, info));
          setVersion((v) => v + 1);
        },
        unregister: (name) =>
          setSections((map) => {
            const next = new Map(map);
            next.delete(name);
            return next;
          }),
        version,
        bump: () => setVersion((v) => v + 1),
        contentId: `yosegi-filter-${createUniqueId()}`,
        setTrigger,
        setContent,
      }}
    >
      {props.children}
    </FilterContext>
  );
}

/** An outline Button: funnel, “Filter” and the count. */
function Trigger(props: Omit<ButtonProps, "icon">) {
  const filter = useFilter();
  const rest = omit(props, "class", "ref", "onClick", "children");

  return (
    <Button
      variant="outline"
      {...rest}
      ref={[(el: HTMLButtonElement) => filter.setTrigger(el), props.ref as any]}
      class={["yosegi-filter-trigger", props.class].filter(Boolean).join(" ")}
      icon={<FilterIcon />}
      aria-haspopup="dialog"
      aria-expanded={filter.open() ? "true" : "false"}
      aria-controls={filter.contentId}
      aria-pressed={filter.open() ? "true" : undefined}
      onClick={(event: MouseEvent) => {
        callHandler(props.onClick, event);
        if (!event.defaultPrevented) filter.openPanel();
      }}
      label={
        <>
          {props.children ?? "Filter"}
          <Show when={filter.activeCount() > 0}>
            <span class={[styles.count, "yosegi-filter-count"]} aria-label={`${filter.activeCount()} on`}>
              {filter.activeCount()}
            </span>
          </Show>
        </>
      }
    />
  );
}

/** A removable chip per active section, then Clear all. */
function Chips(props: JSX.HTMLAttributes<HTMLSpanElement>) {
  const filter = useFilter();
  const rest = omit(props, "class", "children");

  const chipText = (name: string, value: string[] | FilterRangeValue) => {
    filter.version();
    const info = filter.sections().get(name);
    if (Array.isArray(value)) return value.map((v) => info?.labels.get(v)?.() ?? v).join(", ");
    const format = info?.format ?? String;
    if (value.from !== undefined && value.to !== undefined) return `${format(value.from)}–${format(value.to)}`;
    return value.from !== undefined ? `over ${format(value.from)}` : `under ${format(value.to!)}`;
  };

  return (
    <Show when={filter.activeCount() > 0}>
      <span {...rest} class={[styles.chips, "yosegi-filter-chips", props.class]}>
        <For each={Object.entries(filter.value()).filter(([, v]) => isActive(v))}>
          {([name, value]) => {
            const title = () => (filter.version(), filter.sections().get(name)?.title() ?? name);
            return (
              <span class={[styles.chip, "yosegi-filter-chip"]}>
                <span class={[styles["chip-column"], "yosegi-filter-chip-column"]}>{title()}</span>
                <span class={[styles["chip-value"], "yosegi-filter-chip-value"]}>{chipText(name, value)}</span>
                <button
                  type="button"
                  class={[styles["chip-remove"], "yosegi-filter-chip-remove"]}
                  aria-label={`Remove ${title()} filter`}
                  onClick={() => filter.remove(name)}
                >
                  <CloseIcon />
                </button>
              </span>
            );
          }}
        </For>
        <Button label="Clear all" variant="ghost" size="sm" onClick={() => filter.clearAll()} />
      </span>
    </Show>
  );
}

/** The dimmed page behind the panel; a click on it closes the panel. */
function Overlay(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const filter = useFilter();
  const rest = omit(props, "class", "onClick", "children");
  return (
    <Show when={filter.open()}>
      <div
        aria-hidden="true"
        {...rest}
        class={[styles.overlay, "yosegi-filter-overlay", props.class]}
        onClick={(event) => {
          callHandler(props.onClick, event);
          filter.close();
        }}
      />
    </Show>
  );
}

/**
 * The side panel (role="dialog"). Header and Footer stay put; the sections
 * between them scroll. It stays in the page while closed, hidden and inert,
 * so the chips can still read the sections' titles and labels.
 */
function Content(props: JSX.HTMLAttributes<HTMLElement>) {
  const filter = useFilter();
  const rest = omit(props, "class", "ref", "onKeyDown", "children");
  const resolved = children(() => props.children);
  const is = (node: unknown, part: string) => node instanceof Element && node.classList.contains(`yosegi-filter-${part}`);
  const parts = () => {
    const nodes = resolved.toArray();
    return {
      header: nodes.filter((node) => is(node, "header")),
      body: nodes.filter((node) => !is(node, "header") && !is(node, "footer")),
      footer: nodes.filter((node) => is(node, "footer")),
    };
  };

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Filters"
      {...rest}
      ref={[(el: HTMLElement) => filter.setContent(el), props.ref as any]}
      id={filter.contentId}
      class={[styles.content, "yosegi-filter-content", props.class]}
      hidden={!filter.open()}
      inert={!filter.open()}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        if (event.defaultPrevented) return;
        if (event.key === "Escape") {
          event.preventDefault();
          filter.close();
        } else if (event.key === "Tab") {
          // Focus stays inside the panel.
          const focusable = getFocusable(event.currentTarget);
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      {parts().header}
      <div class={[styles.body, "yosegi-filter-body"]} data-filter-body="">
        {parts().body}
      </div>
      {parts().footer}
    </aside>
  );
}

/** The title and a close button. */
function Header(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const filter = useFilter();
  const rest = omit(props, "class", "children");
  return (
    <div {...rest} class={[styles.header, "yosegi-filter-header", props.class]}>
      <h2 class={[styles.title, "yosegi-filter-title"]}>{props.children ?? "Filters"}</h2>
      <Button variant="ghost" size="sm" icon={<CloseIcon />} aria-label="Close" onClick={() => filter.close()} />
    </div>
  );
}

interface SectionContextValue {
  name: string;
  title: () => string;
  labels: Map<string, () => string>;
  setFormat: (format: ((value: number) => string) | undefined) => void;
}

const SectionContext = createContext<SectionContextValue>();
const useSection = () => useContext(SectionContext);

export interface FilterSectionProps extends Omit<JSX.HTMLAttributes<HTMLElement>, "title"> {
  /** The key in the filter value. */
  name: string;
  title: JSX.Element;
  /** options (default) or range. */
  type?: "options" | "range";
}

/** One column: its title, Clear, and its options or range. */
function Section(props: FilterSectionProps) {
  const filter = useFilter();
  const id = `yosegi-filter-section-${createUniqueId()}`;
  const rest = omit(props, "name", "title", "type", "class", "children");
  let titleEl: HTMLHeadingElement | undefined;
  const info: SectionInfo = {
    title: () => titleEl?.textContent ?? props.name,
    type: props.type ?? "options",
    labels: new Map(),
  };
  filter.register(props.name, info);
  onCleanup(() => filter.unregister(props.name));

  return (
    <SectionContext
      value={{
        name: props.name,
        title: info.title,
        labels: info.labels,
        setFormat: (format) => {
          info.format = format;
          filter.bump();
        },
      }}
    >
      <section {...rest} aria-labelledby={id} class={[styles.section, "yosegi-filter-section", props.class]}>
        <div class={[styles["section-header"], "yosegi-filter-section-header"]}>
          <h3 ref={(el: HTMLHeadingElement) => (titleEl = el)} id={id} class={[styles["section-title"], "yosegi-filter-section-title"]}>
            {props.title}
          </h3>
          <Show when={isActive(filter.draft()[props.name])}>
            <button
              type="button"
              class={[styles["section-clear"], "yosegi-filter-section-clear"]}
              onClick={() => filter.setDraftKey(props.name, undefined)}
            >
              Clear
            </button>
          </Show>
        </div>
        {props.children}
      </section>
    </SectionContext>
  );
}

export interface FilterOptionProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string;
  /** How many results have this value. */
  count?: number;
  disabled?: boolean;
}

/** A Checkbox with the value and its count. */
function Option(props: FilterOptionProps) {
  const filter = useFilter();
  const section = useSection();
  const rest = omit(props, "value", "count", "disabled", "class", "children");
  let labelEl: HTMLSpanElement | undefined;
  section.labels.set(props.value, () => labelEl?.textContent ?? props.value);
  filter.bump();

  const chosen = () => {
    const current = filter.draft()[section.name];
    return Array.isArray(current) && current.includes(props.value);
  };

  return (
    <Checkbox
      {...rest}
      class={[styles.option, "yosegi-filter-option", props.class].filter(Boolean).join(" ")}
      checked={chosen()}
      disabled={props.disabled}
      onChange={(on) => {
        const current = filter.draft()[section.name];
        const list = Array.isArray(current) ? current.filter((v) => v !== props.value) : [];
        filter.setDraftKey(section.name, on ? [...list, props.value] : list);
      }}
    >
      <Checkbox.Input />
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Label>
        <span ref={(el: HTMLSpanElement) => (labelEl = el)}>{props.children}</span>
        <Show when={props.count !== undefined}>
          <span class={[styles["option-count"], "yosegi-filter-option-count"]}>
            <span class={styles["visually-hidden"]}>, </span>
            {props.count}
          </span>
        </Show>
      </Checkbox.Label>
    </Checkbox>
  );
}

export interface FilterRangeProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** The chip text for a value: “over $100”. */
  format?: (value: number) => string;
  placeholderFrom?: string;
  placeholderTo?: string;
}

/** Two inputs, from and to. */
function Range(props: FilterRangeProps) {
  const filter = useFilter();
  const section = useSection();
  const rest = omit(props, "format", "placeholderFrom", "placeholderTo", "class", "children");
  section.setFormat(props.format);

  const current = () => {
    const value = filter.draft()[section.name];
    return value && !Array.isArray(value) ? value : {};
  };
  const parse = (text: string) => {
    const number = Number.parseFloat(text.replace(/[^\d.-]/g, ""));
    return Number.isFinite(number) ? number : undefined;
  };
  const set = (end: "from" | "to", text: string) => filter.setDraftKey(section.name, { ...current(), [end]: parse(text) });

  return (
    <div {...rest} class={[styles.range, "yosegi-filter-range", props.class]}>
      <input
        type="text"
        inputmode="decimal"
        aria-label={`${section.title()} from`}
        placeholder={props.placeholderFrom ?? "Any"}
        value={current().from ?? ""}
        onChange={(event) => set("from", event.currentTarget.value)}
      />
      <span>to</span>
      <input
        type="text"
        inputmode="decimal"
        aria-label={`${section.title()} to`}
        placeholder={props.placeholderTo ?? "Any"}
        value={current().to ?? ""}
        onChange={(event) => set("to", event.currentTarget.value)}
      />
    </div>
  );
}

/** Clear all and “Show N …”. */
function Footer(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const filter = useFilter();
  const rest = omit(props, "class", "children");
  const label = () => {
    const count = filter.draftCount();
    return count === undefined ? `Show ${filter.noun()}` : `Show ${count} ${filter.noun()}`;
  };
  return (
    <div {...rest} class={[styles.footer, "yosegi-filter-footer", props.class]}>
      <Button label="Clear all" variant="ghost" onClick={() => filter.clearAll()} />
      <Button label={label()} onClick={() => filter.apply()} />
    </div>
  );
}

export const Filter = Object.assign(FilterRoot, {
  Trigger,
  Chips,
  Portal,
  Overlay,
  Content,
  Header,
  Section,
  Option,
  Range,
  Footer,
});
