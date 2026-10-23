import type { JSX } from "@solidjs/web";
import { children, type Component, omit, Show, untrack } from "solid-js";
import type { Field, FieldTextProps } from "./create-field";

interface FieldPartClasses {
  label: string;
  description: string;
  errorMessage: string;
}

/**
 * The Label, Description and ErrorMessage every field has, wired to the
 * field's ids: the label points at the control, and the control is described
 * by whichever of the other two is showing.
 */
export function createFieldParts(useField: () => Field, classes: FieldPartClasses, prefix: string) {
  function Label(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
    const field = useField();
    const rest = omit(props, "class", "children");
    return (
      <label id={field.labelId} for={field.controlId} {...rest} class={[classes.label, `${prefix}-label`, props.class]}>
        {props.children}
      </label>
    );
  }

  function Description(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
    const field = useField();
    field.register("description");
    const rest = omit(props, "class", "children");
    return (
      <p id={field.descriptionId} {...rest} class={[classes.description, `${prefix}-description`, props.class]}>
        {props.children}
      </p>
    );
  }

  function Message(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
    const field = useField();
    field.register("error");
    const rest = omit(props, "class", "children");
    return (
      <p
        id={field.errorId}
        role="alert"
        {...rest}
        class={[classes.errorMessage, `${prefix}-error-message`, props.class]}
      >
        {props.children ?? field.errorText()}
      </p>
    );
  }

  /** Renders only while the field is invalid. With no children, it shows the root's errorMessage. */
  function ErrorMessage(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
    const field = useField();
    return (
      <Show when={field.invalid()}>
        <Message {...props} />
      </Show>
    );
  }

  /**
   * A field with no children: Label, the control, Description and the error
   * message, from the root's label, description and errorMessage.
   */
  function Layout(
    props: Pick<FieldTextProps, "label" | "description"> & {
      /** The field's own Label, when it differs from the shared one. */
      labelPart?: Component<{ children: JSX.Element }>;
      children: JSX.Element;
    },
  ) {
    const field = useField();
    const LabelPart = untrack(() => props.labelPart) ?? Label;
    const label = children(() => props.label);
    const description = children(() => props.description);
    return (
      <>
        <Show when={label()}>
          <LabelPart>{label()}</LabelPart>
        </Show>
        {props.children}
        <Show when={description()}>
          <Description>{description()}</Description>
        </Show>
        <Show when={field.hasErrorText()}>
          <ErrorMessage />
        </Show>
      </>
    );
  }

  return { Label, Description, ErrorMessage, Layout };
}
