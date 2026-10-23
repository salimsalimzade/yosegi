import { createEffect } from "solid-js";

export interface DismissOptions {
  /** Listen only while this is true, usually while the layer is open. */
  enabled: () => boolean;
  /** Clicks inside any of these elements don't dismiss. */
  inside: () => (Element | undefined)[];
  onDismiss: (reason: "escape" | "outside") => void;
  /** false to ignore clicks outside, such as for a tooltip. */
  outside?: boolean;
}

// The open layers, in the order they opened. Escape closes only the last one,
// so a tooltip over a popover closes first, and a layer held open doesn't
// keep Escape from the ones above it.
const layers: object[] = [];

/** Closes a floating layer on Escape and on a press outside it. */
export function createDismiss(options: DismissOptions) {
  createEffect(
    () => options.enabled(),
    (enabled) => {
      if (!enabled) return;
      const layer = {};
      layers.push(layer);

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape" || event.defaultPrevented || layers.at(-1) !== layer) return;
        event.preventDefault();
        options.onDismiss("escape");
      };

      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        if (options.inside().some((el) => el?.contains(target))) return;
        options.onDismiss("outside");
      };

      document.addEventListener("keydown", onKeyDown);
      if (options.outside !== false) document.addEventListener("pointerdown", onPointerDown);

      return () => {
        layers.splice(layers.indexOf(layer), 1);
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("pointerdown", onPointerDown);
      };
    },
  );
}
