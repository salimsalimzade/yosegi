import { createSignal, onSettled } from "solid-js";
import { ArchiveIcon, Button, Command, FileIcon, PlusIcon, SettingsIcon, toast } from "yosegi";
import { Case, Cases } from "../ui/case";

function Commands(props: { onRun: (name: string) => void }) {
  return (
    <>
      <Command.Input />
      <Command.List>
        <Command.Empty />
        <Command.Group heading="Notes">
          <Command.Item value="New note" keywords={["create", "add"]} onSelect={props.onRun}>
            <PlusIcon /> New note
            <Command.Shortcut>⌘N</Command.Shortcut>
          </Command.Item>
          <Command.Item value="Trip to Kyoto" onSelect={props.onRun}>
            <FileIcon /> Trip to Kyoto
          </Command.Item>
          <Command.Item value="Reading list" onSelect={props.onRun}>
            <FileIcon /> Reading list
          </Command.Item>
        </Command.Group>
        <Command.Separator />
        <Command.Group heading="Settings">
          <Command.Item value="Preferences" keywords={["settings", "options"]} onSelect={props.onRun}>
            <SettingsIcon /> Preferences
            <Command.Shortcut>⌘,</Command.Shortcut>
          </Command.Item>
          <Command.Item value="Billing" disabled onSelect={props.onRun}>
            <SettingsIcon /> Billing
          </Command.Item>
        </Command.Group>
      </Command.List>
    </>
  );
}

export function CommandPage() {
  const [open, setOpen] = createSignal(false);
  const run = (name: string) => {
    setOpen(false);
    toast(`Ran “${name}”`);
  };

  // ⌘K or Ctrl+K opens the palette while this page is shown.
  onSettled(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  return (
    <>
      <Cases>
        <Case title="Inline" description="Type to filter: “sett” finds Preferences by keyword. ↑ ↓ move, Enter runs, Billing is disabled." layout="fill">
          <Command>
            <Commands onRun={run} />
          </Command>
        </Case>
        <Case title="Short list, no groups" description="Items straight in the list." layout="fill">
          <Command label="Move note">
            <Command.Input placeholder="Move to…" />
            <Command.List>
              <Command.Empty>No folder by that name.</Command.Empty>
              {["Inbox", "Personal", "Work", "Travel"].map((folder) => (
                <Command.Item value={folder} onSelect={run}>
                  <ArchiveIcon /> {folder}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Case>
      </Cases>
      <Case title="Palette in a dialog" description="Command.Dialog; open it with the button, or ⌘K / Ctrl+K anywhere on this page.">
        <Button
          label={
            <>
              Open command palette <kbd class="yosegi-command-shortcut">⌘K</kbd>
            </>
          }
          variant="outline"
          onClick={() => setOpen(true)}
        />
        <Command.Dialog open={open()} onOpenChange={setOpen} label="Command palette">
          <Commands onRun={run} />
        </Command.Dialog>
      </Case>
    </>
  );
}
