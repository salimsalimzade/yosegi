import { createSignal, omit } from "solid-js";
import { Checkbox, type CheckboxProps } from "yosegi";
import { Case, Cases } from "../ui/case";

function Box(props: CheckboxProps & { label: string; hint?: string; error?: string }) {
  const rest = omit(props, "label", "hint", "error");
  return (
    <Checkbox {...rest}>
      <Checkbox.Input />
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Label>{props.label}</Checkbox.Label>
      {props.hint && <Checkbox.Description>{props.hint}</Checkbox.Description>}
      {props.error && <Checkbox.ErrorMessage>{props.error}</Checkbox.ErrorMessage>}
    </Checkbox>
  );
}

export function CheckboxPage() {
  const [terms, setTerms] = createSignal(false);
  const notes = ["Trip to Kyoto", "Reading list", "Groceries"];
  const [picked, setPicked] = createSignal(["Reading list"]);
  const toggle = (note: string, on: boolean) => setPicked((list) => (on ? [...list, note] : list.filter((n) => n !== note)));

  return (
    <Cases>
      <Case title="Checked, with a hint" layout="stack">
        <Box label="Send me a weekly summary" defaultChecked hint="Every Monday, one email, no ads." />
      </Case>
      <Case title="Unchecked" layout="stack">
        <Box label="Make this project public" />
      </Case>
      <Case title="Indeterminate" description="A select-all box when some are selected. Click the rows below it." layout="stack">
        <Box
          label="Select all notes"
          checked={picked().length === notes.length}
          indeterminate={picked().length > 0 && picked().length < notes.length}
          onChange={(on) => setPicked(on ? notes : [])}
          hint={`${picked().length} of ${notes.length} selected.`}
        />
        {notes.map((note) => (
          <Box label={note} checked={picked().includes(note)} onChange={(on) => toggle(note, on)} style={{ "margin-left": "26px" }} />
        ))}
      </Case>
      <Case title="Invalid" description="Tick it to clear the error." layout="stack">
        <Box
          label="I accept the terms"
          checked={terms()}
          onChange={setTerms}
          validationState={terms() ? "valid" : "invalid"}
          error="Accept the terms to continue."
        />
      </Case>
      <Case title="Disabled" layout="stack">
        <Box label="Sync over mobile data" defaultChecked disabled />
        <Box label="Archive old notes" disabled />
      </Case>
    </Cases>
  );
}
