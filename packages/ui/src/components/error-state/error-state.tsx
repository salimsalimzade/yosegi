import type { JSX, ValidComponent } from "@solidjs/web";
import { children, omit, Show } from "solid-js";
import { createPart, createTag, type PartProps } from "../../primitives/create-part";
import styles from "./error-state.module.scss";

/**
 * A centred message for something that failed to load or save. Renders
 * role="alert"; pass role={undefined} when the error is shown on purpose. Give
 * it a title and it builds itself: the icon, the title, the description, the
 * children, the detail and the actions. Without one, put the parts together
 * yourself.
 */
export interface ErrorStateProps extends Omit<PartProps, "title"> {
  icon?: JSX.Element;
  /** The heading. It isn't the HTML title attribute. */
  title?: JSX.Element;
  /** The title's element, h2 by default. */
  titleAs?: ValidComponent;
  description?: JSX.Element;
  /** An error code or reference ID people can copy and send to support. */
  detail?: JSX.Element;
  /** Buttons under the description. */
  actions?: JSX.Element;
}

function ErrorStateRoot(props: ErrorStateProps) {
  const Tag = createTag(() => props.as ?? "section");
  const rest = omit(props, "as", "icon", "title", "titleAs", "description", "detail", "actions", "class", "children");

  return (
    <Tag role="alert" {...rest} class={[styles.root, "yosegi-error-state", props.class]}>
      {"title" in props ? <Built {...omit(props, "children")}>{props.children}</Built> : props.children}
    </Tag>
  );
}

/** The icon, title, description, detail and actions from the root's props, when it has a title. */
function Built(props: ErrorStateProps) {
  const icon = children(() => props.icon);
  const description = children(() => props.description);
  const detail = children(() => props.detail);
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
      <Show when={detail()}>
        <Detail>{detail()}</Detail>
      </Show>
      <Show when={actions()}>
        <Actions>{actions()}</Actions>
      </Show>
    </>
  );
}

const Icon = createPart("div", styles.icon, "yosegi-error-state-icon", { "aria-hidden": "true" });
/** An h2 by default. */
const Title = createPart<HTMLHeadingElement>("h2", styles.title, "yosegi-error-state-title");
const Description = createPart<HTMLParagraphElement>("p", styles.description, "yosegi-error-state-description");
/** An error code or reference ID people can copy and send to support. */
const Detail = createPart<HTMLParagraphElement>("p", styles.detail, "yosegi-error-state-detail");
const Actions = createPart("div", styles.actions, "yosegi-error-state-actions");

export const ErrorState = Object.assign(ErrorStateRoot, { Icon, Title, Description, Detail, Actions });
