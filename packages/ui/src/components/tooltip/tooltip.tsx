import type { JSX, ValidComponent } from "@solidjs/web";
import { createContext, createSignal, createUniqueId, omit, Show, useContext } from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createDismiss } from "../../primitives/create-dismiss";
import { createFloating, type Placement } from "../../primitives/create-floating";
import { createTag } from "../../primitives/create-part";
import { callHandler, dataAttr } from "../../primitives/dom";
import { Portal } from "../../primitives/portal";
import type { ButtonTriggerProps } from "../button/button";
import { ButtonTriggerSlot } from "../button/button-trigger";
import styles from "./tooltip.module.scss";

interface TooltipContextValue {
  open: () => boolean;
  show: (delay?: number) => void;
  hide: (delay?: number) => void;
  contentId: string;
  setTrigger: (el: HTMLElement) => void;
  setContent: (el: HTMLElement | undefined) => void;
  setArrow: (el: HTMLElement | undefined) => void;
}

const TooltipContext = createContext<TooltipContextValue>();
const useTooltip = () => useContext(TooltipContext);

/**
 * A short label shown on hover or focus. Give it a trigger and it builds the
 * rest itself: the arrow and the content. Without one, put the parts together
 * yourself.
 */
export interface TooltipProps {
  /** What it's about: text, or a Button's props like `{ icon: <PlusIcon />, "aria-label": "New note" }`. Outline by default. */
  trigger?: string | ButtonTriggerProps;
  /** The text of the tooltip. */
  content?: JSX.Element;
  /** The arrow pointing at the trigger. True by default. */
  arrow?: boolean;
  /** Classes for the content, with a trigger. */
  class?: string;
  /** Styles for the content, with a trigger. */
  style?: JSX.CSSProperties | string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** top by default. */
  placement?: Placement;
  /** 300 by default. */
  openDelay?: number;
  /** 0 by default. */
  closeDelay?: number;
  /** Space between trigger and content, 6 by default. */
  gutter?: number;
  disabled?: boolean;
  children?: JSX.Element;
}

function TooltipRoot(props: TooltipProps) {
  const [open, setOpen] = createControllableSignal({
    value: () => props.open,
    defaultValue: () => props.defaultOpen ?? false,
    onChange: (next) => props.onOpenChange?.(next),
  });
  const [trigger, setTrigger] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const [content, setContent] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const [arrow, setArrow] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = (next: boolean, delay: number) => {
    clearTimeout(timer);
    if (next && props.disabled) return;
    if (delay <= 0) setOpen(next);
    else timer = setTimeout(() => setOpen(next), delay);
  };

  createFloating({
    open,
    reference: trigger,
    floating: content,
    arrow,
    placement: () => props.placement ?? "top",
    gutter: () => props.gutter ?? 6,
    name: "tooltip",
  });

  createDismiss({ enabled: open, inside: () => [], outside: false, onDismiss: () => schedule(false, 0) });

  return (
    <TooltipContext
      value={{
        open,
        show: (delay = props.openDelay ?? 300) => schedule(true, delay),
        hide: (delay = props.closeDelay ?? 0) => schedule(false, delay),
        contentId: `yosegi-tooltip-${createUniqueId()}`,
        setTrigger,
        setContent,
        setArrow,
      }}
    >
      {"trigger" in props ? <Built {...omit(props, "children")} /> : props.children}
    </TooltipContext>
  );
}

/** The trigger and the content from the root's props, when it has a trigger. */
function Built(props: TooltipProps) {
  return (
    <>
      <ButtonTriggerSlot trigger={props.trigger} part={Trigger} />
      <Portal>
        <Content class={props.class} style={props.style}>
          <Show when={props.arrow !== false}>
            <Arrow />
          </Show>
          {props.content}
        </Content>
      </Portal>
    </>
  );
}

export interface TooltipTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ValidComponent;
  [prop: string]: unknown;
}

function Trigger(props: TooltipTriggerProps) {
  const tooltip = useTooltip();
  const Tag = createTag(() => props.as ?? "button");
  const rest = omit(props, "as", "class", "ref", "onPointerEnter", "onPointerLeave", "onFocus", "onBlur", "children");

  return (
    <Tag
      type={(props.as ?? "button") === "button" ? "button" : undefined}
      {...rest}
      ref={[(el: HTMLElement) => tooltip.setTrigger(el), props.ref as any]}
      class={["yosegi-tooltip-trigger", props.class]}
      aria-describedby={tooltip.open() ? tooltip.contentId : undefined}
      data-expanded={dataAttr(tooltip.open())}
      onPointerEnter={(event: PointerEvent) => {
        if (event.pointerType !== "touch") tooltip.show();
        callHandler(props.onPointerEnter, event);
      }}
      onPointerLeave={(event: PointerEvent) => {
        tooltip.hide();
        callHandler(props.onPointerLeave, event);
      }}
      // Keyboard focus opens it right away.
      onFocus={(event: FocusEvent) => {
        if ((event.currentTarget as HTMLElement).matches(":focus-visible")) tooltip.show(0);
        callHandler(props.onFocus, event);
      }}
      onBlur={(event: FocusEvent) => {
        tooltip.hide(0);
        callHandler(props.onBlur, event);
      }}
    >
      {props.children}
    </Tag>
  );
}

/** data-placement tells you where it ended up. */
function Content(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const tooltip = useTooltip();
  const rest = omit(props, "class", "ref", "onPointerEnter", "onPointerLeave", "children");

  return (
    <Show when={tooltip.open()}>
      <div
        role="tooltip"
        {...rest}
        ref={[(el: HTMLDivElement) => tooltip.setContent(el), props.ref as any]}
        id={tooltip.contentId}
        class={[styles.content, "yosegi-tooltip-content", props.class]}
        data-expanded=""
        // Moving onto the tooltip keeps it open, so its text can be selected.
        onPointerEnter={(event) => {
          tooltip.show(0);
          callHandler(props.onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          tooltip.hide();
          callHandler(props.onPointerLeave, event);
        }}
      >
        {props.children}
      </div>
    </Show>
  );
}

function Arrow(props: JSX.HTMLAttributes<HTMLSpanElement>) {
  const tooltip = useTooltip();
  const rest = omit(props, "class", "ref");

  return (
    <span
      aria-hidden="true"
      {...rest}
      ref={[(el: HTMLSpanElement) => tooltip.setArrow(el), props.ref as any]}
      class={[styles.arrow, "yosegi-tooltip-arrow", props.class]}
    >
      <svg viewBox="0 0 10 5" width="10" height="5">
        <path d="M0 0h10L5 5z" />
      </svg>
    </span>
  );
}

export const Tooltip = Object.assign(TooltipRoot, { Trigger, Portal, Content, Arrow });
