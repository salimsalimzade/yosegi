import { createSignal, flush } from "solid-js";

export type Theme = "light" | "dark";

const storageKey = "yosegi:theme";
const root = document.documentElement;

// The theme index.html applied from an earlier visit, or the OS setting.
const [theme, setTheme] = createSignal<Theme>(
  root.dataset.yosegiTheme === "dark" || root.dataset.yosegiTheme === "light"
    ? root.dataset.yosegiTheme
    : matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
);

export { theme };

function apply(next: Theme) {
  root.dataset.yosegiTheme = next;
  try {
    localStorage.setItem(storageKey, next);
  } catch {}
  setTheme(next);
  // Render the new theme now, inside the view transition's snapshot.
  flush();
}

/**
 * Switches between light and dark. The new theme grows out of `origin` in a circle;
 * without view transitions, colours fade instead, and with reduced motion they just change.
 */
export function toggleTheme(origin?: Element) {
  const next: Theme = theme() === "dark" ? "light" : "dark";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return apply(next);

  if (!document.startViewTransition) {
    root.dataset.themeChanging = "";
    apply(next);
    setTimeout(() => delete root.dataset.themeChanging, 320);
    return;
  }

  const rect = origin?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : innerWidth - 40;
  const y = rect ? rect.top + rect.height / 2 : 32;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const transition = document.startViewTransition(() => apply(next));
  transition.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 420, easing: "cubic-bezier(0.2, 0, 0, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}
