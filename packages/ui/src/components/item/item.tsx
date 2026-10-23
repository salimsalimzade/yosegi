import type { JSX } from "@solidjs/web";
import { children, createContext, omit, Show, useContext } from "solid-js";
import { createPart, createTag, type PartProps } from "../../primitives/create-part";
import { dataAttr } from "../../primitives/dom";
import styles from "./item.module.scss";

const InGroup = createContext(false);

/**
 * A row of content: media, a title and description, and actions. Give it a
 * title and it builds the row itself, with any children after the content.
 * Without one, put the parts together yourself.
 */
export interface ItemProps extends Omit<PartProps, "title"> {
  /** An icon, picture or initials at the start. */
  media?: JSX.Element;
  /** How the media is framed, as on Item.Media. default by default. */
  mediaVariant?: ItemMediaProps["variant"];
  /** The row's title. It isn't the HTML title attribute. */
  title?: JSX.Element;
  description?: JSX.Element;
  /** Buttons or an icon at the end. */
  actions?: JSX.Element;
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
  const rest = omit(
    props,
    "as",
    "variant",
    "size",
    "interactive",
    "selected",
    "disabled",
    "class",
    "children",
    "media",
    "mediaVariant",
    "title",
    "description",
    "actions",
  );

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
      {"title" in props ? <Built {...omit(props, "children")}>{props.children}</Built> : props.children}
    </Tag>
  );
}

/** The media, content and actions from the root's props, when it has a title. */
function Built(props: ItemProps) {
  const media = children(() => props.media);
  const description = children(() => props.description);
  const actions = children(() => props.actions);

  return (
    <>
      <Show when={media()}>
        <Media variant={props.mediaVariant}>{media()}</Media>
      </Show>
      <Content>
        <Title>{props.title}</Title>
        <Show when={description()}>
          <Description>{description()}</Description>
        </Show>
      </Content>
      {props.children}
      <Show when={actions()}>
        <Actions>{actions()}</Actions>
      </Show>
    </>
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

const Content = createPart("div", styles.content, "yosegi-item-content");
const Title = createPart("div", styles.title, "yosegi-item-title");
const Description = createPart<HTMLParagraphElement>("p", styles.description, "yosegi-item-description");
const Actions = createPart("div", styles.actions, "yosegi-item-actions");

export const Item = Object.assign(ItemRoot, {
  Group,
  Separator: createPart<HTMLHRElement>("hr", styles.separator, "yosegi-item-separator", { "aria-hidden": "true" }),
  Media,
  Content,
  Title,
  Description,
  Actions,
  Header: createPart("div", styles.header, "yosegi-item-header"),
  Footer: createPart("div", styles.footer, "yosegi-item-footer"),
});
