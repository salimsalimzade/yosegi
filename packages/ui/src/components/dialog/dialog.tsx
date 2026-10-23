import type { JSX, ValidComponent } from "@solidjs/web";
import { createContext, createEffect, createSignal, createUniqueId, omit, onSettled, Show, useContext } from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createPart, createTag } from "../../primitives/create-part";
import { callHandler, dataAttr, focusFirst } from "../../primitives/dom";
import { CloseIcon } from "../../primitives/icons";
import { Portal } from "../../primitives/portal";
import styles from "./dialog.module.scss";

interface DialogContextValue {
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
}

const DialogContext = createContext<DialogContextValue>();
const useDialog = () => useContext(DialogContext);

/** A window over the page for a decision or a short form. */
export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** true by default: the page behind is inert and scrolling is locked. */
  modal?: boolean;
  children?: JSX.Element;
}

function DialogRoot(props: DialogProps) {
  const id = `yosegi-dialog-${createUniqueId()}`;
  const [open, setOpen] = createControllableSignal({
    value: () => props.open,
    defaultValue: () => props.defaultOpen ?? false,
    onChange: (next) => props.onOpenChange?.(next),
  });
  const [trigger, setTrigger] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const [hasTitle, setHasTitle] = createSignal(false, { ownedWrite: true });
  const [hasDescription, setHasDescription] = createSignal(false, { ownedWrite: true });

  return (
    <DialogContext
      value={{
        open,
        setOpen,
        modal: () => props.modal ?? true,
        ids: { content: `${id}-content`, title: `${id}-title`, description: `${id}-description` },
        hasTitle,
        hasDescription,
        setHasTitle,
        setHasDescription,
        trigger,
        setTrigger,
      }}
    >
      {props.children}
    </DialogContext>
  );
}

export interface DialogTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ValidComponent;
  [prop: string]: unknown;
}

function Trigger(props: DialogTriggerProps) {
  const dialog = useDialog();
  const Tag = createTag(() => props.as ?? "button");
  const rest = omit(props, "as", "class", "ref", "onClick", "children");

  return (
    <Tag
      type={(props.as ?? "button") === "button" ? "button" : undefined}
      {...rest}
      ref={[(el: HTMLElement) => dialog.setTrigger(el), props.ref as any]}
      class={["yosegi-dialog-trigger", props.class]}
      aria-haspopup="dialog"
      aria-expanded={dialog.open() ? "true" : "false"}
      data-expanded={dataAttr(dialog.open())}
      onClick={(event: MouseEvent) => {
        dialog.setOpen(true);
        callHandler(props.onClick, event);
      }}
    >
      {props.children}
    </Tag>
  );
}

function Overlay(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const dialog = useDialog();
  const rest = omit(props, "class", "children");

  return (
    <Show when={dialog.open()}>
      <div aria-hidden="true" {...rest} class={[styles.overlay, "yosegi-dialog-overlay", props.class]} data-expanded="" >
        {props.children}
      </div>
    </Show>
  );
}

/** role="dialog" by default; pass role="alertdialog" for confirmations. */
function Content(props: JSX.DialogHtmlAttributes<HTMLDialogElement>) {
  const dialog = useDialog();
  const rest = omit(props, "class", "ref", "onClick", "onCancel", "children");

  const [element, setElement] = createSignal<HTMLDialogElement | undefined>(undefined, { ownedWrite: true });

  // Everything the callback and its cleanup use is read here, where it's tracked.
  createEffect(
    () => (dialog.open() ? ([element(), dialog.modal(), dialog.trigger()] as const) : undefined),
    (opened) => {
      const [el, modal, triggerEl] = opened ?? [];
      if (!el) return;
      // The element that had focus gets it back when the dialog closes.
      const returnTo = document.activeElement as HTMLElement | null;
      if (modal) el.showModal();
      else el.show();
      focusFirst(el);
      return () => {
        if (el.open) el.close();
        (returnTo?.isConnected ? returnTo : triggerEl)?.focus();
      };
    },
  );

  return (
    <Show when={dialog.open()}>
      <dialog
        {...rest}
        ref={[setElement, props.ref as any]}
        id={dialog.ids.content}
        class={[styles.content, "yosegi-dialog-content", props.class]}
        role={props.role === "alertdialog" ? "alertdialog" : undefined}
        aria-modal={dialog.modal() ? "true" : undefined}
        aria-labelledby={dialog.hasTitle() ? dialog.ids.title : undefined}
        aria-describedby={dialog.hasDescription() ? dialog.ids.description : undefined}
        data-expanded=""
        // Escape fires `cancel`; close through the state so a controlled parent hears it.
        onCancel={(event) => {
          event.preventDefault();
          callHandler(props.onCancel, event);
          dialog.setOpen(false);
        }}
        // A click on the dialog element itself, outside its box, landed on the backdrop.
        onClick={(event) => {
          callHandler(props.onClick, event);
          const el = event.currentTarget;
          if (event.target !== el || props.role === "alertdialog") return;
          const box = el.getBoundingClientRect();
          const inside =
            event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
          if (!inside) dialog.setOpen(false);
        }}
      >
        {props.children}
      </dialog>
    </Show>
  );
}

function Title(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const dialog = useDialog();
  onSettled(() => {
    dialog.setHasTitle(true);
    return () => dialog.setHasTitle(false);
  });
  const rest = omit(props, "class", "children");
  return (
    <h2 {...rest} id={dialog.ids.title} class={[styles.title, "yosegi-dialog-title", props.class]}>
      {props.children}
    </h2>
  );
}

function Description(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  const dialog = useDialog();
  onSettled(() => {
    dialog.setHasDescription(true);
    return () => dialog.setHasDescription(false);
  });
  const rest = omit(props, "class", "children");
  return (
    <p {...rest} id={dialog.ids.description} class={[styles.description, "yosegi-dialog-description", props.class]}>
      {props.children}
    </p>
  );
}

/** Renders the × icon when it has no children. */
function CloseButton(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const dialog = useDialog();
  const rest = omit(props, "class", "onClick", "children");

  return (
    <button
      type="button"
      aria-label="Close"
      {...rest}
      class={[styles["close-button"], "yosegi-dialog-close-button", props.class]}
      onClick={(event) => {
        dialog.setOpen(false);
        callHandler(props.onClick, event);
      }}
    >
      {props.children ?? <CloseIcon />}
    </button>
  );
}

export const Dialog = Object.assign(DialogRoot, {
  Trigger,
  Portal,
  Overlay,
  Content,
  Header: createPart("div", styles.header, "yosegi-dialog-header"),
  Title,
  Description,
  Body: createPart("div", styles.body, "yosegi-dialog-body"),
  Footer: createPart("div", styles.footer, "yosegi-dialog-footer"),
  CloseButton,
});
