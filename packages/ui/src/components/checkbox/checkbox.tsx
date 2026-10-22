import type { JSX } from "@solidjs/web";
import { createContext, createEffect, omit, Show, useContext } from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createField, type Field, type FieldState } from "../../primitives/create-field";
import { callHandler, dataAttr } from "../../primitives/dom";
import { createFieldParts } from "../../primitives/field-parts";
import { DashIcon, TickIcon } from "../../primitives/icons";
import styles from "./checkbox.module.scss";

interface CheckboxContextValue {
  field: Field;
  checked: () => boolean;
  setChecked: (checked: boolean) => void;
  indeterminate: () => boolean;
  name: () => string | undefined;
  value: () => string | undefined;
  input?: HTMLInputElement;
}

const CheckboxContext = createContext<CheckboxContextValue>();
const useCheckbox = () => useContext(CheckboxContext);

/** A box that turns one option on or off. */
export interface CheckboxProps extends Omit<FieldState, "readOnly">, Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** The "some selected" state of a select-all box. */
  indeterminate?: boolean;
  name?: string;
  value?: string;
}

function CheckboxRoot(props: CheckboxProps) {
  const field = createField(props, "yosegi-checkbox");
  const [checked, setChecked] = createControllableSignal({
    value: () => props.checked,
    defaultValue: () => props.defaultChecked ?? false,
    onChange: (next) => props.onChange?.(next),
  });
  const rest = omit(
    props,
    "checked", "defaultChecked", "onChange", "indeterminate", "name", "value", "validationState", "required", "disabled", "class",
  );
  const ctx: CheckboxContextValue = {
    field,
    checked,
    setChecked,
    indeterminate: () => !!props.indeterminate,
    name: () => props.name,
    value: () => props.value,
  };

  return (
    <CheckboxContext value={ctx}>
      <div
        {...rest}
        class={[styles.root, "yosegi-checkbox", props.class]}
        data-checked={dataAttr(checked() && !props.indeterminate)}
        data-indeterminate={dataAttr(props.indeterminate)}
        data-invalid={dataAttr(field.invalid())}
        data-disabled={dataAttr(field.disabled())}
      />
    </CheckboxContext>
  );
}

/** The real, visually hidden checkbox input. */
function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  const ctx = useCheckbox();
  const rest = omit(props, "class", "onChange", "ref", "children");
  let input: HTMLInputElement | undefined;

  // indeterminate is a property, not an attribute.
  createEffect(
    () => ctx.indeterminate(),
    (indeterminate) => {
      if (input) input.indeterminate = indeterminate;
    },
  );

  return (
    <input
      type="checkbox"
      id={ctx.field.controlId}
      {...rest}
      ref={[
        (el: HTMLInputElement) => {
          input = el;
          ctx.input = el;
          el.indeterminate = ctx.indeterminate();
        },
        props.ref as any,
      ]}
      class={[styles.input, "yosegi-checkbox-input", props.class]}
      name={ctx.name()}
      value={ctx.value()}
      checked={ctx.checked()}
      required={ctx.field.required()}
      disabled={ctx.field.disabled()}
      aria-invalid={ctx.field.invalid() ? "true" : undefined}
      aria-describedby={ctx.field.describedBy()}
      aria-errormessage={ctx.field.errorMessage()}
      onChange={(event) => {
        ctx.setChecked(event.currentTarget.checked);
        callHandler(props.onChange, event);
      }}
    />
  );
}

function Control(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const ctx = useCheckbox();
  const rest = omit(props, "class", "onClick", "children");

  return (
    <div
      aria-hidden="true"
      {...rest}
      class={[styles.control, "yosegi-checkbox-control", props.class]}
      // The box isn't a label, so it passes the click to the real input.
      onClick={(event) => {
        ctx.input?.click();
        callHandler(props.onClick, event);
      }}
    >
      {props.children}
    </div>
  );
}

/** Renders a tick, or a dash when indeterminate, when it has no children. */
function Indicator(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const ctx = useCheckbox();
  const rest = omit(props, "class", "children");

  return (
    <Show when={ctx.checked() || ctx.indeterminate()}>
      <div {...rest} class={[styles.indicator, "yosegi-checkbox-indicator", props.class]}>
        {props.children ?? (ctx.indeterminate() ? <DashIcon /> : <TickIcon />)}
      </div>
    </Show>
  );
}

const parts = createFieldParts(
  () => useCheckbox().field,
  { label: styles.label, description: styles.description, errorMessage: styles["error-message"] },
  "yosegi-checkbox",
);

export const Checkbox = Object.assign(CheckboxRoot, { ...parts, Input, Control, Indicator });
