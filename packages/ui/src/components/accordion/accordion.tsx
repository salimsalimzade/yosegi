import type { JSX, ValidComponent } from "@solidjs/web";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  omit,
  untrack,
  useContext,
} from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createTag, type PartProps } from "../../primitives/create-part";
import { callHandler, dataAttr } from "../../primitives/dom";
import { moveFocus } from "../../primitives/roving-focus";
import styles from "./accordion.module.scss";

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  root: () => HTMLElement | undefined;
}

interface ItemContextValue {
  open: () => boolean;
  disabled: () => boolean;
  value: () => string;
  triggerId: string;
  contentId: string;
}

const AccordionContext = createContext<AccordionContextValue>();
const ItemContext = createContext<ItemContextValue>();

/** One section, when Accordion builds itself from `sections`. */
export interface AccordionSection {
  /** Unique within the accordion. */
  value: string;
  /** The heading's text, or any JSX. */
  title: JSX.Element;
  content?: JSX.Element;
  disabled?: boolean;
}

/**
 * Headings that each show or hide a section of content. Give it `sections` and
 * it builds the items itself. Without them, put the parts together yourself.
 */
export interface AccordionProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  sections?: AccordionSection[];
  /** Each heading's element, with `sections`. h3 by default. */
  titleAs?: ValidComponent;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Allow several items open at once. */
  multiple?: boolean;
  /** Allow the open item to close. */
  collapsible?: boolean;
}

function AccordionRoot(props: AccordionProps) {
  const [value, setValue] = createControllableSignal<string[]>({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? [],
    onChange: (next) => props.onChange?.(next),
  });
  let root: HTMLDivElement | undefined;
  const rest = omit(
    props,
    "value",
    "defaultValue",
    "onChange",
    "multiple",
    "collapsible",
    "class",
    "ref",
    "children",
    "sections",
    "titleAs",
  );

  const toggle = (item: string) => {
    const open = value().includes(item);
    if (open) {
      if (!props.multiple && !props.collapsible) return;
      setValue(value().filter((v) => v !== item));
    } else {
      setValue(props.multiple ? [...value(), item] : [item]);
    }
  };

  return (
    <AccordionContext value={{ isOpen: (item) => value().includes(item), toggle, root: () => root }}>
      <div
        {...rest}
        ref={[(el: HTMLDivElement) => (root = el), props.ref as any]}
        class={[styles.root, "yosegi-accordion", props.class]}
      >
        {"sections" in props ? <Built sections={props.sections} titleAs={props.titleAs} /> : props.children}
      </div>
    </AccordionContext>
  );
}

/** The items from the root's `sections`. */
function Built(props: { sections?: AccordionSection[]; titleAs?: ValidComponent }) {
  // Read once: the sections build their titles and content again on every read.
  const sections = createMemo(() => props.sections ?? []);

  return (
    <For each={sections()}>
      {(section) => (
        <Item value={section.value} disabled={section.disabled}>
          <Header as={props.titleAs}>
            <Trigger>{section.title}</Trigger>
          </Header>
          <Content>
            {/* One element, so the content's padding applies to plain text too. */}
            <div>{section.content}</div>
          </Content>
        </Item>
      )}
    </For>
  );
}

export interface AccordionItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Unique within the accordion. */
  value: string;
  disabled?: boolean;
}

function Item(props: AccordionItemProps) {
  const accordion = useContext(AccordionContext);
  const id = `yosegi-accordion-${createUniqueId()}`;
  const open = () => accordion.isOpen(props.value);
  const rest = omit(props, "value", "disabled", "class", "children");

  return (
    <ItemContext
      value={{
        open,
        disabled: () => !!props.disabled,
        value: () => props.value,
        triggerId: `${id}-trigger`,
        contentId: `${id}-content`,
      }}
    >
      <div
        {...rest}
        class={[styles.item, "yosegi-accordion-item", props.class]}
        data-expanded={dataAttr(open())}
        data-disabled={dataAttr(props.disabled)}
      >
        {props.children}
      </div>
    </ItemContext>
  );
}

/** An h3 by default; change it with `as` to fit the page. */
function Header(props: PartProps<HTMLHeadingElement>) {
  const item = useContext(ItemContext);
  const Tag = createTag(() => props.as ?? "h3");
  const rest = omit(props, "as", "class", "children");

  return (
    <Tag
      {...rest}
      class={[styles.header, "yosegi-accordion-header", props.class]}
      data-expanded={dataAttr(item.open())}
      data-disabled={dataAttr(item.disabled())}
    >
      {props.children}
    </Tag>
  );
}

function Trigger(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const accordion = useContext(AccordionContext);
  const item = useContext(ItemContext);
  const rest = omit(props, "class", "onClick", "onKeyDown", "children");

  return (
    <button
      type="button"
      {...rest}
      id={item.triggerId}
      class={[styles.trigger, "yosegi-accordion-trigger", props.class]}
      aria-expanded={item.open() ? "true" : "false"}
      aria-controls={item.contentId}
      disabled={item.disabled()}
      data-expanded={dataAttr(item.open())}
      data-disabled={dataAttr(item.disabled())}
      data-yosegi-accordion-trigger=""
      onClick={(event) => {
        accordion.toggle(item.value());
        callHandler(props.onClick, event);
      }}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        const root = accordion.root();
        if (event.defaultPrevented || !root) return;
        // Only this accordion's triggers, not those of one nested inside it.
        const triggers = [...root.querySelectorAll<HTMLElement>("[data-yosegi-accordion-trigger]")].filter(
          (el) => el.closest(".yosegi-accordion") === root,
        );
        moveFocus(event, triggers, "vertical");
      }}
    >
      {props.children}
    </button>
  );
}

/** Sets --yosegi-accordion-content-height for the open and close animation. */
function Content(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const item = useContext(ItemContext);
  // Whether the last close has finished. Closing and hidden derive from it
  // and from open, so they change in the same flush as open does. While the
  // item is open nothing reads it, so resetting it then can't show a stale frame.
  const [shut, setShut] = createSignal(!untrack(item.open), { ownedWrite: true });
  const closing = () => !item.open() && !shut();
  const hidden = () => !item.open() && shut();
  let el: HTMLDivElement | undefined;
  const rest = omit(props, "class", "ref", "onAnimationEnd", "children");

  const measure = () => el?.style.setProperty("--yosegi-accordion-content-height", `${el.scrollHeight}px`);
  const animates = () => !!el && getComputedStyle(el).animationName !== "none";
  const finishClosing = () => {
    if (!item.open()) setShut(true);
  };

  createEffect(
    () => item.open(),
    (open, wasOpen) => {
      if (!el) return;
      if (wasOpen === undefined) {
        // First render: show the starting state without animating it.
        el.style.animation = "none";
        requestAnimationFrame(() => el && (el.style.animation = ""));
        return;
      }
      measure();
      if (open) {
        setShut(false);
      } else {
        // Without an animation there is no animationend to wait for.
        queueMicrotask(() => {
          if (!animates()) finishClosing();
        });
      }
    },
  );

  return (
    <div
      role="region"
      {...rest}
      ref={[(node: HTMLDivElement) => (el = node), props.ref as any]}
      id={item.contentId}
      aria-labelledby={item.triggerId}
      class={[styles.content, "yosegi-accordion-content", props.class]}
      hidden={hidden()}
      data-expanded={dataAttr(item.open())}
      data-closed={dataAttr(closing())}
      onAnimationEnd={(event) => {
        if (event.target === el) finishClosing();
        callHandler(props.onAnimationEnd, event);
      }}
    >
      {props.children}
    </div>
  );
}

export const Accordion = Object.assign(AccordionRoot, { Item, Header, Trigger, Content });
