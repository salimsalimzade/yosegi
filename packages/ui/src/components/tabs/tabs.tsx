import type { JSX } from "@solidjs/web";
import { createContext, createUniqueId, omit, onSettled, untrack, useContext } from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { callHandler, dataAttr } from "../../primitives/dom";
import { moveFocus, type Orientation } from "../../primitives/roving-focus";
import styles from "./tabs.module.scss";

interface TabsContextValue {
  selected: () => string | undefined;
  select: (value: string) => void;
  orientation: () => Orientation;
  activationMode: () => "automatic" | "manual";
  triggerId: (value: string) => string;
  contentId: (value: string) => string;
}

const TabsContext = createContext<TabsContextValue>();
const useTabs = () => useContext(TabsContext);

/** Labels that switch between panels of the same place. */
export interface TabsProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** horizontal by default. */
  orientation?: Orientation;
  /** automatic by default: arrow keys switch panels. */
  activationMode?: "automatic" | "manual";
}

function TabsRoot(props: TabsProps) {
  const id = `yosegi-tabs-${createUniqueId()}`;
  const [selected, setSelected] = createControllableSignal<string | undefined>({
    value: () => props.value,
    defaultValue: () => props.defaultValue,
    onChange: (next) => next !== undefined && props.onChange?.(next),
  });
  let root: HTMLDivElement | undefined;
  const rest = omit(
    props,
    "value",
    "defaultValue",
    "onChange",
    "orientation",
    "activationMode",
    "class",
    "ref",
    "children",
  );
  const safe = (value: string) => value.replace(/[^\w-]/g, "_");

  // With no value given, the first tab that isn't disabled starts selected.
  onSettled(() => {
    if (untrack(selected) !== undefined || !root) return;
    const first = root.querySelector<HTMLElement>("[role=tab]:not(:disabled)");
    if (first?.dataset.value) setSelected(first.dataset.value);
  });

  return (
    <TabsContext
      value={{
        selected,
        select: (value) => setSelected(value),
        orientation: () => props.orientation ?? "horizontal",
        activationMode: () => props.activationMode ?? "automatic",
        triggerId: (value) => `${id}-trigger-${safe(value)}`,
        contentId: (value) => `${id}-content-${safe(value)}`,
      }}
    >
      <div
        {...rest}
        ref={[(el: HTMLDivElement) => (root = el), props.ref as any]}
        class={[styles.root, "yosegi-tabs", props.class]}
        data-orientation={props.orientation ?? "horizontal"}
      >
        {props.children}
      </div>
    </TabsContext>
  );
}

function List(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const tabs = useTabs();
  const rest = omit(props, "class", "children");

  return (
    <div
      role="tablist"
      {...rest}
      class={[styles.list, "yosegi-tabs-list", props.class]}
      aria-orientation={tabs.orientation()}
      data-orientation={tabs.orientation()}
    >
      {props.children}
    </div>
  );
}

export interface TabsTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

function Trigger(props: TabsTriggerProps) {
  const tabs = useTabs();
  const isSelected = () => tabs.selected() === props.value;
  const rest = omit(props, "value", "disabled", "class", "onClick", "onKeyDown", "onFocus", "children");

  return (
    <button
      type="button"
      role="tab"
      {...rest}
      id={tabs.triggerId(props.value)}
      class={[styles.trigger, "yosegi-tabs-trigger", props.class]}
      // Only the selected tab is in the tab order; the arrow keys reach the rest.
      tabindex={isSelected() ? 0 : -1}
      aria-selected={isSelected() ? "true" : "false"}
      aria-controls={tabs.contentId(props.value)}
      disabled={props.disabled}
      data-value={props.value}
      data-selected={dataAttr(isSelected())}
      data-disabled={dataAttr(props.disabled)}
      data-orientation={tabs.orientation()}
      onClick={(event) => {
        tabs.select(props.value);
        callHandler(props.onClick, event);
      }}
      onFocus={(event) => {
        if (tabs.activationMode() === "automatic") tabs.select(props.value);
        callHandler(props.onFocus, event);
      }}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        if (event.defaultPrevented) return;
        const list = event.currentTarget.closest("[role=tablist]");
        if (!list) return;
        const triggers = [...list.querySelectorAll<HTMLElement>("[role=tab]")].filter(
          (el) => el.closest("[role=tablist]") === list,
        );
        moveFocus(event, triggers, tabs.orientation());
        if (event.key === "Enter" || event.key === " ") tabs.select(props.value);
      }}
    >
      {props.children}
    </button>
  );
}

function Content(props: JSX.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const tabs = useTabs();
  const isSelected = () => tabs.selected() === props.value;
  const rest = omit(props, "value", "class", "children");

  return (
    <div
      role="tabpanel"
      tabindex="0"
      {...rest}
      id={tabs.contentId(props.value)}
      class={[styles.content, "yosegi-tabs-content", props.class]}
      aria-labelledby={tabs.triggerId(props.value)}
      hidden={!isSelected()}
      data-selected={dataAttr(isSelected())}
      data-orientation={tabs.orientation()}
    >
      {props.children}
    </div>
  );
}

export const Tabs = Object.assign(TabsRoot, { List, Trigger, Content });
