import type { JSX, ValidComponent } from "@solidjs/web";
import { children, omit, Show } from "solid-js";
import { createPart, createTag, type PartProps } from "../../primitives/create-part";
import styles from "./not-found.module.scss";

/**
 * A centred message for a page or item that doesn't exist. Give it a title and
 * it builds itself: the code, the title, the description, the children and the
 * actions. Without one, put the parts together yourself.
 */
export interface NotFoundProps extends Omit<PartProps, "title"> {
  /** A large decorative code such as "404", hidden from screen readers. Size it with --yosegi-not-found-code-size. */
  code?: JSX.Element;
  /** The heading. It isn't the HTML title attribute. */
  title?: JSX.Element;
  /** The title's element, h1 by default. */
  titleAs?: ValidComponent;
  description?: JSX.Element;
  /** Buttons under the description. */
  actions?: JSX.Element;
}

function NotFoundRoot(props: NotFoundProps) {
  const Tag = createTag(() => props.as ?? "section");
  const rest = omit(props, "as", "code", "title", "titleAs", "description", "actions", "class", "children");

  return (
    <Tag {...rest} class={[styles.root, "yosegi-not-found", props.class]}>
      {"title" in props ? <Built {...omit(props, "children")}>{props.children}</Built> : props.children}
    </Tag>
  );
}

/** The code, title, description and actions from the root's props, when it has a title. */
function Built(props: NotFoundProps) {
  const code = children(() => props.code);
  const description = children(() => props.description);
  const actions = children(() => props.actions);

  return (
    <>
      <Show when={code()}>
        <Code>{code()}</Code>
      </Show>
      <Title as={props.titleAs}>{props.title}</Title>
      <Show when={description()}>
        <Description>{description()}</Description>
      </Show>
      {props.children}
      <Show when={actions()}>
        <Actions>{actions()}</Actions>
      </Show>
    </>
  );
}

/** A large decorative code such as "404", hidden from screen readers. */
const Code = createPart<HTMLParagraphElement>("p", styles.code, "yosegi-not-found-code", { "aria-hidden": "true" });
/** An h1 by default. */
const Title = createPart<HTMLHeadingElement>("h1", styles.title, "yosegi-not-found-title");
const Description = createPart<HTMLParagraphElement>("p", styles.description, "yosegi-not-found-description");
const Actions = createPart("div", styles.actions, "yosegi-not-found-actions");

export const NotFound = Object.assign(NotFoundRoot, { Code, Title, Description, Actions });
