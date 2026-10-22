import type { JSX } from "@solidjs/web";
import { omit, Show } from "solid-js";
import type { Field } from "./create-field";

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
      <p id={field.errorId} role="alert" {...rest} class={[classes.errorMessage, `${prefix}-error-message`, props.class]}>
        {props.children}
      </p>
    );
  }

  /** Renders only while the field is invalid. */
  function ErrorMessage(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
    const field = useField();
    return (
      <Show when={field.invalid()}>
        <Message {...props} />
      </Show>
    );
  }

  return { Label, Description, ErrorMessage };
}
