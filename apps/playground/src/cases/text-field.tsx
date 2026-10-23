import { createSignal } from "solid-js";
import { SearchIcon, TextField } from "yosegi";
import { Case, Cases } from "../ui/case";

export function TextFieldPage() {
  const [email, setEmail] = createSignal("hello@");
  const [touched, setTouched] = createSignal(true);
  const invalid = () => touched() && !/^\S+@\S+\.\S+$/.test(email());

  return (
    <Cases>
      <Case title="Default" description="label, placeholder and description: the field builds its parts." layout="fill">
        <TextField label="Project name" placeholder="e.g. Reading list" description="You can change it later." />
      </Case>

      <Case title="Filled" description="Has a value." layout="fill">
        <TextField label="Project name" defaultValue="Reading list" description="You can change it later." />
      </Case>

      <Case title="Invalid" description="Validated after blur: errorMessage is set only then, and replaces the hint. Type a full address to fix it." layout="fill">
        <TextField
          label="Email"
          type="email"
          value={email()}
          onChange={setEmail}
          onFocusOut={() => setTouched(true)}
          description="We'll send the invite here."
          errorMessage={invalid() ? "Enter a full email address." : undefined}
        />
      </Case>

      <Case title="Disabled" description="Can't be used; say why in the hint." layout="fill">
        <TextField label="Folder" disabled defaultValue="Personal" description="Folders are locked while syncing." />
      </Case>

      <Case title="Read-only" description="Shown, not edited; it can still be copied and is sent with the form." layout="fill">
        <TextField label="Project ID" readOnly defaultValue="prj_8f2c11" description="Set by Yosegi; copy it, don't edit it." />
      </Case>

      <Case title="Leading icon" description="icon puts a 16px icon before the text, like the search glass." layout="fill">
        <TextField icon={<SearchIcon />} type="search" placeholder="Search invoices" aria-label="Search invoices" />
      </Case>

      <Case title="Loading" description="Something about the value is being checked: a spinner, and the field stays usable." layout="fill">
        <TextField label="Username" loading defaultValue="salim" description="Checking that the name is free…" />
      </Case>

      <Case title="Text area" description="multiline: several lines, growing with the text." layout="fill">
        <TextField label="Notes" multiline placeholder="Anything to remember?" />
      </Case>

      <Case title="Required" description="Marked required, so the browser and screen readers know." layout="fill">
        <TextField label="Title" required placeholder="Give the note a title" />
      </Case>
    </Cases>
  );
}
