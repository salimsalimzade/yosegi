import type { JSX } from "@solidjs/web";
import { children, createContext, omit, Show, useContext } from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createField, type Field, type FieldState, type FieldTextProps } from "../../primitives/create-field";
import { callHandler, dataAttr } from "../../primitives/dom";
import { createFieldParts } from "../../primitives/field-parts";
import { Spinner } from "../spinner/spinner";
import styles from "./text-field.module.scss";

interface TextFieldContextValue {
  field: Field;
  value: () => string;
  setValue: (value: string) => void;
  name: () => string | undefined;
}

const TextFieldContext = createContext<TextFieldContextValue>();
const useTextField = () => useContext(TextFieldContext);

/**
 * A labelled single-line or multi-line text input. With no children it builds
 * itself from label, placeholder, description and errorMessage; pass the parts
 * as children to arrange them yourself.
 */
export interface TextFieldProps
  extends FieldState,
    FieldTextProps,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Something about the value is being checked; sets data-loading and aria-busy, and shows a spinner. */
  loading?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  placeholder?: string;
  /** The input's type: "email", "password", "search"… "text" by default. */
  type?: string;
  autocomplete?: JSX.InputHTMLAttributes<HTMLInputElement>["autocomplete"];
  /** A 16px icon before the text, like the search glass. */
  icon?: JSX.Element;
  /** A text area that grows with the text, in place of the input. */
  multiline?: boolean;
}

function TextFieldRoot(props: TextFieldProps) {
  const field = createField(props, "yosegi-text-field");
  const [value, setValue] = createControllableSignal({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? "",
    onChange: (next) => props.onChange?.(next),
  });
  const rest = omit(
    props,
    "loading",
    "value",
    "defaultValue",
    "onChange",
    "name",
    "label",
    "description",
    "errorMessage",
    "placeholder",
    "type",
    "autocomplete",
    "icon",
    "multiline",
    "validationState",
    "required",
    "disabled",
    "readOnly",
    "class",
    "children",
    "aria-label",
  );
  const icon = children(() => props.icon);

  return (
    <TextFieldContext value={{ field, value, setValue, name: () => props.name }}>
      <div
        {...rest}
        class={[styles.root, "yosegi-text-field", props.class]}
        aria-busy={props.loading ? "true" : undefined}
        data-invalid={dataAttr(field.invalid())}
        data-disabled={dataAttr(field.disabled())}
        data-readonly={dataAttr(field.readOnly())}
        data-required={dataAttr(field.required())}
        data-loading={dataAttr(props.loading)}
        // Without parts, the name goes on the input, which is what gets focus.
        aria-label={"children" in props ? props["aria-label"] : undefined}
      >
        {"children" in props ? (
          props.children
        ) : (
          <Layout label={props.label} description={props.description}>
            <Show
              when={!props.multiline}
              fallback={
                <TextArea
                  autoResize
                  placeholder={props.placeholder}
                  autocomplete={props.autocomplete}
                  aria-label={props["aria-label"]}
                />
              }
            >
              {/* Always the group, so the input keeps focus when the spinner comes and goes. */}
              <Group>
                <Show when={icon()}>
                  <Icon>{icon()}</Icon>
                </Show>
                <Input
                  type={props.type}
                  placeholder={props.placeholder}
                  autocomplete={props.autocomplete}
                  aria-label={props["aria-label"]}
                />
                <Show when={props.loading}>
                  <Spinner />
                </Show>
              </Group>
            </Show>
          </Layout>
        )}
      </div>
    </TextFieldContext>
  );
}

/** The attributes the input and the text area share. */
function controlAttributes(ctx: TextFieldContextValue) {
  return {
    get id() {
      return ctx.field.controlId;
    },
    get name() {
      return ctx.name();
    },
    get required() {
      return ctx.field.required();
    },
    get disabled() {
      return ctx.field.disabled();
    },
    get readonly() {
      return ctx.field.readOnly();
    },
    get "aria-invalid"() {
      return ctx.field.invalid() ? "true" : undefined;
    },
    get "aria-describedby"() {
      return ctx.field.describedBy();
    },
    get "aria-errormessage"() {
      return ctx.field.errorMessage();
    },
  };
}

function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  const ctx = useTextField();
  const rest = omit(props, "class", "onInput", "children");

  return (
    <input
      {...controlAttributes(ctx)}
      {...rest}
      class={[styles.input, "yosegi-text-field-input", props.class]}
      value={ctx.value()}
      onInput={(event) => {
        ctx.setValue(event.currentTarget.value);
        callHandler(props.onInput, event);
      }}
    />
  );
}

export interface TextFieldTextAreaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grow with the content. */
  autoResize?: boolean;
}

function TextArea(props: TextFieldTextAreaProps) {
  const ctx = useTextField();
  const rest = omit(props, "class", "onInput", "autoResize", "ref", "children");

  const resize = (el: HTMLTextAreaElement) => {
    if (!props.autoResize) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  };

  return (
    <textarea
      {...controlAttributes(ctx)}
      {...rest}
      ref={[(el: HTMLTextAreaElement) => requestAnimationFrame(() => resize(el)), props.ref as any]}
      class={[styles.textarea, "yosegi-text-field-textarea", props.class]}
      value={ctx.value()}
      onInput={(event) => {
        ctx.setValue(event.currentTarget.value);
        resize(event.currentTarget);
        callHandler(props.onInput, event);
      }}
    />
  );
}

/** The box, when the input shares it with a Spinner or an icon. */
function Group(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, "class", "children");
  return (
    <div {...rest} class={[styles.group, "yosegi-text-field-group", props.class]}>
      {props.children}
    </div>
  );
}

/** A 16px icon before the input, inside Group, like the search glass. Decorative. */
function Icon(props: JSX.HTMLAttributes<HTMLSpanElement>) {
  const rest = omit(props, "class", "children");
  return (
    <span aria-hidden="true" {...rest} class={[styles.icon, "yosegi-text-field-icon", props.class]}>
      {props.children}
    </span>
  );
}

const { Layout, ...parts } = createFieldParts(
  () => useTextField().field,
  {
    label: styles.label,
    description: styles.description,
    errorMessage: styles["error-message"],
  },
  "yosegi-text-field",
);

export const TextField = Object.assign(TextFieldRoot, {
  ...parts,
  Input,
  TextArea,
  Group,
  Icon,
});
