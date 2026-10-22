import { dynamic, type JSX, type ValidComponent } from "@solidjs/web";
import { omit, type Component } from "solid-js";

/** Props every part takes: its element's attributes, `class`, `style` and `as`. */
export type PartProps<E extends HTMLElement = HTMLElement> = JSX.HTMLAttributes<E> & {
  /** Render a different element or component, keeping the part's classes. */
  as?: ValidComponent;
};

/** A component that renders `props.as`, or the fallback tag when it isn't set. */
export function createTag(source: () => ValidComponent): Component<Record<string, any>> {
  return dynamic(source) as Component<Record<string, any>>;
}

/**
 * A part with no behaviour of its own, like Item.Content or EmptyState.Title:
 * an element with the module class, the stable `yosegi-*` class and any class
 * the app passes, in that order.
 */
export function createPart<E extends HTMLElement = HTMLElement>(
  tag: string,
  moduleClass: string,
  stableClass: string,
  defaults: Record<string, unknown> = {},
) {
  return (props: PartProps<E>) => {
    const Tag = createTag(() => props.as ?? tag);
    const rest = omit(props, "as", "class", "children");
    return (
      <Tag {...defaults} {...rest} class={[moduleClass, stableClass, props.class]}>
        {props.children}
      </Tag>
    );
  };
}
