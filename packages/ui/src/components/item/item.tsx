import type { JSX } from "@solidjs/web";
import { createContext, omit, useContext } from "solid-js";
import { createPart, createTag, type PartProps } from "../../primitives/create-part";
import { dataAttr } from "../../primitives/dom";
import styles from "./item.module.scss";

const InGroup = createContext(false);

/** A row of content: media, a title and description, and actions. */
export interface ItemProps extends PartProps {
  /** default is plain; outline adds a border; muted fills it. */
  variant?: "default" | "outline" | "muted";
  /** md (default), sm, or xs for dense lists. */
  size?: "md" | "sm" | "xs";
  /** Hover styles for a row that does something on click, when it isn't rendered as a link or button. */
  interactive?: boolean;
  /** The chosen row in a set, with an accent edge. */
  selected?: boolean;
  disabled?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

function ItemRoot(props: ItemProps) {
  const inGroup = useContext(InGroup);
  const Tag = createTag(() => props.as ?? "div");
  const rest = omit(props, "as", "variant", "size", "interactive", "selected", "disabled", "class", "children");

  return (
    <Tag
      // Inside a Group it's a list item, unless it's a link or a button, whose role must stay.
      role={inGroup && !props.as ? "listitem" : undefined}
      {...rest}
      class={[styles.root, "yosegi-item", props.class]}
      aria-disabled={props.disabled ? "true" : undefined}
      data-variant={props.variant ?? "default"}
      data-size={props.size ?? "md"}
      data-interactive={dataAttr(props.interactive)}
      data-selected={dataAttr(props.selected)}
      data-disabled={dataAttr(props.disabled)}
    >
      {props.children}
    </Tag>
  );
}

export interface ItemMediaProps extends PartProps {
  /** default leaves the content as it is; icon frames an icon; image crops a picture; avatar makes it round. */
  variant?: "default" | "icon" | "image" | "avatar";
}

function Media(props: ItemMediaProps) {
  const Tag = createTag(() => props.as ?? "div");
  const rest = omit(props, "as", "variant", "class", "children");

  return (
    <Tag {...rest} class={[styles.media, "yosegi-item-media", props.class]} data-variant={props.variant ?? "default"}>
      {props.children}
    </Tag>
  );
}

/** Related Items as a list. */
function Group(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, "class", "children");
  return (
    <InGroup value={true}>
      <div role="list" {...rest} class={[styles.group, "yosegi-item-group", props.class]}>
        {props.children}
      </div>
    </InGroup>
  );
}

export const Item = Object.assign(ItemRoot, {
  Group,
  Separator: createPart<HTMLHRElement>("hr", styles.separator, "yosegi-item-separator", { "aria-hidden": "true" }),
  Media,
  Content: createPart("div", styles.content, "yosegi-item-content"),
  Title: createPart("div", styles.title, "yosegi-item-title"),
  Description: createPart<HTMLParagraphElement>("p", styles.description, "yosegi-item-description"),
  Actions: createPart("div", styles.actions, "yosegi-item-actions"),
  Header: createPart("div", styles.header, "yosegi-item-header"),
  Footer: createPart("div", styles.footer, "yosegi-item-footer"),
});
