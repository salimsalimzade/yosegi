export type Orientation = "horizontal" | "vertical";

/**
 * Moves focus between sibling items with the arrow keys, Home and End, the
 * way a tab list or a stack of accordion headers works. Disabled items are
 * skipped and the ends wrap around. Returns the newly focused item.
 */
export function moveFocus(event: KeyboardEvent, items: HTMLElement[], orientation: Orientation) {
  const enabled = items.filter((item) => !item.hasAttribute("disabled") && item.getAttribute("aria-disabled") !== "true");
  const index = enabled.indexOf(event.currentTarget as HTMLElement);
  if (index === -1 || enabled.length === 0) return;

  const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
  const prev = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
  const last = enabled.length - 1;

  const target = {
    [next]: index === last ? 0 : index + 1,
    [prev]: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }[event.key];

  if (target === undefined) return;
  event.preventDefault();
  enabled[target].focus();
  return enabled[target];
}
