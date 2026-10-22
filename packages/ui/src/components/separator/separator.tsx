import type { JSX } from "@solidjs/web";
import { children, omit, Show } from "solid-js";
import styles from "./separator.module.scss";

/** A hairline between groups of content, across or down. */
export interface SeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** horizontal (default) runs across; vertical runs down, between items in a row. */
  orientation?: "horizontal" | "vertical";
  /**
   * true (default) when the line is only visual and screen readers skip it.
   * false when it divides content in a way that matters, like groups in a menu.
   */
  decorative?: boolean;
}

/**
 * A line, or with children a labelled line ("or") that has the words in the
 * middle. A labelled separator is always horizontal.
 */
export function Separator(props: SeparatorProps) {
  const label = children(() => props.children);
  const orientation = () => props.orientation ?? "horizontal";
  const rest = omit(props, "orientation", "decorative", "class", "children");

  return (
    <Show
      when={label.toArray().length > 0}
      fallback={
        <div
          {...rest}
          class={[styles.root, "yosegi-separator", props.class]}
          role={props.decorative === false ? "separator" : "none"}
          aria-orientation={props.decorative === false && orientation() === "vertical" ? "vertical" : undefined}
          data-orientation={orientation()}
        />
      }
    >
      <div {...rest} class={[styles.labelled, "yosegi-separator", props.class]} role="separator" data-orientation="horizontal">
        <span class="yosegi-separator-label">{label()}</span>
      </div>
    </Show>
  );
}
