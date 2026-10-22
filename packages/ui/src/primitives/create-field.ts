import { createSignal, createUniqueId, onSettled } from "solid-js";

export interface FieldState {
  validationState?: "valid" | "invalid";
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * The ids and states a labelled field shares between its parts: the label
 * points at the control, and the control is described by the hint or, while
 * invalid, by the error message. Only parts that are rendered are referenced.
 */
export function createField(props: FieldState, prefix: string) {
  const id = `${prefix}-${createUniqueId()}`;
  const [hasDescription, setHasDescription] = createSignal(false, { ownedWrite: true });
  const [hasError, setHasError] = createSignal(false, { ownedWrite: true });

  const invalid = () => props.validationState === "invalid";

  return {
    controlId: `${id}-control`,
    labelId: `${id}-label`,
    descriptionId: `${id}-description`,
    errorId: `${id}-error`,
    invalid,
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
