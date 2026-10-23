import { createSignal } from "solid-js";
import { Checkbox } from "yosegi";
import { Case, Cases } from "../ui/case";

export function CheckboxPage() {
  const [terms, setTerms] = createSignal(false);
  const notes = ["Trip to Kyoto", "Reading list", "Groceries"];
  const [picked, setPicked] = createSignal(["Reading list"]);
  const toggle = (note: string, on: boolean) => setPicked((list) => (on ? [...list, note] : list.filter((n) => n !== note)));

  return (
    <Cases>
      <Case title="Checked, with a hint" layout="stack">
        <Checkbox label="Send me a weekly summary" defaultChecked description="Every Monday, one email, no ads." />
      </Case>
      <Case title="Unchecked" layout="stack">
        <Checkbox label="Make this project public" />
      </Case>
      <Case title="Indeterminate" description="A select-all box when some are selected. Click the rows below it." layout="stack">
        <Checkbox
          label="Select all notes"
          checked={picked().length === notes.length}
          indeterminate={picked().length > 0 && picked().length < notes.length}
          onChange={(on) => setPicked(on ? notes : [])}
          description={`${picked().length} of ${notes.length} selected.`}
        />
        {notes.map((note) => (
          <Checkbox label={note} checked={picked().includes(note)} onChange={(on) => toggle(note, on)} style={{ "margin-left": "26px" }} />
        ))}
      </Case>
      <Case title="Invalid" description="Tick it to clear the error." layout="stack">
        <Checkbox
          label="I accept the terms"
          checked={terms()}
          onChange={setTerms}
          validationState={terms() ? "valid" : "invalid"}
          errorMessage="Accept the terms to continue."
        />
      </Case>
      <Case title="Disabled" layout="stack">
        <Checkbox label="Sync over mobile data" defaultChecked disabled />
        <Checkbox label="Archive old notes" disabled />
      </Case>
    </Cases>
  );
}
