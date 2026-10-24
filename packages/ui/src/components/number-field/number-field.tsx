import type { JSX } from "@solidjs/web";
import { createContext, createMemo, createSignal, omit, Show, untrack, useContext } from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createField, type Field, type FieldState, type FieldTextProps } from "../../primitives/create-field";
import { callHandler, dataAttr } from "../../primitives/dom";
import { createFieldParts } from "../../primitives/field-parts";
import { MinusIcon, PlusIcon } from "../../primitives/icons";
import { parseNumber } from "../../primitives/numbers";
import styles from "./number-field.module.scss";

interface NumberFieldContextValue {
  field: Field;
  value: () => number;
  text: () => string;
  setDraft: (text: string | null) => void;
  commit: () => void;
  step: (direction: 1 | -1, amount?: number) => void;
  jump: (to: "min" | "max") => void;
  atMin: () => boolean;
  atMax: () => boolean;
  min: () => number | undefined;
  max: () => number | undefined;
  largeStep: () => number;
}

const NumberFieldContext = createContext<NumberFieldContextValue>();
const useNumberField = () => useContext(NumberFieldContext);

/**
 * A labelled number input with − and + buttons, limits and steps. With no
 * children it builds itself from label, placeholder, description and errorMessage.
 */
export interface NumberFieldProps
  extends FieldState,
    FieldTextProps,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  /** 1 by default. */
  step?: number;
  /** Used by Page Up and Page Down. 10 by default. */
  largeStep?: number;
  formatOptions?: Intl.NumberFormatOptions;
  /** The browser's locale by default. */
  locale?: string;
  name?: string;
  placeholder?: string;
}

function NumberFieldRoot(props: NumberFieldProps) {
  const field = createField(props, "yosegi-number-field");
  const [value, setValue] = createControllableSignal<number>({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? NaN,
    onChange: (next) => props.onChange?.(next),
  });
  // What the person is typing, until they leave the field or press Enter.
  const [draft, setDraft] = createSignal<string | null>(null, { ownedWrite: true });

  const formatter = createMemo(() => new Intl.NumberFormat(props.locale, props.formatOptions));
  const percent = () => props.formatOptions?.style === "percent";
  const stepSize = () => props.step ?? 1;

  const clamp = (n: number) => {
    const decimals = (String(stepSize()).split(".")[1] ?? "").length + (percent() ? 2 : 0);
    const rounded = Number(n.toFixed(Math.min(decimals, 20)));
    return Math.min(props.maxValue ?? Infinity, Math.max(props.minValue ?? -Infinity, rounded));
  };

  const parse = (text: string) => {
    const n = parseNumber(text, props.locale);
    return percent() ? n / 100 : n;
  };

  const commit = () => {
    const text = untrack(draft);
    if (text === null) return;
    const n = parse(text);
    setValue(Number.isNaN(n) ? NaN : clamp(n));
    setDraft(null);
  };

  const current = () => {
    const text = untrack(draft);
    return text !== null ? parse(text) : untrack(value);
  };

  const step = (direction: 1 | -1, amount = stepSize()) => {
    const n = current();
    const unit = percent() ? amount / 100 : amount;
    const base = Number.isNaN(n)
      ? direction > 0
        ? (props.minValue ?? 0)
        : (props.maxValue ?? 0)
      : n + direction * unit;
    setValue(clamp(base));
    setDraft(null);
  };

  const jump = (to: "min" | "max") => {
    const limit = to === "min" ? props.minValue : props.maxValue;
    if (limit === undefined) return;
    setValue(limit);
    setDraft(null);
  };

  const rest = omit(
    props,
    "value",
    "defaultValue",
    "onChange",
    "minValue",
    "maxValue",
    "step",
    "largeStep",
    "formatOptions",
    "locale",
    "name",
    "label",
    "description",
    "errorMessage",
    "placeholder",
    "validationState",
    "required",
    "disabled",
    "readOnly",
    "class",
    "children",
    "aria-label",
  );

  return (
    <NumberFieldContext
      value={{
        field,
        value,
        text: () => draft() ?? (Number.isNaN(value()) ? "" : formatter().format(value())),
        setDraft,
        commit,
        step,
        jump,
        atMin: () => props.minValue !== undefined && value() <= props.minValue,
        atMax: () => props.maxValue !== undefined && value() >= props.maxValue,
        min: () => props.minValue,
        max: () => props.maxValue,
        largeStep: () => props.largeStep ?? 10,
      }}
    >
      <div
        {...rest}
        class={[styles.root, "yosegi-number-field", props.class]}
        data-invalid={dataAttr(field.invalid())}
        data-disabled={dataAttr(field.disabled())}
        data-readonly={dataAttr(field.readOnly())}
        // Without parts, the name goes on the input, which is what gets focus.
        aria-label={"children" in props ? props["aria-label"] : undefined}
      >
        {"children" in props ? (
          props.children
        ) : (
          <Layout label={props.label} description={props.description}>
            <Group>
              <Input placeholder={props.placeholder} aria-label={props["aria-label"]} />
              <NumberField.DecrementTrigger />
              <NumberField.IncrementTrigger />
            </Group>
          </Layout>
        )}
        <Show when={props.name}>
          <input type="hidden" name={props.name} value={Number.isNaN(value()) ? "" : String(value())} />
        </Show>
      </div>
    </NumberFieldContext>
  );
}

function Group(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, "class", "children");
  return (
    <div role="group" {...rest} class={[styles.group, "yosegi-number-field-group", props.class]}>
      {props.children}
    </div>
  );
}

function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  const ctx = useNumberField();
  const rest = omit(props, "class", "onInput", "onKeyDown", "onBlur", "children");

  return (
    <input
      id={ctx.field.controlId}
      type="text"
      inputmode="decimal"
      autocomplete="off"
      role="spinbutton"
      {...rest}
      class={[styles.input, "yosegi-number-field-input", props.class]}
      value={ctx.text()}
      required={ctx.field.required()}
      disabled={ctx.field.disabled()}
      readonly={ctx.field.readOnly()}
      aria-valuenow={Number.isNaN(ctx.value()) ? undefined : ctx.value()}
      aria-valuetext={ctx.text() || undefined}
      aria-valuemin={ctx.min()}
      aria-valuemax={ctx.max()}
      aria-invalid={ctx.field.invalid() ? "true" : undefined}
      aria-describedby={ctx.field.describedBy()}
      aria-errormessage={ctx.field.errorMessage()}
      onInput={(event) => {
        ctx.setDraft(event.currentTarget.value);
        callHandler(props.onInput, event);
      }}
      onBlur={(event) => {
        ctx.commit();
        callHandler(props.onBlur, event);
      }}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        if (event.defaultPrevented || ctx.field.readOnly()) return;
        const keys: Record<string, () => void> = {
          ArrowUp: () => ctx.step(1),
          ArrowDown: () => ctx.step(-1),
          PageUp: () => ctx.step(1, ctx.largeStep()),
          PageDown: () => ctx.step(-1, ctx.largeStep()),
          Home: () => ctx.jump("min"),
          End: () => ctx.jump("max"),
          Enter: () => ctx.commit(),
        };
        const action = keys[event.key];
        if (!action) return;
        event.preventDefault();
        action();
      }}
    />
  );
}

function createTrigger(direction: 1 | -1) {
  return function Trigger(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
    const ctx = useNumberField();
    const atLimit = () => (direction > 0 ? ctx.atMax() : ctx.atMin());
    const unavailable = () => atLimit() || ctx.field.disabled() || ctx.field.readOnly();
    const rest = omit(props, "class", "onClick", "children");
    const name = direction > 0 ? "increment" : "decrement";

    return (
      <button
        type="button"
        // The arrow keys do the same job, so the triggers stay out of the tab order.
        tabindex="-1"
        aria-label={direction > 0 ? "Increase" : "Decrease"}
        aria-controls={ctx.field.controlId}
        {...rest}
        class={[styles[`${name}-trigger`], `yosegi-number-field-${name}-trigger`, props.class]}
        disabled={unavailable()}
        data-disabled={dataAttr(unavailable())}
        // Keep focus in the input, where the value is.
        onPointerDown={(event) => event.preventDefault()}
        onClick={(event) => {
          ctx.step(direction);
          callHandler(props.onClick, event);
        }}
      >
        {props.children ?? (direction > 0 ? <PlusIcon /> : <MinusIcon />)}
      </button>
    );
  };
}

const { Layout, ...parts } = createFieldParts(
  () => useNumberField().field,
  { label: styles.label, description: styles.description, errorMessage: styles["error-message"] },
  "yosegi-number-field",
);

export const NumberField = Object.assign(NumberFieldRoot, {
  ...parts,
  Group,
  Input,
  /** Renders the − icon when it has no children. data-disabled at the minimum. */
  DecrementTrigger: createTrigger(-1),
  /** Renders the + icon when it has no children. data-disabled at the maximum. */
  IncrementTrigger: createTrigger(1),
});
