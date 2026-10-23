import type { JSX } from "@solidjs/web";
import { createEffect, createSignal, createStore, flush, For, omit, onSettled, Show } from "solid-js";
import { CloseIcon, TickIcon } from "../../primitives/icons";
import { Button } from "../button/button";
import { Spinner } from "../spinner/spinner";
import styles from "./toast.module.scss";

export type ToastId = string | number;
export type ToastType = "default" | "success" | "error" | "loading";

export interface ToastOptions {
  /** Pass an existing id to update that toast instead of adding one. */
  id?: ToastId;
  description?: string;
  type?: ToastType;
  /** How long it stays, in ms. 4000 by default; loading toasts stay until updated. */
  duration?: number;
  /** One button, for undo and the like. Clicking it also closes the toast. */
  action?: { label: string; onClick: () => void };
}

interface ToastData extends ToastOptions {
  id: ToastId;
  title: string;
  /** Changes on every update, so the timer starts again. */
  version: number;
  closing?: boolean;
}

type ToastEvent = { kind: "show"; toast: Omit<ToastData, "version"> } | { kind: "dismiss"; id?: ToastId };

// toast() can be called from anywhere, so the toasts travel as events to
// whichever Toaster is mounted. Only listeners live at module scope, never
// state, so nothing is shared between server requests. They hang off
// globalThis so a hot reload, or a second copy of the package, still reaches
// a Toaster that is already mounted.
type Listener = (event: ToastEvent) => void;
const channel = globalThis as typeof globalThis & { __yosegiToastListeners?: Set<Listener> };
const listeners = (channel.__yosegiToastListeners ??= new Set<Listener>());
let counter = 0;

function emit(event: ToastEvent) {
  // Outside any component's render, where writing state is always allowed.
  queueMicrotask(() => listeners.forEach((listener) => listener(event)));
}

function show(title: string, options: ToastOptions = {}) {
  const id = options.id ?? `toast-${++counter}`;
  emit({ kind: "show", toast: { type: "default", ...options, id, title } });
  return id;
}

/**
 * Shows a short message in the Toaster's corner.
 *
 * ```ts
 * toast("Note saved");
 * toast.success("Project created", { description: "You can invite people now." });
 * toast.error("Couldn't save", { action: { label: "Retry", onClick: save } });
 * toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Couldn't save" });
 * ```
 */
export const toast = Object.assign(show, {
  success: (title: string, options?: ToastOptions) => show(title, { ...options, type: "success" }),
  error: (title: string, options?: ToastOptions) => show(title, { ...options, type: "error" }),
  /** Stays until you update it (pass its id to another call) or dismiss it. */
  loading: (title: string, options?: ToastOptions) => show(title, { ...options, type: "loading" }),
  /** Closes one toast, or all of them without an id. */
  dismiss: (id?: ToastId) => emit({ kind: "dismiss", id }),
  /** A loading toast that turns into success or error when the promise settles. */
  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string | ((value: T) => string); error: string | ((error: unknown) => string) },
  ) {
    const id = show(messages.loading, { type: "loading" });
    promise.then(
      (value) => show(typeof messages.success === "function" ? messages.success(value) : messages.success, { id, type: "success" }),
      (error) => show(typeof messages.error === "function" ? messages.error(error) : messages.error, { id, type: "error" }),
    );
    return promise;
  },
});

export interface ToasterProps extends JSX.HTMLAttributes<HTMLElement> {
  /** bottom-right by default. */
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  /** The default time each toast stays, in ms. 4000 by default. */
  duration?: number;
  /** The most toasts shown at once; older ones close. 3 by default. */
  max?: number;
}

/** Where toasts appear. Mount one, near the root of the app. */
export function Toaster(props: ToasterProps) {
  const [toasts, setToasts] = createStore<{ list: ToastData[] }>({ list: [] });
  const [paused, setPaused] = createSignal(false);
  const rest = omit(props, "position", "duration", "max", "class");

  const close = (id: ToastId) =>
    setToasts((s) => {
      const item = s.list.find((t) => t.id === id);
      if (item) item.closing = true;
    });

  const remove = (id: ToastId) => setToasts((s) => ({ list: s.list.filter((t) => t.id !== id) }));

  onSettled(() => {
    const listener = (event: ToastEvent) => {
      if (event.kind === "dismiss") {
        toasts.list.filter((t) => event.id === undefined || t.id === event.id).forEach((t) => close(t.id));
        return;
      }
      setToasts((s) => {
        const existing = s.list.find((t) => t.id === event.toast.id);
        if (existing) {
          Object.assign(existing, event.toast, { closing: false, version: existing.version + 1 });
        } else {
          s.list.push({ ...event.toast, version: 0 });
        }
      });
      // Past the limit, the oldest open toasts make room.
      flush();
      const open = toasts.list.filter((t) => !t.closing);
      open.slice(0, Math.max(0, open.length - (props.max ?? 3))).forEach((t) => close(t.id));
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  });

  const side = () => (props.position ?? "bottom-right").split("-") as ["top" | "bottom", "left" | "center" | "right"];

  return (
    <section
      aria-label="Notifications"
      {...rest}
      class={[styles.region, "yosegi-toaster", props.class]}
      data-y={side()[0]}
      data-x={{ left: "start", center: "center", right: "end" }[side()[1]]}
      // Hovering or focusing the toasts holds their timers, so there's time to read and act.
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusIn={() => setPaused(true)}
      onFocusOut={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false);
      }}
    >
      <ol class={[styles.list, "yosegi-toaster-list"]} aria-live="polite">
        <For each={toasts.list}>
          {(item) => (
            <ToastItem
              toast={item}
              paused={paused()}
              duration={props.duration ?? 4000}
              onClose={() => close(item.id)}
              onRemove={() => remove(item.id)}
            />
          )}
        </For>
      </ol>
    </section>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5M8 11h.01" />
    </svg>
  );
}

function ToastItem(props: {
  toast: ToastData;
  paused: boolean;
  duration: number;
  onClose: () => void;
  onRemove: () => void;
}) {
  let remaining = 0;
  let version = -1;

  // The timer runs while not paused; an update (a new version) starts it again.
  createEffect(
    // Everything the timer depends on is read here, where it's tracked; the
    // callback below only uses what it's handed.
    () => [props.paused, props.toast.type, props.toast.version, props.toast.closing, props.toast.duration ?? props.duration] as const,
    ([paused, type, currentVersion, closing, duration]) => {
      if (currentVersion !== version) {
        version = currentVersion;
        remaining = duration;
      }
      if (paused || closing || type === "loading" || !Number.isFinite(remaining)) return;
      const started = Date.now();
      const timer = setTimeout(props.onClose, remaining);
      return () => {
        clearTimeout(timer);
        remaining -= Date.now() - started;
      };
    },
  );

  // If there is no exit animation, there is no animationend to wait for.
  createEffect(
    () => props.toast.closing,
    (closing) => {
      if (!closing) return;
      const fallback = setTimeout(props.onRemove, 400);
      return () => clearTimeout(fallback);
    },
  );

  return (
    <li
      class={[styles.toast, "yosegi-toast"]}
      role={props.toast.type === "error" ? "alert" : "status"}
      data-type={props.toast.type}
      data-closing={props.toast.closing ? "" : undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && props.toast.closing) props.onRemove();
      }}
    >
      <Show when={props.toast.type !== "default"}>
        <span class={[styles.icon, "yosegi-toast-icon"]} aria-hidden="true">
          {props.toast.type === "loading" ? <Spinner /> : props.toast.type === "error" ? <ErrorIcon /> : <TickIcon />}
        </span>
      </Show>
      <div class={[styles.content, "yosegi-toast-content"]}>
        <p class={[styles.title, "yosegi-toast-title"]}>{props.toast.title}</p>
        <Show when={props.toast.description}>
          <p class={[styles.description, "yosegi-toast-description"]}>{props.toast.description}</p>
        </Show>
      </div>
      <Show when={props.toast.action}>
        {(action) => (
          <Button
            label={action().label}
            class={[styles.action, "yosegi-toast-action"]}
            size="sm"
            variant="outline"
            onClick={() => {
              action().onClick();
              props.onClose();
            }}
          />
        )}
      </Show>
      <button type="button" class={[styles.close, "yosegi-toast-close"]} aria-label="Dismiss" onClick={() => props.onClose()}>
        <CloseIcon />
      </button>
    </li>
  );
}
