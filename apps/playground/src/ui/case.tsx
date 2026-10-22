import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import styles from "./case.module.scss";

export interface CaseProps {
  title: string;
  description?: string;
  /** row (default) lays examples side by side; stack puts them one under another; fill gives the example the full width; center centres one example. */
  layout?: "row" | "stack" | "fill" | "center";
  children: JSX.Element;
}

/** One case of a component, in its own frame, with a title saying what it shows. */
export function Case(props: CaseProps) {
  return (
    <section class={styles.case}>
      <div class={styles.heading}>
        <h3 class={styles.title}>{props.title}</h3>
        <Show when={props.description}>
          <p class={styles.description}>{props.description}</p>
        </Show>
      </div>
      <div class={styles.stage} data-layout={props.layout ?? "row"}>
        {props.children}
      </div>
    </section>
  );
}

/** Cases side by side on wide screens. */
export function Cases(props: { children: JSX.Element }) {
  return <div class={styles.grid}>{props.children}</div>;
}
