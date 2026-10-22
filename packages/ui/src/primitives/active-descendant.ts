/**
 * Moves a highlight through the items of a list while focus stays in an
 * input, the way a combobox or a command menu works: the input points at the
 * highlighted item with aria-activedescendant. Disabled items are skipped and
 * the ends wrap around. Returns the item to highlight, or undefined.
 */
export function nextItem(
  list: Element | undefined,
  current: string | undefined,
  move: "next" | "prev" | "first" | "last",
  selector = "[data-item]:not([data-disabled]):not([hidden])",
) {
  if (!list) return;
  const items = [...list.querySelectorAll<HTMLElement>(selector)];
  if (items.length === 0) return;

  const index = items.findIndex((item) => item.dataset.value === current);
  const target = {
    first: 0,
    last: items.length - 1,
    next: index === -1 || index === items.length - 1 ? 0 : index + 1,
    prev: index <= 0 ? items.length - 1 : index - 1,
  }[move];

  items[target].scrollIntoView({ block: "nearest" });
  return items[target];
}
