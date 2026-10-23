import type { JSX } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import { Button, ButtonGroup, Toaster } from "yosegi";
import { catalog, groups, playgroundPath } from "../catalog";
import styles from "./shell.module.scss";

type Theme = "system" | "light" | "dark";

/** The playground frame: the components grouped like the design system, and a theme switch. */
export function Shell(props: { children?: JSX.Element }) {
  const [theme, setTheme] = createSignal<Theme>("system");

  const choose = (next: Theme) => {
    setTheme(next);
    if (next === "system") delete document.documentElement.dataset.yosegiTheme;
    else document.documentElement.dataset.yosegiTheme = next;
  };

  return (
    <div class={styles.shell}>
      <nav class={styles.sidebar} aria-label="Components">
        <a class={styles.brand} href={playgroundPath()}>
          <span class={styles.name}>Yosegi</span>
          <span class={styles.tagline}>Playground</span>
        </a>
        <For each={groups}>
          {(group) => (
            <div class={styles.group}>
              <p class={styles["group-name"]}>{group}</p>
              <For each={catalog.filter((entry) => entry.group === group)}>
                {(entry) => (
                  <a class={styles.link} href={playgroundPath(entry.slug)}>
                    {entry.name}
                  </a>
                )}
              </For>
            </div>
          )}
        </For>
      </nav>
      <main class={styles.main}>
        <div class={styles.topbar}>
          <ButtonGroup attached aria-label="Theme">
            <For each={["system", "light", "dark"] as const}>
              {(value) => (
                <Button
                  label={value[0].toUpperCase() + value.slice(1)}
                  size="sm"
                  variant="outline"
                  aria-pressed={theme() === value}
                  onClick={() => choose(value)}
                />
              )}
            </For>
          </ButtonGroup>
        </div>
        <div class={styles.content}>{props.children}</div>
      </main>
      <Toaster />
    </div>
  );
}
