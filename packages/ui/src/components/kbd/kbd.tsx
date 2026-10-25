import type { JSX } from "@solidjs/web";
import { children, For, omit, Show } from "solid-js";
import styles from "./kbd.module.scss";

/** One key, drawn as a keycap: ⌘, Shift, K. */
export interface KbdProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * What screen readers say instead of the key, for a symbol like ⌘ ("Command") that they read
   * badly or not at all. Text keys like "Ctrl" don't need one.
   */
  label?: string;
}

export function Kbd(props: KbdProps) {
  // Read once: children build their elements again on every read.
  const content = children(() => props.children);
  const rest = omit(props, "label", "class", "children");
  return (
    <kbd {...rest} class={[styles.root, "yosegi-kbd", props.class]}>
      <Show when={props.label} fallback={content()}>
        <span aria-hidden="true">{content()}</span>
        <span class={styles["visually-hidden"]}>{props.label}</span>
      </Show>
    </kbd>
  );
}

/** A key in KbdGroup's `keys`: its text, or its text and what screen readers say instead. */
export type KbdKey = string | { key: string; label?: string };

/** Keys pressed together, like ⌘ K. Give it `keys` and it draws a Kbd for each, or put Kbds inside yourself. */
export interface KbdGroupProps extends JSX.HTMLAttributes<HTMLElement> {
  /** One Kbd for each, in order. Give a symbol its label: `{ key: "⌘", label: "Command" }`. */
  keys?: KbdKey[];
  /** Shown between the `keys`, like "+" or "then". Nothing by default. */
  separator?: string;
}

export function KbdGroup(props: KbdGroupProps) {
  const rest = omit(props, "keys", "separator", "class", "children");
  return (
    <kbd {...rest} class={[styles.group, "yosegi-kbd-group", props.class]}>
      {props.keys ? (
        <For each={props.keys}>
          {(key, index) => (
            <>
              <Show when={props.separator && index() > 0}>
                <span class={[styles.separator, "yosegi-kbd-separator"]}>{props.separator}</span>
              </Show>
              {typeof key === "string" ? <Kbd>{key}</Kbd> : <Kbd label={key.label}>{key.key}</Kbd>}
            </>
          )}
        </For>
      ) : (
        props.children
      )}
    </kbd>
  );
}
