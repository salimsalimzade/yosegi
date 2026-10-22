import type { JSX } from "@solidjs/web";
import { createContext, createMemo, createSignal, createUniqueId, For, omit, Show, untrack, useContext } from "solid-js";
import { nextItem } from "../../primitives/active-descendant";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createDismiss } from "../../primitives/create-dismiss";
import { createField, type Field, type FieldState } from "../../primitives/create-field";
import { createFloating, type Placement } from "../../primitives/create-floating";
import { callHandler, dataAttr } from "../../primitives/dom";
import { createFieldParts } from "../../primitives/field-parts";
import { ChevronDownIcon, TickIcon } from "../../primitives/icons";
import { Portal } from "../../primitives/portal";
import styles from "./combobox.module.scss";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxContextValue {
  field: Field;
  options: () => ComboboxOption[];
  /** The options that match what's typed. */
  filtered: () => ComboboxOption[];
  value: () => string | null;
  selected: () => ComboboxOption | undefined;
  text: () => string;
  open: () => boolean;
  active: () => string | undefined;
  setActive: (value: string | undefined) => void;
  type: (text: string) => void;
  openList: (highlight?: "selected" | "first" | "last") => void;
  close: () => void;
  select: (option: ComboboxOption) => void;
  move: (direction: "next" | "prev" | "first" | "last") => void;
  listboxId: string;
  optionId: (value: string) => string;
  placeholder: () => string | undefined;
  setControl: (el: HTMLElement) => void;
  setContent: (el: HTMLElement | undefined) => void;
  setListbox: (el: HTMLElement | undefined) => void;
}

const ComboboxContext = createContext<ComboboxContextValue>();
const useCombobox = () => useContext(ComboboxContext);

/** A text field that suggests options as you type and lets you pick one. */
export interface ComboboxProps extends FieldState, Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  /** Called with the option's value, or null when the field is cleared. */
  onChange?: (value: string | null) => void;
  /** contains (default): the label contains what's typed. startsWith: it begins with it. */
  filter?: "contains" | "startsWith" | ((option: ComboboxOption, query: string) => boolean);
  placeholder?: string;
  /** bottom-start by default. */
  placement?: Placement;
  name?: string;
}

function ComboboxRoot(props: ComboboxProps) {
  const id = `yosegi-combobox-${createUniqueId()}`;
  const field = createField(props, "yosegi-combobox");
  const [value, setValue] = createControllableSignal<string | null>({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? null,
    onChange: (next) => props.onChange?.(next),
  });
  const [open, setOpen] = createSignal(false, { ownedWrite: true });
  // What's typed since the list opened; null shows every option.
  const [query, setQuery] = createSignal<string | null>(null, { ownedWrite: true });
  const [active, setActive] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  const element = () => createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const [control, setControl] = element();
  const [content, setContent] = element();
  const [listbox, setListbox] = element();

  const selected = () => props.options.find((option) => option.value === value());

  const matches = (option: ComboboxOption, q: string) => {
    if (typeof props.filter === "function") return props.filter(option, q);
    const label = option.label.toLocaleLowerCase();
    const needle = q.trim().toLocaleLowerCase();
    return props.filter === "startsWith" ? label.startsWith(needle) : label.includes(needle);
  };

  const filtered = createMemo(() => {
    const q = query();
    return q === null || q.trim() === "" ? props.options : props.options.filter((option) => matches(option, q));
  });

  const firstEnabled = (list: ComboboxOption[], from: "first" | "last" = "first") =>
    (from === "first" ? list : [...list].reverse()).find((option) => !option.disabled)?.value;

  const openList = (highlight: "selected" | "first" | "last" = "selected") => {
    if (field.disabled() || field.readOnly()) return;
    setOpen(true);
    const current = untrack(selected);
    setActive(highlight === "selected" && current ? current.value : firstEnabled(props.options, highlight === "last" ? "last" : "first"));
  };

  const close = () => {
    setOpen(false);
    setQuery(null);
    setActive(undefined);
  };

  const select = (option: ComboboxOption) => {
    if (option.disabled) return;
    setValue(option.value);
    close();
  };

  createFloating({
    open,
    reference: control,
    floating: content,
    placement: () => props.placement ?? "bottom-start",
    gutter: () => 4,
    sameWidth: () => true,
    name: "combobox",
  });

  createDismiss({ enabled: open, inside: () => [content(), control()], onDismiss: close });

  const rest = omit(
    props,
    "options", "value", "defaultValue", "onChange", "filter", "placeholder", "placement", "name",
    "validationState", "required", "disabled", "readOnly", "class", "children",
  );

  return (
    <ComboboxContext
      value={{
        field,
        options: () => props.options,
        filtered,
        value,
        selected,
        text: () => query() ?? selected()?.label ?? "",
        open,
        active,
        setActive,
        type: (text) => {
          setQuery(text);
          setOpen(true);
          const q = text.trim() === "" ? props.options : props.options.filter((option) => matches(option, text));
          setActive(firstEnabled(q));
          // An emptied field clears the choice.
          if (text === "") setValue(null);
        },
        openList,
        close,
        select,
        move: (direction) => {
          const item = nextItem(listbox(), active(), direction);
          if (item) setActive(item.dataset.value);
        },
        listboxId: `${id}-listbox`,
        optionId: (option) => `${id}-option-${option.replace(/[^\w-]/g, "_")}`,
        placeholder: () => props.placeholder,
        setControl,
        setContent,
        setListbox,
      }}
    >
      <div
        {...rest}
        class={[styles.root, "yosegi-combobox", props.class]}
        data-expanded={dataAttr(open())}
        data-invalid={dataAttr(field.invalid())}
        data-disabled={dataAttr(field.disabled())}
        data-readonly={dataAttr(field.readOnly())}
      >
        {props.children}
        <Show when={props.name}>
          <input type="hidden" name={props.name} value={value() ?? ""} />
        </Show>
      </div>
    </ComboboxContext>
  );
}

function Control(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const combobox = useCombobox();
  const rest = omit(props, "class", "ref", "children");

  return (
    <div
      {...rest}
      ref={[(el: HTMLDivElement) => combobox.setControl(el), props.ref as any]}
      class={[styles.control, "yosegi-combobox-control", props.class]}
    >
      {props.children}
    </div>
  );
}

function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  const combobox = useCombobox();
  const rest = omit(props, "class", "onInput", "onKeyDown", "onBlur", "onClick");

  const keys: Record<string, (event: KeyboardEvent) => void> = {
    ArrowDown: (event) => (event.altKey || !combobox.open() ? combobox.openList() : combobox.move("next")),
    ArrowUp: () => (combobox.open() ? combobox.move("prev") : combobox.openList("last")),
    Enter: () => {
      const option = combobox.filtered().find((o) => o.value === combobox.active());
      if (combobox.open() && option) combobox.select(option);
    },
    Escape: () => combobox.close(),
  };

  return (
    <input
      type="text"
      autocomplete="off"
      spellcheck={false}
      {...rest}
      id={combobox.field.controlId}
      class={[styles.input, "yosegi-combobox-input", props.class]}
      role="combobox"
      placeholder={combobox.placeholder()}
      value={combobox.text()}
      required={combobox.field.required()}
      disabled={combobox.field.disabled()}
      readonly={combobox.field.readOnly()}
      aria-autocomplete="list"
      aria-expanded={combobox.open() ? "true" : "false"}
      aria-controls={combobox.listboxId}
      aria-activedescendant={combobox.open() && combobox.active() ? combobox.optionId(combobox.active()!) : undefined}
      aria-invalid={combobox.field.invalid() ? "true" : undefined}
      aria-describedby={combobox.field.describedBy()}
      aria-errormessage={combobox.field.errorMessage()}
      onInput={(event) => {
        combobox.type(event.currentTarget.value);
        callHandler(props.onInput, event);
      }}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        const action = keys[event.key];
        if (event.defaultPrevented || !action) return;
        // Escape on a closed list is the page's to handle.
        if (event.key === "Escape" && !combobox.open()) return;
        if (event.key === "Enter" && !combobox.open()) return;
        event.preventDefault();
        action(event);
      }}
      onClick={(event) => {
        if (!combobox.open()) combobox.openList();
        callHandler(props.onClick, event);
      }}
      onBlur={(event) => {
        combobox.close();
        callHandler(props.onBlur, event);
      }}
    />
  );
}

/** Renders a chevron when it has no children. Opens and closes the list. */
function Trigger(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const combobox = useCombobox();
  const rest = omit(props, "class", "onClick", "onPointerDown", "children");

  return (
    <button
      type="button"
      // The input already opens the list from the keyboard.
      tabindex="-1"
      aria-label="Show options"
      {...rest}
      class={[styles.trigger, "yosegi-combobox-trigger", props.class]}
      aria-expanded={combobox.open() ? "true" : "false"}
      aria-controls={combobox.listboxId}
      disabled={combobox.field.disabled()}
      data-expanded={dataAttr(combobox.open())}
      // Keep focus in the input.
      onPointerDown={(event) => event.preventDefault()}
      onClick={(event) => {
        if (combobox.open()) combobox.close();
        else combobox.openList();
        document.getElementById(combobox.field.controlId)?.focus();
        callHandler(props.onClick, event);
      }}
    >
      {props.children ?? <ChevronDownIcon />}
    </button>
  );
}

export interface ComboboxContentProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Shown when nothing matches. "No results" by default. */
  emptyText?: JSX.Element;
  /** Render each option's content yourself. */
  children?: (option: ComboboxOption) => JSX.Element;
}

/** The floating list. Renders the matching options by itself. */
function Content(props: ComboboxContentProps) {
  const combobox = useCombobox();
  const rest = omit(props, "class", "ref", "emptyText", "children");

  return (
    <Show when={combobox.open()}>
      <div
        {...rest}
        ref={[(el: HTMLDivElement) => combobox.setContent(el), props.ref as any]}
        class={[styles.content, "yosegi-combobox-content", props.class]}
        // Clicking inside mustn't move focus out of the input.
        onPointerDown={(event) => event.preventDefault()}
      >
        <ul
          ref={(el: HTMLUListElement) => combobox.setListbox(el)}
          id={combobox.listboxId}
          role="listbox"
          aria-labelledby={combobox.field.labelId}
          class={[styles.listbox, "yosegi-combobox-listbox"]}
        >
          <For each={combobox.filtered()}>
            {(option) => (
              <li
                id={combobox.optionId(option.value)}
                role="option"
                class={[styles.item, "yosegi-combobox-item"]}
                aria-selected={combobox.value() === option.value ? "true" : "false"}
                aria-disabled={option.disabled ? "true" : undefined}
                data-item=""
                data-value={option.value}
                data-active={dataAttr(combobox.active() === option.value)}
                data-disabled={dataAttr(option.disabled)}
                onPointerMove={() => !option.disabled && combobox.setActive(option.value)}
                onClick={() => combobox.select(option)}
              >
                <span class={[styles["item-label"], "yosegi-combobox-item-label"]}>{props.children ? props.children(option) : option.label}</span>
                <Show when={combobox.value() === option.value}>
                  <TickIcon />
                </Show>
              </li>
            )}
          </For>
        </ul>
        <Show when={combobox.filtered().length === 0}>
          <p class={[styles.empty, "yosegi-combobox-empty"]}>{props.emptyText ?? "No results"}</p>
        </Show>
      </div>
    </Show>
  );
}

const parts = createFieldParts(
  () => useCombobox().field,
  { label: styles.label, description: styles.description, errorMessage: styles["error-message"] },
  "yosegi-combobox",
);

export const Combobox = Object.assign(ComboboxRoot, { ...parts, Control, Input, Trigger, Portal, Content });
