import type { JSX } from "@solidjs/web";

/** Calls a Solid event handler prop, in either its plain or its bound `[fn, data]` form. */
export function callHandler(handler: unknown, event: Event) {
  if (typeof handler === "function") {
    handler(event);
  } else if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
}

/** Adds custom properties to a `style` prop, in either its object or string form. */
export function mergeStyle(
  vars: Record<string, string | undefined>,
  style: JSX.CSSProperties | string | false | undefined,
) {
  if (typeof style !== "string") return { ...vars, ...(style || {}) } as JSX.CSSProperties;

  const declarations = Object.entries(vars)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name}:${value}`);
  return [...declarations, style].join(";");
}

/** A data attribute that is present when true and absent otherwise. */
export function dataAttr(condition: unknown) {
  return condition ? "" : undefined;
}

const FOCUSABLE = [
  "a[href]",
  "button:not(:disabled)",
  "input:not(:disabled):not([type='hidden'])",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

export function getFocusable(container: Element) {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.closest("[inert]") && el.getClientRects().length > 0,
  );
}

/** Focuses the first focusable element inside, or the container itself. */
export function focusFirst(container: HTMLElement) {
  const [first] = getFocusable(container);
  (first ?? container).focus({ preventScroll: true });
}
