import { createSignal } from "solid-js";
import { Select, type SelectOption, type SelectProps } from "yosegi";
import { Case, Cases } from "../ui/case";

const statuses: SelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived", disabled: true },
];

const roles: SelectOption[] = [
  { value: "owner", label: "Owner", group: "Full access" },
  { value: "admin", label: "Admin", group: "Full access" },
  { value: "editor", label: "Editor", group: "Can edit" },
  { value: "author", label: "Author", group: "Can edit" },
  { value: "viewer", label: "Viewer", group: "Read only" },
  { value: "guest", label: "Guest", group: "Read only" },
];

/** Your own objects: the API's shape, not { value, label }. */
const plans = [
  { code: "free", title: "Free", seats: 1 },
  { code: "team", title: "Team", seats: 10 },
  { code: "business", title: "Business", seats: 50 },
  { code: "legacy", title: "Legacy", seats: 5, retired: true },
];

const categories: SelectOption[] = [
  { value: "travel", label: "Travel, food and long weekends in the mountains" },
  { value: "work", label: "Work" },
  { value: "home", label: "Home" },
];

/** The statuses and their placeholder, unless the case gives its own. */
function Field(props: Partial<SelectProps>) {
  return <Select options={statuses} placeholder="Choose a status" {...props} />;
}

export function SelectPage() {
  const [status, setStatus] = createSignal<string | null>("review");
  const [seats, setSeats] = createSignal<number | null>(null);

  return (
    <Cases>
      <Case title="Nothing chosen yet" description="The placeholder, in muted text. Archived can't be picked." layout="stack">
        <Field label="Status" description="Who can see the post depends on it." />
      </Case>
      <Case title="Chosen" description="Controlled: the value lives in the page." layout="stack">
        <Field label="Status" value={status()} onChange={setStatus} description="Who can see the post depends on it." />
        <p>
          Chosen: <code>{status() ?? "nothing"}</code>
        </p>
      </Case>
      <Case title="Groups" description="Options with a group sit under its heading." layout="stack">
        <Field label="Role" options={roles} placeholder="Choose a role" defaultValue="editor" />
      </Case>
      <Case title="Your own rows" description="renderOption draws each option's row." layout="stack">
        <Field
          label="Status"
          defaultValue="published"
          renderOption={(option) => (
            <>
              {option.label} <small style={{ color: "var(--yosegi-color-fg-muted)" }}>{option.value}</small>
            </>
          )}
        />
      </Case>
      <Case
        title="Your own objects"
        description="options are { code, title, seats, retired }: getOptionValue, getOptionLabel and getOptionDisabled read them. onChange gets the code and the plan."
        layout="stack"
      >
        <Select
          label="Plan"
          placeholder="Choose a plan"
          options={plans}
          getOptionValue={(plan) => plan.code}
          getOptionLabel={(plan) => plan.title}
          getOptionDisabled={(plan) => !!plan.retired}
          onChange={(_, plan) => setSeats(plan.seats)}
        />
        <p>
          Seats: <code>{seats() ?? "nothing chosen"}</code>
        </p>
      </Case>
      <Case title="Invalid" description="The ErrorMessage replaces the Description." layout="stack">
        <Field label="Status" description="Who can see the post depends on it." errorMessage="Choose a status." />
      </Case>
      <Case title="Disabled" description="Say why in the Description." layout="stack">
        <Field label="Status" defaultValue="published" disabled description="Published posts are locked." />
      </Case>
      <Case title="Read-only" description="A muted box with no chevron; the value is still sent with a form." layout="stack">
        <Field label="Status" defaultValue="scheduled" readOnly description="Set by your editor." />
      </Case>
      <Case title="Long value" description="Ends with “…” in the box and in rows." layout="stack">
        <Field label="Category" options={categories} defaultValue="travel" placeholder="Choose a category" />
      </Case>
      <Case
        title="Keyboard"
        description="Enter, Space, ↓ or ↑ opens it; ↑ ↓ move, Home and End jump, Enter or Space picks, Escape closes. A letter moves to the next option starting with it."
        layout="stack"
      >
        <Field label="Status" />
      </Case>
    </Cases>
  );
}
