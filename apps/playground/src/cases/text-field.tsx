import { createSignal } from "solid-js";
import { Spinner, TextField } from "yosegi";
import { Case, Cases } from "../ui/case";

export function TextFieldPage() {
  const [email, setEmail] = createSignal("hello@");
  const [touched, setTouched] = createSignal(true);
  const invalid = () => touched() && !/^\S+@\S+\.\S+$/.test(email());

  return (
    <Cases>
      <Case title="Default" description="Empty, with a placeholder and a hint." layout="fill">
        <TextField>
          <TextField.Label>Project name</TextField.Label>
          <TextField.Input placeholder="e.g. Reading list" />
          <TextField.Description>You can change it later.</TextField.Description>
        </TextField>
      </Case>

      <Case title="Filled" description="Has a value." layout="fill">
        <TextField defaultValue="Reading list">
          <TextField.Label>Project name</TextField.Label>
          <TextField.Input />
          <TextField.Description>You can change it later.</TextField.Description>
        </TextField>
      </Case>

      <Case title="Invalid" description="Validated after blur; the error replaces the hint. Type a full address to fix it." layout="fill">
        <TextField
          value={email()}
          onChange={setEmail}
          onFocusOut={() => setTouched(true)}
          validationState={invalid() ? "invalid" : "valid"}
        >
          <TextField.Label>Email</TextField.Label>
          <TextField.Input type="email" />
          <TextField.Description>We'll send the invite here.</TextField.Description>
          <TextField.ErrorMessage>Enter a full email address.</TextField.ErrorMessage>
        </TextField>
      </Case>

      <Case title="Disabled" description="Can't be used; say why in the hint." layout="fill">
        <TextField disabled defaultValue="Personal">
          <TextField.Label>Folder</TextField.Label>
          <TextField.Input />
          <TextField.Description>Folders are locked while syncing.</TextField.Description>
        </TextField>
      </Case>

      <Case title="Read-only" description="Shown, not edited; it can still be copied and is sent with the form." layout="fill">
        <TextField readOnly defaultValue="prj_8f2c11">
          <TextField.Label>Project ID</TextField.Label>
          <TextField.Input />
          <TextField.Description>Set by Yosegi; copy it, don't edit it.</TextField.Description>
        </TextField>
      </Case>

      <Case title="Loading" description="Something about the value is being checked; the field stays usable." layout="fill">
        <TextField loading defaultValue="salim">
          <TextField.Label>Username</TextField.Label>
          <TextField.Group>
            <TextField.Input />
            <Spinner />
          </TextField.Group>
          <TextField.Description>Checking that the name is free…</TextField.Description>
        </TextField>
      </Case>

      <Case title="Text area" description="Several lines; autoResize grows with the text." layout="fill">
        <TextField>
          <TextField.Label>Notes</TextField.Label>
          <TextField.TextArea autoResize placeholder="Anything to remember?" />
        </TextField>
      </Case>

      <Case title="Required" description="Marked required, so the browser and screen readers know." layout="fill">
        <TextField required>
          <TextField.Label>Title</TextField.Label>
          <TextField.Input placeholder="Give the note a title" />
        </TextField>
      </Case>
    </Cases>
  );
}
