import { createSignal } from "solid-js";
import { NumberField } from "yosegi";
import { Case, Cases } from "../ui/case";

export function NumberFieldPage() {
  const [copies, setCopies] = createSignal(12);

  return (
    <Cases>
      <Case title="Default" description="Try the buttons, or the arrow keys, Page Up and Down, Home and End." layout="fill">
        <NumberField label="Copies" defaultValue={2} minValue={1} maxValue={10} description="From 1 to 10." />
      </Case>
      <Case title="At the limit" description="At the minimum, so − is disabled." layout="fill">
        <NumberField label="Guests" defaultValue={1} minValue={1} maxValue={8} description="At least one guest." />
      </Case>
      <Case title="Invalid" description="Out of range; step down to fix it." layout="fill">
        <NumberField
          label="Copies"
          value={copies()}
          onChange={setCopies}
          validationState={copies() > 10 ? "invalid" : "valid"}
          description="From 1 to 10."
          errorMessage="Enter a number from 1 to 10."
        />
      </Case>
      <Case title="Disabled" layout="fill">
        <NumberField label="Copies" defaultValue={3} disabled />
      </Case>
      <Case title="Formatted" description="formatOptions for currency, percent or units." layout="fill">
        <NumberField label="Budget" defaultValue={96000} step={1000} formatOptions={{ style: "currency", currency: "JPY" }} />
      </Case>
      <Case title="Percent" layout="fill">
        <NumberField label="Discount" defaultValue={0.15} step={5} minValue={0} maxValue={1} formatOptions={{ style: "percent" }} />
      </Case>
    </Cases>
  );
}
