import type { JSX } from "@solidjs/web";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  omit,
  onSettled,
  Show,
  untrack,
  useContext,
  type Accessor,
} from "solid-js";
import { nextItem } from "../../primitives/active-descendant";
import { callHandler, dataAttr } from "../../primitives/dom";
import { SearchIcon } from "../../primitives/icons";
import { groupOptions } from "../../primitives/option-groups";
import { Dialog } from "../dialog/dialog";
import { useLocale } from "../locale-provider/locale-provider";
import styles from "./command.module.scss";

type Filter = (value: string, search: string, keywords: string[]) => boolean;

/** Visible-item counts, so a group or the whole list knows when it is empty. */
function createRegistry() {
  const [entries, setEntries] = createSignal<Accessor<boolean>[]>([], { ownedWrite: true });
  return {
    any: () => entries().some((visible) => visible()),
    register(visible: Accessor<boolean>) {
      onSettled(() => {
        setEntries((list) => [...list, visible]);
        return () => setEntries((list) => list.filter((entry) => entry !== visible));
      });
    },
  };
}

interface CommandContextValue {
  search: () => string;
  setSearch: (search: string) => void;
  matches: (value: string, keywords: string[]) => boolean;
  active: () => string | undefined;
  setActive: (value: string | undefined) => void;
  move: (direction: "next" | "prev" | "first" | "last") => void;
  run: () => void;
  items: ReturnType<typeof createRegistry>;
  listId: string;
  itemId: (value: string) => string;
  label: () => string;
  setList: (el: HTMLElement) => void;
}

const CommandContext = createContext<CommandContextValue>();
const GroupContext = createContext<ReturnType<typeof createRegistry> | null>(null);
const useCommand = () => useContext(CommandContext);

// Every word of the search, in the value or its keywords, matched in the locale's letters.
const defaultFilter =
  (locale: string): Filter =>
  (value, search, keywords) => {
    const haystack = [value, ...keywords].join(" ").toLocaleLowerCase(locale);
    return search
      .toLocaleLowerCase(locale)
      .split(/\s+/)
      .every((word) => haystack.includes(word));
  };

/** One action, when Command builds itself from `items`. */
export interface CommandAction {
  /** What the search matches against, and the action's identity. Shown when there's no label. */
  value: string;
  label?: JSX.Element;
  icon?: JSX.Element;
  /** Other words that should find it: "settings" for Preferences. */
  keywords?: string[];
  /** A key hint at the end, like "⌘N". */
  shortcut?: JSX.Element;
  /** Actions with a group sit under its heading, with a line between groups. */
  group?: string;
  disabled?: boolean;
  /** Runs when it's picked, before the root's onSelect. */
  onSelect?: (value: string) => void;
}

/**
 * A searchable list of actions, for a command palette or a quick switcher.
 * Give it `items` and it builds the search, the list and its groups itself.
 * Without them, put the parts together yourself.
 */
export interface CommandProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items?: CommandAction[];
  /** The search's placeholder, with `items`. "Type a command or search…" by default. */
  placeholder?: string;
  /** Shown when nothing matches, with `items`. "No results found." by default. */
  empty?: JSX.Element;
  /** Runs when any of the `items` is picked. */
  onSelect?: (value: string) => void;
  /** Names the list for screen readers. "Commands" by default. */
  label?: string;
  /** Decides which items match the search. By default every word must appear in the value or keywords. */
  filter?: Filter;
}

function CommandRoot(props: CommandProps) {
  const id = `yosegi-command-${createUniqueId()}`;
  const locale = useLocale();
  const [search, setSearch] = createSignal("", { ownedWrite: true });
  const [active, setActive] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  const [list, setList] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const items = createRegistry();
  const rest = omit(props, "label", "filter", "class", "children", "items", "placeholder", "empty", "onSelect");

  const move = (direction: "next" | "prev" | "first" | "last") => {
    const item = nextItem(list(), active(), direction);
    if (item) setActive(item.dataset.value);
  };

  // A new search, or a new list, highlights the first match.
  createEffect(
    () => [search(), list()] as const,
    () => queueMicrotask(() => setActive(nextItem(list(), undefined, "first")?.dataset.value)),
  );

  return (
    <CommandContext
      value={{
        search,
        setSearch,
        matches: (value, keywords) =>
          !search().trim() || (props.filter ?? defaultFilter(locale()))(value, search().trim(), keywords),
        active,
        setActive,
        move,
        run: () => untrack(list)?.querySelector<HTMLElement>(`[data-item][data-active]`)?.click(),
        items,
        listId: `${id}-list`,
        itemId: (value) => `${id}-item-${value.replace(/[^\w-]/g, "_")}`,
        label: () => props.label ?? "Commands",
        setList,
      }}
    >
      <div {...rest} class={[styles.root, "yosegi-command", props.class]}>
        {"items" in props ? <Built {...omit(props, "children")} /> : props.children}
      </div>
    </CommandContext>
  );
}

/** The search and the list from the root's `items`, with a heading and a line for each group. */
function Built(props: CommandProps) {
  // Read once: the items build their icons again on every read.
  const groups = createMemo(() => groupOptions(props.items ?? []));
  const select = (item: CommandAction) => (value: string) => {
    item.onSelect?.(value);
    props.onSelect?.(value);
  };
  const row = (item: CommandAction) => (
    <Item value={item.value} keywords={item.keywords} disabled={item.disabled} onSelect={select(item)}>
      {item.icon}
      {item.label ?? item.value}
      <Show when={item.shortcut}>
        <Shortcut>{item.shortcut}</Shortcut>
      </Show>
    </Item>
  );

  return (
    <>
      <Input placeholder={props.placeholder} />
      <List>
        <Empty>{props.empty}</Empty>
        <For each={groups()}>
          {(group, index) => (
            <>
              <Show when={index() > 0}>
                <Separator />
              </Show>
              {group.name === undefined ? (
                <For each={group.options}>{row}</For>
              ) : (
                <Group heading={group.name}>
                  <For each={group.options}>{row}</For>
                </Group>
              )}
            </>
          )}
        </For>
      </List>
    </>
  );
}

function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  const command = useCommand();
  const rest = omit(props, "class", "onInput", "onKeyDown");

  const keys: Record<string, () => void> = {
    ArrowDown: () => command.move("next"),
    ArrowUp: () => command.move("prev"),
    Home: () => command.move("first"),
    End: () => command.move("last"),
    Enter: () => command.run(),
  };

  return (
    <div class={[styles["input-wrapper"], "yosegi-command-input-wrapper"]}>
      <SearchIcon />
      <input
        type="text"
        autocomplete="off"
        spellcheck={false}
        {...rest}
        placeholder={props.placeholder ?? "Type a command or search…"}
        class={[styles.input, "yosegi-command-input", props.class]}
        role="combobox"
        aria-label={command.label()}
        aria-autocomplete="list"
        aria-expanded="true"
        aria-controls={command.listId}
        aria-activedescendant={command.active() ? command.itemId(command.active()!) : undefined}
        value={command.search()}
        onInput={(event) => {
          command.setSearch(event.currentTarget.value);
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
    </div>
  );
}

function List(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const command = useCommand();
  const rest = omit(props, "class", "children");

  return (
    <div
      {...rest}
      ref={(el: HTMLDivElement) => command.setList(el)}
      id={command.listId}
      role="listbox"
      aria-label={command.label()}
      class={[styles.list, "yosegi-command-list", props.class]}
    >
      {props.children}
    </div>
  );
}

export interface CommandGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  heading?: JSX.Element;
}

/** Items under a heading. Hides itself while none of its items match. */
function Group(props: CommandGroupProps) {
  const id = `yosegi-command-group-${createUniqueId()}`;
  const registry = createRegistry();
  const rest = omit(props, "heading", "class", "children");

  return (
    <GroupContext value={registry}>
      <div
        role="group"
        {...rest}
        aria-labelledby={props.heading ? id : undefined}
        class={[styles.group, "yosegi-command-group", props.class]}
        hidden={!registry.any()}
      >
        <Show when={props.heading}>
          <div id={id} aria-hidden="true" class={[styles["group-heading"], "yosegi-command-group-heading"]}>
            {props.heading}
          </div>
        </Show>
        {props.children}
      </div>
    </GroupContext>
  );
}

export interface CommandItemProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** What the search matches against, and the item's identity. */
  value: string;
  /** Other words that should find it: "settings" for Preferences. */
  keywords?: string[];
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

function Item(props: CommandItemProps) {
  const command = useCommand();
  const group = useContext(GroupContext);
  const visible = () => command.matches(props.value, props.keywords ?? []);
  command.items.register(visible);
  group?.register(visible);
  const rest = omit(
    props,
    "value",
    "keywords",
    "onSelect",
    "disabled",
    "class",
    "onClick",
    "onPointerMove",
    "children",
  );

  return (
    <div
      {...rest}
      id={command.itemId(props.value)}
      role="option"
      class={[styles.item, "yosegi-command-item", props.class]}
      aria-selected={command.active() === props.value ? "true" : "false"}
      aria-disabled={props.disabled ? "true" : undefined}
      hidden={!visible()}
      data-item=""
      data-value={props.value}
      data-active={dataAttr(command.active() === props.value)}
      data-disabled={dataAttr(props.disabled)}
      onPointerMove={(event) => {
        if (!props.disabled && command.active() !== props.value) command.setActive(props.value);
        callHandler(props.onPointerMove, event);
      }}
      onClick={(event) => {
        if (props.disabled) return;
        props.onSelect?.(props.value);
        callHandler(props.onClick, event);
      }}
    >
      {props.children}
    </div>
  );
}

/** Shown when nothing matches. */
function Empty(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const command = useCommand();
  const rest = omit(props, "class", "children");
  return (
    <div role="presentation" {...rest} class={[styles.empty, "yosegi-command-empty"]} hidden={command.items.any()}>
      {props.children ?? "No results found."}
    </div>
  );
}

/** A line between groups. Hidden while searching, when the groups no longer line up. */
function Separator(props: JSX.HTMLAttributes<HTMLHRElement>) {
  const command = useCommand();
  const rest = omit(props, "class");
  return (
    <hr
      {...rest}
      class={[styles.separator, "yosegi-command-separator", props.class]}
      hidden={!!command.search().trim()}
    />
  );
}

function Shortcut(props: JSX.HTMLAttributes<HTMLElement>) {
  const rest = omit(props, "class", "children");
  return (
    <kbd {...rest} class={[styles.shortcut, "yosegi-command-shortcut", props.class]}>
      {props.children}
    </kbd>
  );
}

export interface CommandDialogProps extends CommandProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** A Command in a Dialog: the command palette. Open it from a button or a shortcut like ⌘K. */
function CommandDialog(props: CommandDialogProps) {
  const rest = omit(props, "open", "onOpenChange", "children");

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content class={[styles.dialog, "yosegi-command-dialog"]} aria-label={props.label ?? "Commands"}>
          <CommandRoot {...rest}>{props.children}</CommandRoot>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

export const Command = Object.assign(CommandRoot, {
  Input,
  List,
  Group,
  Item,
  Empty,
  Separator,
  Shortcut,
  Dialog: CommandDialog,
});
