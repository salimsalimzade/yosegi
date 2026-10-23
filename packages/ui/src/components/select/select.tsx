import type { JSX } from "@solidjs/web";
import { children, createContext, createEffect, createMemo, createSignal, createUniqueId, For, omit, Show, untrack, useContext } from "solid-js";
import { nextItem } from "../../primitives/active-descendant";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createDismiss } from "../../primitives/create-dismiss";
import { createField, type Field, type FieldState, type FieldTextProps } from "../../primitives/create-field";
import { createFloating, type Placement } from "../../primitives/create-floating";
import { callHandler, dataAttr } from "../../primitives/dom";
import { createFieldParts } from "../../primitives/field-parts";
import { ChevronDownIcon, TickIcon } from "../../primitives/icons";
import {
  groupOptions,
  optionKey,
  resolveOptions,
  type Option,
  type OptionAccessors,
  type ResolvedOption,
} from "../../primitives/option-groups";
import { Portal } from "../../primitives/portal";
import styles from "./select.module.scss";

export type SelectOption = Option;

type Direction = "next" | "prev" | "first" | "last";

interface SelectContextValue {
  field: Field;
  options: () => SelectOption[];
  value: () => string | null;
  selected: () => SelectOption | undefined;
  open: () => boolean;
  active: () => string | undefined;
  setActive: (value: string | undefined) => void;
  /** Opens the list with the chosen option highlighted, or the first, the last or a given one. */
  openList: (highlight?: "first" | "last" | { value: string }) => void;
  close: () => void;
  select: (option: SelectOption) => void;
  move: (direction: Direction) => void;
  /** Moves to the option whose label starts with what's typed. */
  typeahead: (key: string) => void;
  /** True while letters typed for typeahead are still building up. */
  typing: () => boolean;
  listboxId: string;
  optionId: (value: string) => string;
  trigger: () => HTMLElement | undefined;
  setTrigger: (el: HTMLElement) => void;
  setContent: (el: HTMLElement | undefined) => void;
  setListbox: (el: HTMLElement | undefined) => void;
}

const SelectContext = createContext<SelectContextValue>();
const useSelect = () => useContext(SelectContext);

/**
 * A button that opens a short list (about 3–10 options) to pick one. No search;
 * for longer lists use Combobox. With no children it builds itself from label,
 * placeholder, description and errorMessage.
 */
export interface SelectProps<T = SelectOption>
  extends FieldState, FieldTextProps, OptionAccessors<T>, Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** { value, label, group?, disabled? }, or your own objects read through getOptionValue and getOptionLabel. */
  options: readonly T[];
  value?: string | null;
  defaultValue?: string | null;
  /** The picked option's value, and the option itself. */
  onChange?: (value: string, option: T) => void;
  /** bottom-start by default. */
  placement?: Placement;
  /** Sends the value with a form. */
  name?: string;
  /** Shown in the box until something is picked. */
  placeholder?: JSX.Element;
  /** Renders each row's content, like an icon or a detail on the right. The tick and keys stay the same. */
  renderOption?: (option: T) => JSX.Element;
}

const firstEnabled = (list: SelectOption[], from: "first" | "last" = "first") =>
  (from === "first" ? list : [...list].reverse()).find((option) => !option.disabled)?.value;

function SelectRoot<T = SelectOption>(props: SelectProps<T>) {
  const id = `yosegi-select-${createUniqueId()}`;
  const field = createField(props, "yosegi-select");
  const options = createMemo(() => resolveOptions(props.options, props));
  const itemFor = (value: string) => untrack(options).find((option) => option.value === value)?.item as T;
  const [value, setValue] = createControllableSignal<string | null>({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? null,
    onChange: (next) => next !== null && props.onChange?.(next, itemFor(next)),
  });
  const [open, setOpen] = createSignal(false, { ownedWrite: true });
  const [active, setActive] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  const element = () => createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const [trigger, setTrigger] = element();
  const [content, setContent] = element();
  const [listbox, setListbox] = element();

  const selected = () => options().find((option) => option.value === value());
  const optionId = (option: string) => `${id}-option-${optionKey(option)}`;

  const openList: SelectContextValue["openList"] = (highlight) => {
    if (field.disabled() || field.readOnly()) return;
    const current = untrack(selected);
    setOpen(true);
    if (typeof highlight === "object") setActive(highlight.value);
    else if (!highlight && current && !current.disabled) setActive(current.value);
    else setActive(firstEnabled(options(), highlight === "last" ? "last" : "first"));
  };

  const close = () => {
    setOpen(false);
    setActive(undefined);
  };

  // Like a native select: letters typed within half a second build up a
  // prefix, and one letter pressed again moves on to the next option with it.
  let typed = "";
  let typedTimer: ReturnType<typeof setTimeout> | undefined;
  const typeahead = (key: string) => {
    clearTimeout(typedTimer);
    typedTimer = setTimeout(() => (typed = ""), 500);
    typed += key.toLocaleLowerCase();

    const enabled = untrack(options).filter((option) => !option.disabled);
    const current = untrack(open) ? untrack(active) : untrack(value);
    const index = enabled.findIndex((option) => option.value === current);
    const repeated = [...typed].every((char) => char === typed[0]);
    const needle = repeated ? typed[0] : typed;
    const start = repeated ? index + 1 : Math.max(index, 0);
    const match = [...enabled.slice(start), ...enabled.slice(0, start)].find((option) =>
      option.label.toLocaleLowerCase().startsWith(needle),
    );
    if (!match) return;
    if (untrack(open)) setActive(match.value);
    else openList({ value: match.value });
  };

  createFloating({
    open,
    reference: trigger,
    floating: content,
    placement: () => props.placement ?? "bottom-start",
    gutter: () => 4,
    sameWidth: () => true,
    name: "select",
  });

  createDismiss({
    enabled: open,
    inside: () => [content(), trigger()],
    onDismiss: close,
  });

  // Keep the highlighted option in view, including the chosen one on opening.
  createEffect(
    () => [open() && active(), listbox()] as const,
    ([current, list]) => {
      if (current && list) document.getElementById(optionId(current))?.scrollIntoView({ block: "nearest" });
    },
  );

  const rest = omit(
    props,
    "options", "value", "defaultValue", "onChange", "placement", "name", "label", "description", "errorMessage", "placeholder", "renderOption",
    "getOptionValue", "getOptionLabel", "getOptionGroup", "getOptionDisabled",
    "validationState", "required", "disabled", "readOnly", "class", "children", "aria-label",
  );

  return (
    <SelectContext
      value={{
        field,
        options,
        value,
        selected,
        open,
        active,
        setActive,
        openList,
        close,
        select: (option) => {
          if (option.disabled) return;
          setValue(option.value);
          close();
          trigger()?.focus();
        },
        move: (direction) => {
          const item = nextItem(listbox(), active(), direction);
          if (item) setActive(item.dataset.value);
        },
        typeahead,
        typing: () => typed !== "",
        listboxId: `${id}-listbox`,
        optionId,
        trigger,
        setTrigger,
        setContent,
        setListbox,
      }}
    >
      <div
        {...rest}
        class={[styles.root, "yosegi-select", props.class]}
        data-expanded={dataAttr(open())}
        data-invalid={dataAttr(field.invalid())}
        data-disabled={dataAttr(field.disabled())}
        data-readonly={dataAttr(field.readOnly())}
        // Without parts, the name goes on the box, which is what gets focus.
        aria-label={"children" in props ? props["aria-label"] : undefined}
      >
        {"children" in props ? (
          props.children
        ) : (
          <FieldLayout label={props.label} description={props.description} labelPart={Label}>
            <Trigger aria-label={props["aria-label"]}>
              <Value placeholder={props.placeholder} />
            </Trigger>
            <Portal>
              <Content>
                <Listbox children={props.renderOption && ((option) => props.renderOption!((option as ResolvedOption<T>).item))} />
              </Content>
            </Portal>
          </FieldLayout>
        )}
        <Show when={props.name}>
          <input type="hidden" name={props.name} value={value() ?? ""} />
        </Show>
      </div>
    </SelectContext>
  );
}

const isPrintable = (event: KeyboardEvent) => event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

/** The box: a button with the chevron after its children, Select.Value by default. */
function Trigger(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const select = useSelect();
  const rest = omit(props, "class", "ref", "onClick", "onKeyDown", "onBlur", "children");
  const label = children(() => props.children);

  const closedKeys: Record<string, () => void> = {
    ArrowDown: () => select.openList(),
    ArrowUp: () => select.openList(),
    Enter: () => select.openList(),
    " ": () => select.openList(),
    Home: () => select.openList("first"),
    End: () => select.openList("last"),
  };
  const pick = () => {
    const option = select.options().find((o) => o.value === select.active());
    if (option) select.select(option);
  };
  const openKeys: Record<string, () => void> = {
    ArrowDown: () => select.move("next"),
    ArrowUp: () => select.move("prev"),
    Home: () => select.move("first"),
    End: () => select.move("last"),
    Enter: pick,
    " ": pick,
    Escape: () => select.close(),
  };

  return (
    <button
      type="button"
      {...rest}
      ref={[(el: HTMLButtonElement) => select.setTrigger(el), props.ref as any]}
      id={select.field.controlId}
      class={[styles.trigger, "yosegi-select-trigger", props.class]}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={select.open() ? "true" : "false"}
      aria-controls={select.listboxId}
      aria-activedescendant={select.open() && select.active() ? select.optionId(select.active()!) : undefined}
      aria-required={select.field.required() ? "true" : undefined}
      aria-invalid={select.field.invalid() ? "true" : undefined}
      aria-readonly={select.field.readOnly() ? "true" : undefined}
      aria-describedby={select.field.describedBy()}
      aria-errormessage={select.field.errorMessage()}
      disabled={select.field.disabled()}
      onClick={(event) => {
        callHandler(props.onClick, event);
        if (event.defaultPrevented) return;
        if (select.open()) select.close();
        else select.openList();
      }}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        if (event.defaultPrevented) return;

        if (select.open()) {
          // Tab closes and moves on as usual.
          if (event.key === "Tab") return select.close();
          // A space while a label is being typed is part of the label.
          const action = event.key === " " && select.typing() ? undefined : openKeys[event.key];
          if (action) {
            event.preventDefault();
            action();
          } else if (isPrintable(event)) {
            event.preventDefault();
            select.typeahead(event.key);
          }
          return;
        }

        const action = closedKeys[event.key];
        if (action) {
          event.preventDefault();
          action();
        } else if (isPrintable(event)) {
          event.preventDefault();
          select.typeahead(event.key);
        }
      }}
      onBlur={(event) => {
        select.close();
        callHandler(props.onBlur, event);
      }}
    >
      {label.toArray().length > 0 ? label() : <Value />}
      <ChevronDownIcon />
    </button>
  );
}

/** The chosen option's label, or the placeholder. */
function Value(props: JSX.HTMLAttributes<HTMLSpanElement> & { placeholder?: JSX.Element }) {
  const select = useSelect();
  const rest = omit(props, "class", "placeholder", "children");
  return (
    <span {...rest} class={[styles.value, "yosegi-select-value", props.class]} data-placeholder-shown={dataAttr(!select.selected())}>
      {select.selected()?.label ?? props.placeholder}
    </span>
  );
}

/** The floating list; renders the Listbox by itself when it has no children. */
function Content(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const select = useSelect();
  const rest = omit(props, "class", "ref", "onPointerDown", "children");
  const resolved = children(() => props.children);

  return (
    <Show when={select.open()}>
      <div
        {...rest}
        ref={[(el: HTMLDivElement) => select.setContent(el), props.ref as any]}
        class={[styles.content, "yosegi-select-content", props.class]}
        onPointerDown={(event) => {
          callHandler(props.onPointerDown, event);
          // Clicking an option mustn't take focus from the box.
          event.preventDefault();
        }}
      >
        {resolved.toArray().length > 0 ? resolved() : <Listbox />}
      </div>
    </Show>
  );
}

export interface SelectListboxProps extends Omit<JSX.HTMLAttributes<HTMLUListElement>, "children"> {
  /** Render each option's content yourself. */
  children?: (option: SelectOption) => JSX.Element;
}

/** The options, with a heading over each group. */
function Listbox(props: SelectListboxProps) {
  const select = useSelect();
  const rest = omit(props, "class", "ref", "children");

  const Item = (itemProps: { option: SelectOption }) => {
    const option = itemProps.option;
    const chosen = () => select.value() === option.value;
    return (
      <li
        id={select.optionId(option.value)}
        role="option"
        class={[styles.item, "yosegi-select-item"]}
        title={option.label}
        aria-selected={chosen() ? "true" : "false"}
        aria-disabled={option.disabled ? "true" : undefined}
        data-item=""
        data-value={option.value}
        data-active={dataAttr(select.active() === option.value)}
        data-disabled={dataAttr(option.disabled)}
        onPointerMove={() => !option.disabled && select.setActive(option.value)}
        onClick={() => select.select(option)}
      >
        <span class={[styles["item-label"], "yosegi-select-item-label"]}>{props.children ? props.children(option) : option.label}</span>
        <Show when={chosen()}>
          <TickIcon />
        </Show>
      </li>
    );
  };

  return (
    <ul
      {...rest}
      ref={[(el: HTMLUListElement) => select.setListbox(el), props.ref as any]}
      id={select.listboxId}
      role="listbox"
      // Named by the Label, or by the box when there's no Label.
      aria-labelledby={document.getElementById(select.field.labelId) ? select.field.labelId : select.field.controlId}
      class={[styles.listbox, "yosegi-select-listbox", props.class]}
    >
      <For each={groupOptions(select.options())}>
        {(group, index) =>
          group.name === undefined ? (
            <For each={group.options}>{(option) => <Item option={option} />}</For>
          ) : (
            <li role="presentation">
              <div id={`${select.listboxId}-group-${index()}`} class={[styles.section, "yosegi-select-section"]}>
                {group.name}
              </div>
              <ul role="group" aria-labelledby={`${select.listboxId}-group-${index()}`} class={[styles.group, "yosegi-select-group"]}>
                <For each={group.options}>{(option) => <Item option={option} />}</For>
              </ul>
            </li>
          )
        }
      </For>
    </ul>
  );
}

const { Layout: FieldLayout, ...fieldParts } = createFieldParts(
  () => useSelect().field,
  { label: styles.label, description: styles.description, errorMessage: styles["error-message"] },
  "yosegi-select",
);

// A label on a button would click it and open the list; like a native
// select, clicking the label only focuses the box.
function Label(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
  const select = useSelect();
  const rest = omit(props, "onClick", "children");
  return (
    <fieldParts.Label
      {...rest}
      onClick={(event: MouseEvent) => {
        callHandler(props.onClick, event);
        event.preventDefault();
        select.trigger()?.focus();
      }}
    >
      {props.children}
    </fieldParts.Label>
  );
}

export const Select = Object.assign(SelectRoot, {
  Label,
  Trigger,
  Value,
  Description: fieldParts.Description,
  ErrorMessage: fieldParts.ErrorMessage,
  Portal,
  Content,
  Listbox,
});
