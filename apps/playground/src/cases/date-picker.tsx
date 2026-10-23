import { createSignal } from "solid-js";
import { DatePicker } from "yosegi";
import { Case, Cases } from "../ui/case";

const today = new Date();
const inDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

export function DatePickerPage() {
  const [start, setStart] = createSignal<Date | null>(inDays(-10));

  return (
    <Cases>
      <Case title="Default" description="Type a date, or open the calendar with the button or Alt + ↓. Days before today can't be picked." layout="fill">
        <DatePicker label="Due date" defaultValue={inDays(2)} minValue={today} description="Days before today can't be picked." />
      </Case>
      <Case title="Invalid" description="A day before today; pick a later one to fix it." layout="fill">
        <DatePicker
          label="Start date"
          value={start()}
          onChange={setStart}
          validationState={start() && start()! < inDays(0) ? "invalid" : "valid"}
          errorMessage="Pick today or a later day."
        />
      </Case>
      <Case title="Disabled" layout="fill">
        <DatePicker label="Return date" defaultValue={inDays(6)} disabled description="Locked once the trip is booked." />
      </Case>
      <Case title="Read-only" layout="fill">
        <DatePicker label="Booked on" defaultValue={inDays(-30)} readOnly />
      </Case>
      <Case title="Unavailable days" description="isDateUnavailable blocks weekends here." layout="fill">
        <DatePicker
          label="Meeting day"
          isDateUnavailable={(date) => date.getDay() === 0 || date.getDay() === 6}
          description="Weekdays only."
        />
      </Case>
      <Case title="Sunday first, US format" description='locale="en-US" and firstDayOfWeek={0}.' layout="fill">
        <DatePicker label="Delivery" locale="en-US" firstDayOfWeek={0} defaultValue={inDays(3)} />
      </Case>
    </Cases>
  );
}
