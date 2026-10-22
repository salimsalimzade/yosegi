import { createSignal, For } from "solid-js";
import { Button, ButtonGroup, GridIcon, ListIcon } from "yosegi";
import { Case } from "../ui/case";

export function ButtonGroupPage() {
  const [range, setRange] = createSignal("Week");
  const [view, setView] = createSignal("List");
  const [sort, setSort] = createSignal("Newest first");

  return (
    <>
      <Case title="Spaced actions" description="Related actions in a row, with one solid main action.">
        <ButtonGroup aria-label="Note actions">
          <Button>Save</Button>
          <Button variant="outline">Preview</Button>
          <Button variant="ghost">Cancel</Button>
        </ButtonGroup>
      </Case>

      <Case title="Attached toggles" description="A segmented control: one choice among a few. Click to switch.">
        <ButtonGroup attached aria-label="Range">
          <For each={["Day", "Week", "Month", "Year"]}>
            {(value) => (
              <Button variant="outline" aria-pressed={range() === value} onClick={() => setRange(value)}>
                {value}
              </Button>
            )}
          </For>
        </ButtonGroup>
      </Case>

      <Case title="Icon toolbar" description="Attached icon buttons, each with an aria-label.">
        <ButtonGroup attached aria-label="View">
          <Button variant="outline" icon={<ListIcon />} aria-label="List" aria-pressed={view() === "List"} onClick={() => setView("List")} />
          <Button variant="outline" icon={<GridIcon />} aria-label="Grid" aria-pressed={view() === "Grid"} onClick={() => setView("Grid")} />
        </ButtonGroup>
      </Case>

      <Case title="Vertical" description={'orientation="vertical"; labels line up on the left.'}>
        <ButtonGroup attached orientation="vertical" aria-label="Sort" style={{ width: "160px" }}>
          <For each={["Newest first", "Oldest first", "A to Z"]}>
            {(value) => (
              <Button variant="outline" aria-pressed={sort() === value} onClick={() => setSort(value)}>
                {value}
              </Button>
            )}
          </For>
        </ButtonGroup>
      </Case>
    </>
  );
}
