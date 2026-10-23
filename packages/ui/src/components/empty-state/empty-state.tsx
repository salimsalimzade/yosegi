import type { JSX, ValidComponent } from "@solidjs/web";
import { children, omit, Show } from "solid-js";
import { createPart, createTag, type PartProps } from "../../primitives/create-part";
import styles from "./empty-state.module.scss";

/**
 * A centred message for a list or page with nothing in it yet. Give it a title
 * and it builds itself: the icon, the title, the description, the children and
 * the actions. Without one, put the parts together yourself.
 */
export interface EmptyStateProps extends Omit<PartProps, "title"> {
  icon?: JSX.Element;
  /** The heading. It isn't the HTML title attribute. */
  title?: JSX.Element;
  /** The title's element, h2 by default. */
  titleAs?: ValidComponent;
  description?: JSX.Element;
  /** Buttons under the description. */
  actions?: JSX.Element;
}

function EmptyStateRoot(props: EmptyStateProps) {
  const Tag = createTag(() => props.as ?? "section");
  const rest = omit(props, "as", "icon", "title", "titleAs", "description", "actions", "class", "children");

  return (
    <Tag {...rest} class={[styles.root, "yosegi-empty-state", props.class]}>
      {"title" in props ? <Built {...omit(props, "children")}>{props.children}</Built> : props.children}
    </Tag>
  );
}

/** The icon, title, description and actions from the root's props, when it has a title. */
function Built(props: EmptyStateProps) {
  const icon = children(() => props.icon);
  const description = children(() => props.description);
  const actions = children(() => props.actions);

  return (
    <>
      <Show when={icon()}>
        <Icon>{icon()}</Icon>
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

const Icon = createPart("div", styles.icon, "yosegi-empty-state-icon", { "aria-hidden": "true" });
/** An h2 by default. */
const Title = createPart<HTMLHeadingElement>("h2", styles.title, "yosegi-empty-state-title");
const Description = createPart<HTMLParagraphElement>("p", styles.description, "yosegi-empty-state-description");
const Actions = createPart("div", styles.actions, "yosegi-empty-state-actions");

export const EmptyState = Object.assign(EmptyStateRoot, { Icon, Title, Description, Actions });
