import type { JSX } from "@solidjs/web";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  flush,
  For,
  omit,
  Show,
  untrack,
  useContext,
} from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createDismiss } from "../../primitives/create-dismiss";
import { createField, type Field, type FieldState, type FieldTextProps } from "../../primitives/create-field";
import { createPart } from "../../primitives/create-part";
import { createFloating, type Placement } from "../../primitives/create-floating";
import {
  addDays,
  addMonths,
  clampDate,
  endOfMonth,
  isSameDay,
  isSameMonth,
  monthWeeks,
  parseDate,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toKey,
  type WeekDay,
} from "../../primitives/dates";
import { callHandler, dataAttr } from "../../primitives/dom";
import { createFieldParts } from "../../primitives/field-parts";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "../../primitives/icons";
import { Portal } from "../../primitives/portal";
import styles from "./date-picker.module.scss";

export interface DatePickerDay {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isOutsideMonth: boolean;
  isUnavailable: boolean;
}

interface DatePickerContextValue {
  field: Field;
  value: () => Date | null;
  open: () => boolean;
  setOpen: (open: boolean) => void;
  /** The day that holds focus in the calendar; its month is the one shown. */
  focused: () => Date;
  setFocused: (date: Date) => void;
  select: (date: Date) => void;
  commitText: (text: string) => void;
  locale: () => string | undefined;
  firstDayOfWeek: () => WeekDay;
  isUnavailable: (date: Date) => boolean;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  headingId: string;
  contentId: string;
  input: () => HTMLInputElement | undefined;
  setInput: (el: HTMLInputElement) => void;
  setControl: (el: HTMLElement) => void;
  setContent: (el: HTMLElement | undefined) => void;
  labels: () => DatePickerLabels;
}

/** The text DatePicker writes itself, for another language. */
export interface DatePickerLabels {
  /** The calendar button's name. “Choose a date” by default. */
  trigger: string;
  /** “Previous month” by default. */
  previousMonth: string;
  /** “Next month” by default. */
  nextMonth: string;
}

const defaultLabels: DatePickerLabels = {
  trigger: "Choose a date",
  previousMonth: "Previous month",
  nextMonth: "Next month",
};

const DatePickerContext = createContext<DatePickerContextValue>();
const useDatePicker = () => useContext(DatePickerContext);

/**
 * A date input with a calendar that opens below it. With no children it builds
 * itself from label, description and errorMessage.
 */
export interface DatePickerProps
  extends FieldState,
    FieldTextProps,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  minValue?: Date;
  maxValue?: Date;
  isDateUnavailable?: (date: Date) => boolean;
  /** For the input format and month names. The browser's locale by default. */
  locale?: string;
  /** 1 (Monday) by default; 0 is Sunday. */
  firstDayOfWeek?: WeekDay;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** true by default. */
  closeOnSelect?: boolean;
  /** bottom-start by default. */
  placement?: Placement;
  name?: string;
  /** The text it writes itself, like the calendar button's name. Month and day names come from `locale`. */
  labels?: Partial<DatePickerLabels>;
}

function DatePickerRoot(props: DatePickerProps) {
  const id = `yosegi-date-picker-${createUniqueId()}`;
  const field = createField(props, "yosegi-date-picker");
  const [value, setValue] = createControllableSignal<Date | null>({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? null,
    onChange: (next) => props.onChange?.(next),
    equals: (a, b) => (a === null || b === null ? a === b : isSameDay(a, b)),
  });
  const [open, setOpen] = createControllableSignal({
    value: () => props.open,
    defaultValue: () => props.defaultOpen ?? false,
    onChange: (next) => props.onOpenChange?.(next),
  });
  const [focused, setFocusedRaw] = createSignal(startOfDay(new Date()), { ownedWrite: true });
  const element = () => createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const [input, setInput] = createSignal<HTMLInputElement | undefined>(undefined, { ownedWrite: true });
  const [control, setControl] = element();
  const [content, setContent] = element();

  const isUnavailable = (date: Date) =>
    (!!props.minValue && date < startOfDay(props.minValue)) ||
    (!!props.maxValue && date > startOfDay(props.maxValue)) ||
    !!props.isDateUnavailable?.(date);

  const setFocused = (date: Date) => setFocusedRaw(clampDate(startOfDay(date), props.minValue, props.maxValue));

  const changeOpen = (next: boolean) => {
    if (next && (field.disabled() || field.readOnly())) return;
    // Opening starts on the selected day, or today.
    if (next) setFocused(untrack(value) ?? new Date());
    setOpen(next);
  };

  const select = (date: Date) => {
    if (isUnavailable(date)) return;
    setValue(startOfDay(date));
    setFocused(date);
    if (props.closeOnSelect ?? true) {
      changeOpen(false);
      input()?.focus();
    }
  };

  const commitText = (text: string) => {
    if (text.trim() === "") return setValue(null);
    const date = parseDate(text, props.locale);
    if (date && !isUnavailable(date)) setValue(date);
  };

  createFloating({
    open,
    reference: control,
    floating: content,
    placement: () => props.placement ?? "bottom-start",
    gutter: () => 6,
    name: "date-picker",
  });

  createDismiss({
    enabled: open,
    inside: () => [content(), control()],
    onDismiss: (reason) => {
      changeOpen(false);
      if (reason === "escape") input()?.focus();
    },
  });

  const rest = omit(
    props,
    "value",
    "defaultValue",
    "onChange",
    "minValue",
    "maxValue",
    "isDateUnavailable",
    "locale",
    "firstDayOfWeek",
    "open",
    "defaultOpen",
    "onOpenChange",
    "closeOnSelect",
    "placement",
    "name",
    "labels",
    "label",
    "description",
    "errorMessage",
    "validationState",
    "required",
    "disabled",
    "readOnly",
    "class",
    "children",
    "aria-label",
  );

  return (
    <DatePickerContext
      value={{
        field,
        value,
        open,
        setOpen: changeOpen,
        focused,
        setFocused,
        select,
        commitText,
        locale: () => props.locale,
        labels: () => ({ ...defaultLabels, ...props.labels }),
        firstDayOfWeek: () => props.firstDayOfWeek ?? 1,
        isUnavailable,
        canGoBack: () => !props.minValue || startOfMonth(focused()) > startOfDay(props.minValue),
        canGoForward: () => !props.maxValue || endOfMonth(focused()) < startOfDay(props.maxValue),
        headingId: `${id}-heading`,
        contentId: `${id}-content`,
        input,
        setInput,
        setControl,
        setContent,
      }}
    >
      <div
        {...rest}
        class={[styles.root, "yosegi-date-picker", props.class]}
        data-expanded={dataAttr(open())}
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
            <Control>
              <Input aria-label={props["aria-label"]} />
              <Trigger />
            </Control>
            <Portal>
              <Content>
                <DatePicker.Header>
                  <DatePicker.PrevTrigger />
                  <Heading />
                  <DatePicker.NextTrigger />
                </DatePicker.Header>
                <Grid />
              </Content>
            </Portal>
          </Layout>
        )}
        <Show when={props.name}>
          <input type="hidden" name={props.name} value={value() ? toKey(value()!) : ""} />
        </Show>
      </div>
    </DatePickerContext>
  );
}

function Control(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const picker = useDatePicker();
  const rest = omit(props, "class", "ref", "children");

  return (
    <div
      {...rest}
      ref={[(el: HTMLDivElement) => picker.setControl(el), props.ref as any]}
      class={[styles.control, "yosegi-date-picker-control", props.class]}
    >
      {props.children}
    </div>
  );
}

/** Accepts typed dates in the locale's format; Alt + Arrow Down opens the calendar. */
function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  const picker = useDatePicker();
  const [draft, setDraft] = createSignal<string | null>(null, { ownedWrite: true });
  const format = createMemo(
    () => new Intl.DateTimeFormat(picker.locale(), { day: "2-digit", month: "2-digit", year: "numeric" }),
  );
  const rest = omit(props, "class", "ref", "onInput", "onBlur", "onKeyDown");

  const commit = () => {
    const text = untrack(draft);
    if (text === null) return;
    picker.commitText(text);
    setDraft(null);
  };

  return (
    <input
      type="text"
      autocomplete="off"
      placeholder={format()
        .formatToParts(new Date(2000, 10, 22))
        .map((part) => ({ day: "dd", month: "mm", year: "yyyy" })[part.type as "day"] ?? part.value)
        .join("")}
      {...rest}
      ref={[(el: HTMLInputElement) => picker.setInput(el), props.ref as any]}
      id={picker.field.controlId}
      class={[styles.input, "yosegi-date-picker-input", props.class]}
      value={draft() ?? (picker.value() ? format().format(picker.value()!) : "")}
      required={picker.field.required()}
      disabled={picker.field.disabled()}
      readonly={picker.field.readOnly()}
      aria-invalid={picker.field.invalid() ? "true" : undefined}
      aria-describedby={picker.field.describedBy()}
      aria-errormessage={picker.field.errorMessage()}
      onInput={(event) => {
        setDraft(event.currentTarget.value);
        callHandler(props.onInput, event);
      }}
      onBlur={(event) => {
        commit();
        callHandler(props.onBlur, event);
      }}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        if (event.defaultPrevented) return;
        if (event.key === "Enter") commit();
        if (event.key === "ArrowDown" && event.altKey) {
          event.preventDefault();
          commit();
          picker.setOpen(true);
        }
      }}
    />
  );
}

/** Renders the calendar icon when it has no children. */
function Trigger(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const picker = useDatePicker();
  const rest = omit(props, "class", "onClick", "children");

  return (
    <button
      type="button"
      aria-label={picker.labels().trigger}
      {...rest}
      class={[styles.trigger, "yosegi-date-picker-trigger", props.class]}
      aria-haspopup="dialog"
      aria-expanded={picker.open() ? "true" : "false"}
      aria-controls={picker.open() ? picker.contentId : undefined}
      disabled={picker.field.disabled()}
      data-expanded={dataAttr(picker.open())}
      onClick={(event) => {
        picker.setOpen(!picker.open());
        callHandler(props.onClick, event);
      }}
    >
      {props.children ?? <CalendarIcon />}
    </button>
  );
}

function Content(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const picker = useDatePicker();
  const rest = omit(props, "class", "ref", "children");
  let content: HTMLDivElement | undefined;

  // Opening moves focus onto the focused day.
  createEffect(
    () => picker.open(),
    (open) => {
      if (!open) return;
      requestAnimationFrame(() => content?.querySelector<HTMLElement>("[data-date][tabindex='0']")?.focus());
    },
  );

  return (
    <Show when={picker.open()}>
      <div
        role="dialog"
        {...rest}
        ref={[
          (el: HTMLDivElement) => {
            content = el;
            picker.setContent(el);
          },
          props.ref as any,
        ]}
        id={picker.contentId}
        class={[styles.content, "yosegi-date-picker-content", props.class]}
        aria-labelledby={picker.headingId}
        data-expanded=""
      >
        {props.children}
      </div>
    </Show>
  );
}

/** The visible month, e.g. "October 2026". */
function Heading(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const picker = useDatePicker();
  const label = createMemo(() =>
    new Intl.DateTimeFormat(picker.locale(), { month: "long", year: "numeric" }).format(picker.focused()),
  );
  const rest = omit(props, "class", "children");

  return (
    <h2
      aria-live="polite"
      {...rest}
      id={picker.headingId}
      class={[styles.heading, "yosegi-date-picker-heading", props.class]}
    >
      {props.children ?? label()}
    </h2>
  );
}

function createMonthTrigger(direction: 1 | -1) {
  return function MonthTrigger(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
    const picker = useDatePicker();
    const name = direction > 0 ? "next" : "prev";
    const unavailable = () => !(direction > 0 ? picker.canGoForward() : picker.canGoBack());
    const rest = omit(props, "class", "onClick", "children");

    return (
      <button
        type="button"
        aria-label={direction > 0 ? picker.labels().nextMonth : picker.labels().previousMonth}
        {...rest}
        class={[styles[`${name}-trigger`], `yosegi-date-picker-${name}-trigger`, props.class]}
        disabled={unavailable()}
        data-disabled={dataAttr(unavailable())}
        onClick={(event) => {
          picker.setFocused(addMonths(picker.focused(), direction));
          callHandler(props.onClick, event);
        }}
      >
        {props.children ?? (direction > 0 ? <ChevronRightIcon /> : <ChevronLeftIcon />)}
      </button>
    );
  };
}

export interface DatePickerGridProps extends Omit<JSX.HTMLAttributes<HTMLTableElement>, "children"> {
  /** Render each day yourself. Without it, the grid renders CellTriggers. */
  children?: (day: DatePickerDay) => JSX.Element;
}

/** The weekday row and the days of the visible month. */
function Grid(props: DatePickerGridProps) {
  const picker = useDatePicker();
  const weeks = createMemo(() => monthWeeks(picker.focused(), picker.firstDayOfWeek()));
  const weekdays = createMemo(() => {
    const long = new Intl.DateTimeFormat(picker.locale(), { weekday: "long" });
    const short = new Intl.DateTimeFormat(picker.locale(), { weekday: "short" });
    const start = startOfWeek(new Date(), picker.firstDayOfWeek());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((d) => ({
      long: long.format(d),
      short: short.format(d),
    }));
  });
  const rest = omit(props, "class", "children");

  const day = (date: Date): DatePickerDay => ({
    date,
    isSelected: isSameDay(date, picker.value()),
    isToday: isSameDay(date, new Date()),
    isOutsideMonth: !isSameMonth(date, picker.focused()),
    isUnavailable: picker.isUnavailable(date),
  });

  return (
    <table
      role="grid"
      {...rest}
      aria-labelledby={picker.headingId}
      class={[styles.grid, "yosegi-date-picker-grid", props.class]}
    >
      <thead aria-hidden="true">
        <tr>
          <For each={weekdays()}>{(weekday) => <HeadCell title={weekday.long}>{weekday.short}</HeadCell>}</For>
        </tr>
      </thead>
      <tbody>
        {/* Keyed by date, so moving within a month keeps the same buttons and their focus. */}
        <For each={weeks()} keyed={(week) => toKey(week[0])}>
          {(week) => (
            <tr>
              <For each={week()} keyed={toKey}>
                {(date) => (
                  <Cell aria-selected={isSameDay(date(), picker.value()) ? "true" : undefined}>
                    {props.children ? props.children(day(date())) : <CellTrigger day={day(date())} />}
                  </Cell>
                )}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

const HeadCell = createPart<HTMLTableCellElement>("th", styles["head-cell"], "yosegi-date-picker-head-cell", {
  scope: "col",
});

function Cell(props: JSX.TdHTMLAttributes<HTMLTableCellElement>) {
  const rest = omit(props, "class", "children");
  return (
    <td role="gridcell" {...rest} class={[styles.cell, "yosegi-date-picker-cell", props.class]}>
      {props.children}
    </td>
  );
}

export interface DatePickerCellTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  day: DatePickerDay;
}

const NAVIGATION: Record<string, (date: Date, event: KeyboardEvent, firstDay: WeekDay) => Date> = {
  ArrowLeft: (d) => addDays(d, -1),
  ArrowRight: (d) => addDays(d, 1),
  ArrowUp: (d) => addDays(d, -7),
  ArrowDown: (d) => addDays(d, 7),
  PageUp: (d, e) => addMonths(d, e.shiftKey ? -12 : -1),
  PageDown: (d, e) => addMonths(d, e.shiftKey ? 12 : 1),
  Home: (d, _, firstDay) => startOfWeek(d, firstDay),
  End: (d, _, firstDay) => addDays(startOfWeek(d, firstDay), 6),
};

function CellTrigger(props: DatePickerCellTriggerProps) {
  const picker = useDatePicker();
  const label = createMemo(() =>
    new Intl.DateTimeFormat(picker.locale(), { dateStyle: "full" }).format(props.day.date),
  );
  const rest = omit(props, "day", "class", "onClick", "onKeyDown", "children");

  return (
    <button
      type="button"
      {...rest}
      class={[styles["cell-trigger"], "yosegi-date-picker-cell-trigger", props.class]}
      // One day is in the tab order: the focused one. The arrow keys reach the rest.
      tabindex={isSameDay(props.day.date, picker.focused()) ? 0 : -1}
      aria-label={label()}
      aria-pressed={props.day.isSelected ? "true" : undefined}
      aria-current={props.day.isToday ? "date" : undefined}
      aria-disabled={props.day.isUnavailable ? "true" : undefined}
      data-date={toKey(props.day.date)}
      data-selected={dataAttr(props.day.isSelected)}
      data-today={dataAttr(props.day.isToday)}
      data-outside-month={dataAttr(props.day.isOutsideMonth)}
      data-disabled={dataAttr(props.day.isUnavailable)}
      onClick={(event) => {
        picker.select(props.day.date);
        callHandler(props.onClick, event);
      }}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        const move = NAVIGATION[event.key];
        if (event.defaultPrevented || !move) return;
        event.preventDefault();
        const grid = event.currentTarget.closest("table");
        picker.setFocused(move(props.day.date, event, picker.firstDayOfWeek()));
        // Render the new day (maybe a new month) now, then focus it.
        flush();
        grid?.querySelector<HTMLElement>(`[data-date="${toKey(picker.focused())}"]`)?.focus();
      }}
    >
      {props.children ?? props.day.date.getDate()}
    </button>
  );
}

const { Layout, ...parts } = createFieldParts(
  () => useDatePicker().field,
  { label: styles.label, description: styles.description, errorMessage: styles["error-message"] },
  "yosegi-date-picker",
);

export const DatePicker = Object.assign(DatePickerRoot, {
  ...parts,
  Control,
  Input,
  Trigger,
  Portal,
  Content,
  Header: createPart("div", styles.header, "yosegi-date-picker-header"),
  PrevTrigger: createMonthTrigger(-1),
  Heading,
  NextTrigger: createMonthTrigger(1),
  Grid,
  HeadCell,
  Cell,
  CellTrigger,
});
