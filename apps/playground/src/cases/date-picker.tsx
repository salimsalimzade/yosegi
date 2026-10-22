import { createSignal, omit } from "solid-js";
import { DatePicker, type DatePickerProps } from "yosegi";
import { Case, Cases } from "../ui/case";

const today = new Date();
const inDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

/** The full set of parts, with a label and an optional hint or error. */
function Picker(props: DatePickerProps & { label: string; hint?: string; error?: string }) {
  const rest = omit(props, "label", "hint", "error");
  return (
    <DatePicker {...rest}>
      <DatePicker.Label>{props.label}</DatePicker.Label>
      <DatePicker.Control>
        <DatePicker.Input />
        <DatePicker.Trigger />
      </DatePicker.Control>
      {props.hint && <DatePicker.Description>{props.hint}</DatePicker.Description>}
      {props.error && <DatePicker.ErrorMessage>{props.error}</DatePicker.ErrorMessage>}
      <DatePicker.Portal>
        <DatePicker.Content>
          <DatePicker.Header>
            <DatePicker.PrevTrigger />
            <DatePicker.Heading />
            <DatePicker.NextTrigger />
          </DatePicker.Header>
          <DatePicker.Grid />
        </DatePicker.Content>
      </DatePicker.Portal>
    </DatePicker>
  );
}

export function DatePickerPage() {
  const [start, setStart] = createSignal<Date | null>(inDays(-10));

  return (
    <Cases>
      <Case title="Default" description="Type a date, or open the calendar with the button or Alt + ↓. Days before today can't be picked." layout="fill">
        <Picker label="Due date" defaultValue={inDays(2)} minValue={today} hint="Days before today can't be picked." />
      </Case>
      <Case title="Invalid" description="A day before today; pick a later one to fix it." layout="fill">
        <Picker
          label="Start date"
          value={start()}
          onChange={setStart}
          validationState={start() && start()! < inDays(0) ? "invalid" : "valid"}
          error="Pick today or a later day."
        />
      </Case>
      <Case title="Disabled" layout="fill">
        <Picker label="Return date" defaultValue={inDays(6)} disabled hint="Locked once the trip is booked." />
      </Case>
      <Case title="Read-only" layout="fill">
        <Picker label="Booked on" defaultValue={inDays(-30)} readOnly />
      </Case>
      <Case title="Unavailable days" description="isDateUnavailable blocks weekends here." layout="fill">
        <Picker
          label="Meeting day"
          isDateUnavailable={(date) => date.getDay() === 0 || date.getDay() === 6}
          hint="Weekdays only."
        />
      </Case>
      <Case title="Sunday first, US format" description='locale="en-US" and firstDayOfWeek={0}.' layout="fill">
        <Picker label="Delivery" locale="en-US" firstDayOfWeek={0} defaultValue={inDays(3)} />
      </Case>
    </Cases>
  );
}
