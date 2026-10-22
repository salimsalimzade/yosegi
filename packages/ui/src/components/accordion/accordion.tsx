import type { JSX } from "@solidjs/web";
import { createContext, createEffect, createSignal, createUniqueId, omit, useContext } from "solid-js";
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

/** Headings that each show or hide a section of content. */
export interface AccordionProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
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
  const rest = omit(props, "value", "defaultValue", "onChange", "multiple", "collapsible", "class", "ref", "children");

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
        {props.children}
      </div>
    </AccordionContext>
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
  const [closing, setClosing] = createSignal(false, { ownedWrite: true });
  let el: HTMLDivElement | undefined;
  const rest = omit(props, "class", "ref", "onAnimationEnd", "children");

  const measure = () => el?.style.setProperty("--yosegi-accordion-content-height", `${el.scrollHeight}px`);
  const animates = () => !!el && getComputedStyle(el).animationName !== "none";

  createEffect(
    () => item.open(),
    (open, wasOpen) => {
      if (!el) return;
      if (wasOpen === undefined) {
        // First render: show the starting state without animating it.
        el.hidden = !open;
        el.style.animation = "none";
        requestAnimationFrame(() => el && (el.style.animation = ""));
        return;
      }
      if (open) {
        el.hidden = false;
        measure();
        setClosing(false);
      } else {
        measure();
        setClosing(true);
        // Without an animation there is no animationend to wait for.
        queueMicrotask(() => {
          if (!animates()) finishClosing();
        });
      }
    },
  );

  const finishClosing = () => {
    if (!el || item.open()) return;
    el.hidden = true;
    setClosing(false);
  };

  return (
    <div
      role="region"
      {...rest}
      ref={[(node: HTMLDivElement) => (el = node), props.ref as any]}
      id={item.contentId}
      aria-labelledby={item.triggerId}
      class={[styles.content, "yosegi-accordion-content", props.class]}
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
