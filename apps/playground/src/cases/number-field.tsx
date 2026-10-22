import { createSignal, omit, Show } from "solid-js";
import { NumberField, type NumberFieldProps } from "yosegi";
import { Case, Cases } from "../ui/case";

function Field(props: NumberFieldProps & { label: string; description?: string; error?: string }) {
  const rest = omit(props, "label", "description", "error");
  return (
    <NumberField {...rest}>
      <NumberField.Label>{props.label}</NumberField.Label>
      <NumberField.Group>
        <NumberField.Input />
        <NumberField.DecrementTrigger />
        <NumberField.IncrementTrigger />
      </NumberField.Group>
      <Show when={props.description}>
        <NumberField.Description>{props.description}</NumberField.Description>
      </Show>
      <Show when={props.error}>
        <NumberField.ErrorMessage>{props.error}</NumberField.ErrorMessage>
      </Show>
    </NumberField>
  );
}

export function NumberFieldPage() {
  const [copies, setCopies] = createSignal(12);

  return (
    <Cases>
      <Case title="Default" description="Try the buttons, or the arrow keys, Page Up and Down, Home and End." layout="fill">
        <Field label="Copies" defaultValue={2} minValue={1} maxValue={10} description="From 1 to 10." />
      </Case>
      <Case title="At the limit" description="At the minimum, so − is disabled." layout="fill">
        <Field label="Guests" defaultValue={1} minValue={1} maxValue={8} description="At least one guest." />
      </Case>
      <Case title="Invalid" description="Out of range; step down to fix it." layout="fill">
        <Field
          label="Copies"
          value={copies()}
          onChange={setCopies}
          validationState={copies() > 10 ? "invalid" : "valid"}
          description="From 1 to 10."
          error="Enter a number from 1 to 10."
        />
      </Case>
      <Case title="Disabled" layout="fill">
        <Field label="Copies" defaultValue={3} disabled />
      </Case>
      <Case title="Formatted" description="formatOptions for currency, percent or units." layout="fill">
        <Field label="Budget" defaultValue={96000} step={1000} formatOptions={{ style: "currency", currency: "JPY" }} />
      </Case>
      <Case title="Percent" layout="fill">
        <Field label="Discount" defaultValue={0.15} step={5} minValue={0} maxValue={1} formatOptions={{ style: "percent" }} />
      </Case>
    </Cases>
  );
}
