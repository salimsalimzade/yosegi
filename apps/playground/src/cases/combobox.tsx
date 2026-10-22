import { createSignal, omit } from "solid-js";
import { Combobox, type ComboboxOption, type ComboboxProps } from "yosegi";
import { Case, Cases } from "../ui/case";

const cities: ComboboxOption[] = [
  "Amsterdam", "Baku", "Berlin", "Buenos Aires", "Cairo", "Istanbul", "Kyoto", "Lisbon",
  "London", "Mexico City", "Nairobi", "Osaka", "Paris", "Seoul", "Tbilisi", "Tokyo",
].map((city) => ({ value: city.toLowerCase().replace(/\s/g, "-"), label: city, disabled: city === "Cairo" }));

function Field(props: Omit<ComboboxProps, "options"> & { label: string; hint?: string; error?: string; options?: ComboboxOption[] }) {
  return (
    <Combobox {...omit(props, "label", "hint", "error", "options")} options={props.options ?? cities}>
      <Combobox.Label>{props.label}</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input />
        <Combobox.Trigger />
      </Combobox.Control>
      {props.hint && <Combobox.Description>{props.hint}</Combobox.Description>}
      {props.error && <Combobox.ErrorMessage>{props.error}</Combobox.ErrorMessage>}
      <Combobox.Portal>
        <Combobox.Content emptyText="No city by that name" />
      </Combobox.Portal>
    </Combobox>
  );
}

export function ComboboxPage() {
  const [city, setCity] = createSignal<string | null>(null);

  return (
    <Cases>
      <Case title="Default" description="Type to filter; ↑ ↓ to move, Enter to pick, Escape to close. Cairo is disabled." layout="fill">
        <Field label="City" placeholder="Search cities" hint="Type to filter." />
      </Case>
      <Case title="With a value" layout="fill">
        <Field label="City" defaultValue="kyoto" />
      </Case>
      <Case title="Starts with" description='filter="startsWith" matches the beginning of each name.' layout="fill">
        <Field label="City" filter="startsWith" placeholder="Try “to”" />
      </Case>
      <Case title="Invalid" description="Required; pick a city to clear it." layout="fill">
        <Field
          label="Home city"
          value={city()}
          onChange={setCity}
          validationState={city() ? "valid" : "invalid"}
          error="Choose your home city."
          placeholder="Search cities"
        />
      </Case>
      <Case title="Disabled" layout="fill">
        <Field label="City" defaultValue="baku" disabled />
      </Case>
    </Cases>
  );
}
