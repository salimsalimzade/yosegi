import type { JSX, ValidComponent } from "@solidjs/web";
import {
  children,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  omit,
  onSettled,
  Show,
  untrack,
  useContext,
} from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createDismiss } from "../../primitives/create-dismiss";
import {
  createFloating,
  type Placement,
} from "../../primitives/create-floating";
import { createPart, createTag } from "../../primitives/create-part";
import {
  callHandler,
  dataAttr,
  focusFirst,
  getFocusable,
} from "../../primitives/dom";
import { CloseIcon } from "../../primitives/icons";
import { Portal } from "../../primitives/portal";
import { Button, type ButtonTriggerProps } from "../button/button";
import { TextField, type TextFieldProps } from "../text-field/text-field";
import styles from "./popover.module.scss";

interface PopoverContextValue {
  open: () => boolean;
  setOpen: (open: boolean) => void;
  modal: () => boolean;
  ids: { content: string; title: string; description: string };
  hasTitle: () => boolean;
  hasDescription: () => boolean;
  setHasTitle: (has: boolean) => void;
  setHasDescription: (has: boolean) => void;
  trigger: () => HTMLElement | undefined;
  setTrigger: (el: HTMLElement) => void;
  setAnchor: (el: HTMLElement) => void;
  setContent: (el: HTMLElement | undefined) => void;
  setArrow: (el: HTMLElement | undefined) => void;
}

const PopoverContext = createContext<PopoverContextValue>();
const usePopover = () => useContext(PopoverContext);

/**
 * A small panel next to its trigger for a quick task. Give it a trigger and it
 * builds the panel itself: the arrow, the title and close button, the
 * description, a text field, the children, and the footer. Without one, put
 * the parts together yourself.
 */
export interface PopoverProps {
  /** What opens it: text, or a Button's props like `{ label: "Share", icon: <ShareIcon /> }`. Outline by default. */
  trigger?: string | ButtonTriggerProps;
  title?: JSX.Element;
  description?: JSX.Element;
  /** A TextField under the description, from its props: `{ label: "Link", readOnly: true }`. */
  field?: TextFieldProps;
  /** Buttons at the foot of the panel, on the end side. */
  footer?: JSX.Element;
  /** The arrow pointing at the trigger. True by default. */
  arrow?: boolean;
  /** The × button next to the title. True by default. */
  closeButton?: boolean;
  /** Classes for the panel, with a trigger. */
  class?: string;
  /** Styles for the panel, with a trigger, like --yosegi-popover-width. */
  style?: JSX.CSSProperties | string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** bottom by default. */
  placement?: Placement;
  /** 8 by default. */
  gutter?: number;
  sameWidth?: boolean;
  /** false by default. When true, focus stays inside until it closes. */
  modal?: boolean;
  children?: JSX.Element;
}

function PopoverRoot(props: PopoverProps) {
  const id = `yosegi-popover-${createUniqueId()}`;
  const [open, setOpen] = createControllableSignal({
    value: () => props.open,
    defaultValue: () => props.defaultOpen ?? false,
    onChange: (next) => props.onOpenChange?.(next),
  });
  const element = () =>
    createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const [trigger, setTrigger] = element();
  const [anchor, setAnchor] = element();
  const [content, setContent] = element();
  const [arrow, setArrow] = element();
  const [hasTitle, setHasTitle] = createSignal(false, { ownedWrite: true });
  const [hasDescription, setHasDescription] = createSignal(false, {
    ownedWrite: true,
  });

  createFloating({
    open,
    reference: () => anchor() ?? trigger(),
    floating: content,
    arrow,
    placement: () => props.placement ?? "bottom",
    gutter: () => props.gutter ?? 8,
    sameWidth: () => !!props.sameWidth,
    name: "popover",
  });

  createDismiss({
    enabled: open,
    inside: () => [content(), trigger()],
    onDismiss: (reason) => {
      setOpen(false);
      if (reason === "escape") trigger()?.focus();
    },
  });

  // Focus moves into the content when it opens, and back to the trigger
  // when it closes from inside. The trigger is read once, as it is at
  // closing time; untrack says so, since the effect needn't re-run for it.
  createEffect(
    () => [open(), content()] as const,
    ([isOpen, el]) => {
      if (!isOpen || !el) return;
      requestAnimationFrame(() => focusFirst(el));
      return () => {
        if (
          el.contains(document.activeElement) ||
          document.activeElement === document.body
        )
          untrack(trigger)?.focus();
      };
    },
  );

  return (
    <PopoverContext
      value={{
        open,
        setOpen,
        modal: () => !!props.modal,
        ids: {
          content: `${id}-content`,
          title: `${id}-title`,
          description: `${id}-description`,
        },
        hasTitle,
        hasDescription,
        setHasTitle,
        setHasDescription,
        trigger,
        setTrigger,
        setAnchor,
        setContent,
        setArrow,
      }}
    >
      {"trigger" in props ? <Built {...omit(props, "children")}>{props.children}</Built> : props.children}
    </PopoverContext>
  );
}

/** The panel from the root's props, when it has a trigger. */
function Built(props: PopoverProps) {
  const title = children(() => props.title);
  const description = children(() => props.description);
  const footer = children(() => props.footer);

  return (
    <>
      <TriggerFrom trigger={props.trigger} />
      <Portal>
        <Content class={props.class} style={props.style}>
          <Show when={props.arrow !== false}>
            <Arrow />
          </Show>
          <Show when={title() || props.closeButton !== false}>
            <Header>
              <Show when={title()}>
                <Title>{title()}</Title>
              </Show>
              <Show when={props.closeButton !== false}>
                <CloseButton />
              </Show>
            </Header>
          </Show>
          <Show when={description()}>
            <Description>{description()}</Description>
          </Show>
          <Show when={props.field}>{(field) => <TextField {...field()} />}</Show>
          {props.children}
          <Show when={footer()}>
            <Footer>{footer()}</Footer>
          </Show>
        </Content>
      </Portal>
    </>
  );
}

/** The trigger from the root's props: an outline Button with the text, or with the Button props given. */
function TriggerFrom(props: { trigger?: string | ButtonTriggerProps }) {
  // Read once: the object builds its icon again on every read.
  const button = createMemo(() => {
    const trigger = props.trigger;
    return typeof trigger === "string" ? { label: trigger } : { ...trigger };
  });
  // Keyed: Trigger gets plain props, and a new trigger object builds it again.
  return (
    <Show when={button()} keyed>
      {(button) => <Trigger as={Button} variant="outline" {...button} />}
    </Show>
  );
}

export interface PopoverTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ValidComponent;
  [prop: string]: unknown;
}

function Trigger(props: PopoverTriggerProps) {
  const popover = usePopover();
  const Tag = createTag(() => props.as ?? "button");
  const rest = omit(props, "as", "class", "ref", "onClick", "children");

  return (
    <Tag
      type={(props.as ?? "button") === "button" ? "button" : undefined}
      {...rest}
      ref={[(el: HTMLElement) => popover.setTrigger(el), props.ref as any]}
      class={["yosegi-popover-trigger", props.class]}
      aria-haspopup="dialog"
      aria-expanded={popover.open() ? "true" : "false"}
      aria-controls={popover.open() ? popover.ids.content : undefined}
      data-expanded={dataAttr(popover.open())}
      onClick={(event: MouseEvent) => {
        popover.setOpen(!popover.open());
        callHandler(props.onClick, event);
      }}
    >
      {props.children}
    </Tag>
  );
}

/** Position against this instead of the trigger. */
function Anchor(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const popover = usePopover();
  const rest = omit(props, "class", "ref", "children");
  return (
    <div
      {...rest}
      ref={[(el: HTMLDivElement) => popover.setAnchor(el), props.ref as any]}
      class={["yosegi-popover-anchor", props.class]}
    >
      {props.children}
    </div>
  );
}

function Content(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const popover = usePopover();
  const rest = omit(props, "class", "ref", "onKeyDown", "children");

  return (
    <Show when={popover.open()}>
      <div
        role="dialog"
        tabindex="-1"
        {...rest}
        ref={[(el: HTMLDivElement) => popover.setContent(el), props.ref as any]}
        id={popover.ids.content}
        class={[styles.content, "yosegi-popover-content", props.class]}
        aria-modal={popover.modal() ? "true" : undefined}
        aria-labelledby={popover.hasTitle() ? popover.ids.title : undefined}
        aria-describedby={
          popover.hasDescription() ? popover.ids.description : undefined
        }
        data-expanded=""
        onKeyDown={(event) => {
          callHandler(props.onKeyDown, event);
          if (event.key !== "Tab" || !popover.modal()) return;
          // Modal: Tab cycles inside the content.
          const focusable = getFocusable(event.currentTarget);
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (!first || !last) return event.preventDefault();
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        {props.children}
      </div>
    </Show>
  );
}

function Arrow(props: JSX.HTMLAttributes<HTMLSpanElement>) {
  const popover = usePopover();
  const rest = omit(props, "class", "ref");

  return (
    <span
      aria-hidden="true"
      {...rest}
      ref={[(el: HTMLSpanElement) => popover.setArrow(el), props.ref as any]}
      class={[styles.arrow, "yosegi-popover-arrow", props.class]}
    >
      <svg viewBox="0 0 12 6" width="12" height="6">
        <path class={styles.fill} d="M0 0h12L6 6z" />
        <path class={styles.edge} d="M0 0L6 6L12 0" />
      </svg>
    </span>
  );
}

function Title(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const popover = usePopover();
  onSettled(() => {
    popover.setHasTitle(true);
    return () => popover.setHasTitle(false);
  });
  const rest = omit(props, "class", "children");
  return (
    <h2
      {...rest}
      id={popover.ids.title}
      class={[styles.title, "yosegi-popover-title", props.class]}
    >
      {props.children}
    </h2>
  );
}

function Description(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  const popover = usePopover();
  onSettled(() => {
    popover.setHasDescription(true);
    return () => popover.setHasDescription(false);
  });
  const rest = omit(props, "class", "children");
  return (
    <p
      {...rest}
      id={popover.ids.description}
      class={[styles.description, "yosegi-popover-description", props.class]}
    >
      {props.children}
    </p>
  );
}

/** The title and the close button on one line. */
const Header = createPart("div", styles.header, "yosegi-popover-header");

/** Buttons at the foot of the panel, on the end side. */
const Footer = createPart("div", styles.footer, "yosegi-popover-footer");

/** Renders the × icon when it has no children. */
function CloseButton(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const popover = usePopover();
  const rest = omit(props, "class", "onClick", "children");

  return (
    <button
      type="button"
      aria-label="Close"
      {...rest}
      class={[
        styles["close-button"],
        "yosegi-popover-close-button",
        props.class,
      ]}
      onClick={(event) => {
        popover.setOpen(false);
        popover.trigger()?.focus();
        callHandler(props.onClick, event);
      }}
    >
      {props.children ?? <CloseIcon />}
    </button>
  );
}

export const Popover = Object.assign(PopoverRoot, {
  Trigger,
  Anchor,
  Portal,
  Content,
  Arrow,
  Title,
  Description,
  Header,
  Footer,
  CloseButton,
});
