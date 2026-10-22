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
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="ghost">Skip</Button>
        <Button variant="danger">Delete</Button>
      </Case>

      <Case title="Sizes" description="sm 28px, md 36px (default), lg 44px.">
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
        <Button size="lg">Large</Button>
      </Case>

      <Case title="With an icon" description={'icon sits at the start by default; iconPosition="end" for arrows.'}>
        <Button icon={<PlusIcon />}>New note</Button>
        <Button variant="outline" icon={<ArrowRightIcon />} iconPosition="end">
          Continue
        </Button>
        <Button variant="ghost" icon={<DownloadIcon />}>
          Download
        </Button>
        <Button size="sm" variant="outline" icon={<PlusIcon />}>
          Small
        </Button>
        <Button size="lg" icon={<PlusIcon />}>
          Large
        </Button>
      </Case>

      <Case title="Icon only" description="An icon with no label makes a square button. It needs an aria-label.">
        <For each={iconButtons}>
          {(button) => <Button icon={<button.icon />} variant={button.variant} size={button.size} aria-label={button.label} />}
        </For>
      </Case>

      <Case title="Loading" description="Click one. The spinner takes the icon's place, and loadingText says what's happening.">
        <Button loading={saving()} loadingText="Saving…" onClick={save}>
          Save
        </Button>
        <Button variant="outline" icon={<DownloadIcon />} loading={exporting()} loadingText="Exporting…" onClick={exportNotes}>
          Export notes
        </Button>
        <Button variant="danger" icon={<TrashIcon />} loading={deleting()} loadingText="Deleting…" onClick={remove}>
          Delete project
        </Button>
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
        <Button variant="ghost" size="sm" disabled={allLoading()} onClick={loadAll}>
          Load all
        </Button>
      </Case>

      <Case title="Disabled" description="40% opacity; can't be focused or clicked. Say why nearby.">
        <Button disabled>Save</Button>
        <Button variant="outline" disabled>
          Cancel
        </Button>
        <Button variant="ghost" disabled>
          Skip
        </Button>
        <Button variant="outline" icon={<InfoIcon />} aria-label="Info" disabled />
      </Case>

      <Case title="As a link" description={'as="a" keeps the look on an anchor.'}>
        <Button as="a" href="#button" variant="outline" icon={<ArrowRightIcon />} iconPosition="end">
          See pricing
        </Button>
      </Case>
    </>
  );
}
