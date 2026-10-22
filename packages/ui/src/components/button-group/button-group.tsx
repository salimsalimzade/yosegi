import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { dataAttr } from "../../primitives/dom";
import styles from "./button-group.module.scss";

/** Related Buttons, spaced apart or attached into one control. */
export interface ButtonGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Join the buttons: shared borders, rounded outer corners only. */
  attached?: boolean;
  /** horizontal by default. */
  orientation?: "horizontal" | "vertical";
}

export function ButtonGroup(props: ButtonGroupProps) {
  const rest = omit(props, "attached", "orientation", "class", "children");

  return (
    <div
      role="group"
      {...rest}
      class={[styles.root, "yosegi-button-group", props.class]}
      aria-orientation={props.orientation === "vertical" ? "vertical" : undefined}
      data-orientation={props.orientation ?? "horizontal"}
      data-attached={dataAttr(props.attached)}
    >
      {props.children}
    </div>
  );
}
