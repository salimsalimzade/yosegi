import { For } from "solid-js";
import { ArrowRightIcon, Button, DownloadIcon, InfoIcon, PlusIcon, SettingsIcon, TrashIcon } from "yosegi";
import { Case } from "../ui/case";
import { createTask } from "../ui/task";

const iconButtons = [
  { label: "Add note", icon: PlusIcon, variant: "solid", size: "md" },
  { label: "Settings", icon: SettingsIcon, variant: "outline", size: "md" },
  { label: "Download", icon: DownloadIcon, variant: "ghost", size: "md" },
  { label: "Delete", icon: TrashIcon, variant: "danger", size: "md" },
  { label: "Add, small", icon: PlusIcon, variant: "outline", size: "sm" },
  { label: "Add, large", icon: PlusIcon, variant: "outline", size: "lg" },
] as const;

export function ButtonPage() {
  const [saving, save] = createTask();
  const [exporting, exportNotes] = createTask();
  const [deleting, remove] = createTask();
  const [allLoading, loadAll] = createTask(3000);
  const iconTasks = iconButtons.map(() => createTask());

  return (
    <>
      <Case title="Variants" description="Solid for the one main action; outline and ghost for the rest; danger for what can't be undone.">
        <Button label="Save" />
        <Button label="Cancel" variant="outline" />
        <Button label="Skip" variant="ghost" />
        <Button label="Delete" variant="danger" />
      </Case>

      <Case title="Label as children" description="label is the text on the button; children work the same way.">
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
      </Case>

      <Case title="Sizes" description="sm 28px, md 36px (default), lg 44px.">
        <Button label="Small" size="sm" />
        <Button label="Medium" />
        <Button label="Large" size="lg" />
      </Case>

      <Case title="With an icon" description={'icon sits at the start by default; iconPosition="end" for arrows.'}>
        <Button label="New note" icon={<PlusIcon />} />
        <Button label="Continue" variant="outline" icon={<ArrowRightIcon />} iconPosition="end" />
        <Button label="Download" variant="ghost" icon={<DownloadIcon />} />
        <Button label="Small" size="sm" variant="outline" icon={<PlusIcon />} />
        <Button label="Large" size="lg" icon={<PlusIcon />} />
      </Case>

      <Case title="Icon only" description="An icon with no label makes a square button. It needs an aria-label.">
        <For each={iconButtons}>
          {(button) => <Button icon={<button.icon />} variant={button.variant} size={button.size} aria-label={button.label} />}
        </For>
      </Case>

      <Case title="Loading" description="Click one. The spinner takes the icon's place, and loadingText says what's happening.">
        <Button label="Save" loading={saving()} loadingText="Saving…" onClick={save} />
        <Button label="Export notes" variant="outline" icon={<DownloadIcon />} loading={exporting()} loadingText="Exporting…" onClick={exportNotes} />
        <Button label="Delete project" variant="danger" icon={<TrashIcon />} loading={deleting()} loadingText="Deleting…" onClick={remove} />
      </Case>

      <Case title="Icon only, loading" description="Click one, or load them all. The spinner replaces the icon and the button stays square.">
        <For each={iconButtons}>
          {(button, index) => (
            <Button
              icon={<button.icon />}
              variant={button.variant}
              size={button.size}
              aria-label={button.label}
              loading={allLoading() || iconTasks[index()][0]()}
              onClick={iconTasks[index()][1]}
            />
          )}
        </For>
        <Button label="Load all" variant="ghost" size="sm" disabled={allLoading()} onClick={loadAll} />
      </Case>

      <Case title="Disabled" description="40% opacity; can't be focused or clicked. Say why nearby.">
        <Button label="Save" disabled />
        <Button label="Cancel" variant="outline" disabled />
        <Button label="Skip" variant="ghost" disabled />
        <Button variant="outline" icon={<InfoIcon />} aria-label="Info" disabled />
      </Case>

      <Case title="As a link" description={'as="a" keeps the look on an anchor.'}>
        <Button label="See pricing" as="a" href="#button" variant="outline" icon={<ArrowRightIcon />} iconPosition="end" />
      </Case>
    </>
  );
}
