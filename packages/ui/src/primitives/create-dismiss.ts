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

/** Closes a floating layer on Escape and on a press outside it. */
export function createDismiss(options: DismissOptions) {
  createEffect(
    () => options.enabled(),
    (enabled) => {
      if (!enabled) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape" || event.defaultPrevented) return;
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
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("pointerdown", onPointerDown);
      };
    },
  );
}
