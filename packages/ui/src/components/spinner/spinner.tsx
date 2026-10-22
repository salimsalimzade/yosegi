import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { mergeStyle } from "../../primitives/dom";
import styles from "./spinner.module.scss";

/** A turning ring for work in progress. Decorative next to text; announced with a label when alone. */
export interface SpinnerProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** 16 by default. */
  size?: number;
  /** When set, renders role="status" with this aria-label. */
  label?: string;
}

export function Spinner(props: SpinnerProps) {
  const rest = omit(props, "size", "label", "class", "style", "children");

  return (
    <span
      {...rest}
      class={[styles.root, "yosegi-spinner", props.class]}
      style={mergeStyle({ "--yosegi-spinner-size": props.size ? `${props.size}px` : undefined }, props.style)}
      role={props.label ? "status" : undefined}
      aria-label={props.label}
      aria-hidden={props.label ? undefined : "true"}
    />
  );
}
