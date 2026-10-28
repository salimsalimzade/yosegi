import type { JSX } from "@solidjs/web";
import { children, createContext, createMemo, createSignal, For, omit, onSettled, Show, useContext } from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createPart, type PartProps } from "../../primitives/create-part";
import { callHandler, dataAttr } from "../../primitives/dom";
import { TickIcon, WarningIcon } from "../../primitives/icons";
import { useLabels } from "../locale-provider/locale-provider";
import { Spinner } from "../spinner/spinner";
import styles from "./stepper.module.scss";

/** Where a step is: worked out from the Stepper's value, or set on the Item. */
export type StepperState = "done" | "current" | "upcoming" | "error" | "loading";

/** The text Stepper writes itself, for another language. */
export interface StepperLabels {
  /** Before the description of an optional step. “Optional” by default. */
  optional: string;
  /** The status of a done step. “Done” by default. */
  done: string;
  /** The status of the current step. “In progress” by default. */
  current: string;
  /** The status of a step not reached yet. “Not started” by default. */
  upcoming: string;
  /** The status of a step that is being checked. “Checking…” by default. */
  loading: string;
  /** The status of a step that needs fixing. “Needs attention” by default. */
  error: string;
  /** The status of a disabled step. “Locked” by default. */
  disabled: string;
}

const defaultLabels: StepperLabels = {
  optional: "Optional",
  done: "Done",
  current: "In progress",
  upcoming: "Not started",
  loading: "Checking…",
  error: "Needs attention",
  disabled: "Locked",
};

interface StepperContextValue {
  value: () => string | undefined;
  select: (value: string) => void;
  /** Where a step sits among the steps, from 0; -1 until it has registered. */
  index: (value: string) => number;
  register: (value: () => string, element: () => HTMLElement | undefined) => void;
  variant: () => "number" | "icon";
  linear: () => boolean;
  labels: () => StepperLabels;
}

interface ItemContextValue {
  value: () => string;
  number: () => number;
  state: () => StepperState;
  disabled: () => boolean;
  /** Ahead of the current step in a linear stepper: it can't be picked yet. */
  locked: () => boolean;
  optional: () => boolean;
  icon: () => JSX.Element;
  hasStatus: () => boolean;
  registerStatus: () => void;
}

const StepperContext = createContext<StepperContextValue>();
const ItemContext = createContext<ItemContextValue>();
const useStepper = () => useContext(StepperContext);
const useItem = () => useContext(ItemContext);

/** One step, when Stepper builds itself from `steps`. */
export interface StepperStep {
  value: string;
  /** One or two words, like “Details”. */
  label: JSX.Element;
  description?: JSX.Element;
  /** A status line under the description. `true` writes it from the state: Done, In progress, Not started… */
  status?: JSX.Element | true;
  /** The step's icon, with variant="icon". */
  icon?: JSX.Element;
  /** Overrides the worked-out state: error shows the ! mark, loading a Spinner. */
  state?: "error" | "loading";
  /** Adds “Optional” before the description. */
  optional?: boolean;
  /** The step can't be reached. Say why in the description or status. */
  disabled?: boolean;
}

/**
 * The steps of a short flow: what is done, where you are and what is left.
 * Give it `steps` and it builds them itself; without them, put the parts
 * together yourself. Name it with `aria-label`, like “Create project”.
 */
export interface StepperProps extends Omit<JSX.HTMLAttributes<HTMLOListElement>, "onChange"> {
  steps?: StepperStep[];
  /** The current step's value. Steps before it are done, steps after it are upcoming. */
  value?: string;
  /** The first step by default. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** horizontal by default. */
  orientation?: "horizontal" | "vertical";
  /** number by default: steps are counted. icon shows each step's icon. */
  variant?: "number" | "icon";
  /** sm 20px, md 28px (default), lg 36px indicators. The icon variant starts at 36px. */
  size?: "sm" | "md" | "lg";
  /** true by default: people can go back to done steps but not jump ahead. */
  linear?: boolean;
  /** gap by default: a 4px space between the line and each indicator. joined runs the line into them. */
  connector?: "gap" | "joined";
  /** The text it writes itself, like “Optional” and the status words. */
  labels?: Partial<StepperLabels>;
}

function StepperRoot(props: StepperProps) {
  const labels = useLabels("stepper", defaultLabels, () => props.labels);
  const [value, setValue] = createControllableSignal<string | undefined>({
    value: () => props.value,
    defaultValue: () => props.defaultValue,
    onChange: (next) => next !== undefined && props.onChange?.(next),
  });
  // The steps in the order they appear, so each one knows its number.
  const [steps, setSteps] = createSignal<{ value: () => string; element: () => HTMLElement | undefined }[]>([], {
    ownedWrite: true,
  });
  const order = createMemo(() => steps().map((step) => step.value()));
  const rest = omit(
    props,
    "steps",
    "value",
    "defaultValue",
    "onChange",
    "orientation",
    "variant",
    "size",
    "linear",
    "connector",
    "labels",
    "class",
    "children",
  );

  const byPosition = (a: { element: () => HTMLElement | undefined }, b: { element: () => HTMLElement | undefined }) => {
    const first = a.element();
    const second = b.element();
    if (!first || !second) return 0;
    return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  };

  return (
    <StepperContext
      value={{
        // With no value given, the first step is the current one.
        value: () => value() ?? order()[0],
        select: (next) => setValue(next),
        index: (step) => order().indexOf(step),
        register(stepValue, element) {
          const entry = { value: stepValue, element };
          onSettled(() => {
            setSteps((list) => [...list, entry].sort(byPosition));
            return () => setSteps((list) => list.filter((item) => item !== entry));
          });
        },
        variant: () => props.variant ?? "number",
        linear: () => props.linear ?? true,
        labels,
      }}
    >
      <ol
        {...rest}
        class={[styles.root, "yosegi-stepper", props.class]}
        data-orientation={props.orientation ?? "horizontal"}
        data-variant={props.variant ?? "number"}
        data-size={props.size ?? "md"}
        data-connector={props.connector ?? "gap"}
      >
        {"steps" in props ? <Built steps={props.steps} /> : props.children}
      </ol>
    </StepperContext>
  );
}

/** The steps from the root's `steps`. */
function Built(props: { steps?: StepperStep[] }) {
  // Read once: the steps build their labels and icons again on every read.
  const steps = createMemo(() => props.steps ?? []);

  return (
    <For each={steps()}>
      {(step) => (
        <Item value={step.value} state={step.state} optional={step.optional} disabled={step.disabled} icon={step.icon}>
          <Trigger>
            <Indicator />
            <Label>{step.label}</Label>
            <Show when={step.description !== undefined || step.optional}>
              <Description>{step.description}</Description>
            </Show>
            <Show when={step.status !== undefined}>
              <Status>{step.status === true ? undefined : step.status}</Status>
            </Show>
          </Trigger>
          <Separator />
        </Item>
      )}
    </For>
  );
}

export interface StepperItemProps extends JSX.LiHTMLAttributes<HTMLLIElement> {
  value: string;
  /** Overrides the worked-out state: error shows the ! mark, loading shows a Spinner. */
  state?: "error" | "loading";
  /** Adds “Optional” before the description. */
  optional?: boolean;
  /** The step can't be reached. Say why in Description or Status. */
  disabled?: boolean;
  /** The step's icon, used when variant="icon". */
  icon?: JSX.Element;
}

function Item(props: StepperItemProps) {
  const stepper = useStepper();
  const [hasStatus, setHasStatus] = createSignal(false, { ownedWrite: true });
  const icon = children(() => props.icon);
  let element: HTMLLIElement | undefined;
  const rest = omit(props, "value", "state", "optional", "disabled", "icon", "class", "ref", "children");

  stepper.register(
    () => props.value,
    () => element,
  );

  const index = () => stepper.index(props.value);
  const current = () => stepper.index(stepper.value() ?? "");
  const position = (): StepperState => {
    if (index() < 0 || current() < 0 || index() > current()) return "upcoming";
    return index() < current() ? "done" : "current";
  };
  const state = () => props.state ?? position();

  return (
    <ItemContext
      value={{
        value: () => props.value,
        number: () => index() + 1,
        state,
        disabled: () => !!props.disabled,
        locked: () => stepper.linear() && position() === "upcoming",
        optional: () => !!props.optional,
        icon: () => icon(),
        hasStatus,
        registerStatus: () =>
          onSettled(() => {
            setHasStatus(true);
            return () => setHasStatus(false);
          }),
      }}
    >
      <li
        {...rest}
        ref={[(el: HTMLLIElement) => (element = el), props.ref as any]}
        class={[styles.item, "yosegi-stepper-item", props.class]}
        data-state={state()}
        data-disabled={dataAttr(props.disabled)}
        data-optional={dataAttr(props.optional)}
      >
        {props.children}
      </li>
    </ItemContext>
  );
}

/** The button that moves to this step. aria-current="step" on the current one. */
function Trigger(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const stepper = useStepper();
  const item = useItem();
  const rest = omit(props, "class", "onClick", "children");

  return (
    <button
      type="button"
      {...rest}
      class={[styles.trigger, "yosegi-stepper-trigger", props.class]}
      aria-current={stepper.value() === item.value() ? "step" : undefined}
      // Ahead in a linear stepper: reachable by Tab, so people hear it's there, but it can't be picked yet.
      aria-disabled={item.locked() ? "true" : undefined}
      disabled={item.disabled()}
      onClick={(event) => {
        callHandler(props.onClick, event);
        if (event.defaultPrevented || item.locked() || item.disabled()) return;
        stepper.select(item.value());
      }}
    >
      {props.children}
    </button>
  );
}

/** The number or icon; a tick when done, ! on error, a Spinner while loading. */
function Indicator(props: PartProps<HTMLSpanElement>) {
  const stepper = useStepper();
  const item = useItem();
  const rest = omit(props, "as", "class", "children");

  // The mark for the state, or the step's own number or icon.
  const mark = () => {
    switch (item.state()) {
      case "done":
        return <TickIcon />;
      case "loading":
        return <Spinner />;
      case "error":
        return stepper.variant() === "icon" ? <WarningIcon /> : "!";
      default:
        return stepper.variant() === "icon" ? item.icon() : item.number() || "";
    }
  };

  return (
    <span {...rest} class={[styles.indicator, "yosegi-stepper-indicator", props.class]}>
      <Show
        when={props.children}
        fallback={
          <span class={styles.mark} aria-hidden="true">
            {mark()}
          </span>
        }
      >
        {props.children}
      </Show>
      {/* Without a Status line, screen readers still hear a state the mark shows and the label doesn't. */}
      <Show when={!item.hasStatus() && ["done", "error", "loading"].includes(item.state())}>
        <span class={styles.hidden}>{stepper.labels()[item.state() as "done" | "error" | "loading"]}: </span>
      </Show>
    </span>
  );
}

/** “Optional”, then the description. */
function Description(props: PartProps<HTMLSpanElement>) {
  const stepper = useStepper();
  const item = useItem();
  const rest = omit(props, "as", "class", "children");
  const text = children(() => props.children);

  return (
    <span {...rest} class={[styles.description, "yosegi-stepper-description", props.class]}>
      <Show when={item.optional()}>
        {stepper.labels().optional}
        <Show when={text.toArray().length > 0}> · </Show>
      </Show>
      {text()}
    </span>
  );
}

/** A status line. With no children it says Done, In progress, Not started, Checking… or Locked. */
function Status(props: PartProps<HTMLSpanElement>) {
  const stepper = useStepper();
  const item = useItem();
  const rest = omit(props, "as", "class", "children");
  const text = children(() => props.children);
  item.registerStatus();

  return (
    <span {...rest} class={[styles.status, "yosegi-stepper-status", props.class]}>
      <Show when={text.toArray().length > 0} fallback={stepper.labels()[item.disabled() ? "disabled" : item.state()]}>
        {text()}
      </Show>
    </span>
  );
}

/** The line to the next step; accent once this step is done. */
const Separator = createPart<HTMLSpanElement>("span", styles.separator, "yosegi-stepper-separator", {
  "aria-hidden": "true",
});

const Label = createPart<HTMLSpanElement>("span", styles.label, "yosegi-stepper-label");

export const Stepper = Object.assign(StepperRoot, {
  Item,
  Trigger,
  Indicator,
  Label,
  Description,
  Status,
  Separator,
});
