import { arrow, autoUpdate, computePosition, flip, offset, shift, size, type Placement } from "@floating-ui/dom";
import { createEffect } from "solid-js";

export type { Placement };

export interface FloatingOptions {
  open: () => boolean;
  reference: () => Element | undefined;
  floating: () => HTMLElement | undefined;
  arrow?: () => HTMLElement | undefined;
  placement: () => Placement;
  /** Space between the reference and the floating element, in px. */
  gutter: () => number;
  sameWidth?: () => boolean;
  /** Sets `--yosegi-{name}-content-transform-origin`, so the scale-in starts from the reference. */
  name: string;
}

const SIDE_ORIGIN = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
} as const;

/** The corner or edge of the floating element that touches the reference, e.g. "top left" for bottom-start. */
function transformOrigin(placement: Placement) {
  const [side, align] = placement.split("-") as [keyof typeof SIDE_ORIGIN, "start" | "end" | undefined];
  const vertical = side === "top" || side === "bottom";
  const cross =
    align === "start" ? (vertical ? "left" : "top") : align === "end" ? (vertical ? "right" : "bottom") : "center";
  return vertical ? `${SIDE_ORIGIN[side]} ${cross}` : `${cross} ${SIDE_ORIGIN[side]}`;
}

/**
 * Keeps a floating element (tooltip, popover, calendar) next to its reference
 * while open: flips to the other side when there is no room, shifts to stay on
 * screen, and writes `data-placement` with where it ended up.
 *
 * It positions with top and left, leaving `transform` free for the open
 * animation. Until the first position is known there is no data-placement,
 * which the styles use to keep the element hidden.
 */
export function createFloating(options: FloatingOptions) {
  // Everything the position depends on is read here, where it's tracked, so a
  // new placement or gutter moves an open panel; the callback only uses what it's handed.
  createEffect(
    () =>
      [
        options.open(),
        options.reference(),
        options.floating(),
        options.arrow?.(),
        options.placement(),
        options.gutter(),
        !!options.sameWidth?.(),
      ] as const,
    ([open, reference, floating, arrowEl, placement, gutter, sameWidth]) => {
      if (!open || !reference || !floating) return;

      floating.style.position = "fixed";
      delete floating.dataset.placement;

      const update = async () => {
        const result = await computePosition(reference, floating, {
          strategy: "fixed",
          placement,
          middleware: [
            offset(gutter),
            flip({ padding: 8 }),
            shift({ padding: 8 }),
            sameWidth &&
              size({
                apply: ({ rects }) => {
                  floating.style.width = `${rects.reference.width}px`;
                },
              }),
            arrowEl && arrow({ element: arrowEl, padding: 8 }),
          ],
        });

        const side = result.placement.split("-")[0] as keyof typeof SIDE_ORIGIN;
        floating.style.top = `${Math.round(result.y)}px`;
        floating.style.left = `${Math.round(result.x)}px`;
        floating.style.setProperty(
          `--yosegi-${options.name}-content-transform-origin`,
          transformOrigin(result.placement),
        );
        floating.dataset.placement = result.placement;

        if (arrowEl) {
          const data = result.middlewareData.arrow;
          const rotate = { top: 0, right: 90, bottom: 180, left: 270 }[side];
          // The arrow is drawn pointing down; it sits on the edge facing the reference.
          Object.assign(arrowEl.style, {
            position: "absolute",
            top: data?.y != null ? `${data.y}px` : "",
            right: "",
            bottom: "",
            left: data?.x != null ? `${data.x}px` : "",
            [side]: "100%",
            transform: `rotate(${rotate}deg)`,
          });
        }
      };

      return autoUpdate(reference, floating, update);
    },
  );
}
