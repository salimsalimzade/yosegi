import type { JSX } from "@solidjs/web";
import { children, createSignal, createUniqueId, onSettled } from "solid-js";

export interface FieldState {
  validationState?: "valid" | "invalid";
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

/** The text a field shows around its control. With no children, the field builds its parts from these. */
export interface FieldTextProps {
  label?: JSX.Element;
  /** A hint under the box, hidden while the field is invalid. */
  description?: JSX.Element;
  /** Shown under the box, and marks the field invalid, whenever it's set. validationState="valid" overrides it. */
  errorMessage?: JSX.Element;
}

const isSet = (value: unknown) =>
  value !== undefined &&
  value !== null &&
  value !== false &&
  value !== "" &&
  !(Array.isArray(value) && value.length === 0);

/**
 * The ids and states a labelled field shares between its parts: the label
 * points at the control, and the control is described by the hint or, while
 * invalid, by the error message. Only parts that are rendered are referenced.
 */
export function createField(props: FieldState & Pick<FieldTextProps, "errorMessage">, prefix: string) {
  const id = `${prefix}-${createUniqueId()}`;
  const [hasDescription, setHasDescription] = createSignal(false, { ownedWrite: true });
  const [hasError, setHasError] = createSignal(false, { ownedWrite: true });
  // Read once: a JSX prop makes new elements every time it's read.
  const errorText = children(() => props.errorMessage);

  const invalid = () =>
    props.validationState === "invalid" || (props.validationState !== "valid" && isSet(errorText()));

  return {
    controlId: `${id}-control`,
    labelId: `${id}-label`,
    descriptionId: `${id}-description`,
    errorId: `${id}-error`,
    invalid,
    /** The root's errorMessage, for an ErrorMessage part with no children. */
    errorText,
    hasErrorText: () => isSet(errorText()),
    disabled: () => !!props.disabled,
    required: () => !!props.required,
    readOnly: () => !!props.readOnly,
    describedBy: () =>
      [hasDescription() && !invalid() && `${id}-description`, hasError() && invalid() && `${id}-error`]
        .filter(Boolean)
        .join(" ") || undefined,
    errorMessage: () => (hasError() && invalid() ? `${id}-error` : undefined),
    /** Call from a Description or ErrorMessage part, so the control references it. */
    register(part: "description" | "error") {
      const set = part === "description" ? setHasDescription : setHasError;
      onSettled(() => {
        set(true);
        return () => set(false);
      });
    },
  };
}

export type Field = ReturnType<typeof createField>;
