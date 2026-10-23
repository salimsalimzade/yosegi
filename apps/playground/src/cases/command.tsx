import { createSignal, onSettled } from "solid-js";
import { ArchiveIcon, Button, Command, type CommandAction, FileIcon, PlusIcon, SettingsIcon, toast } from "yosegi";
import { Case, Cases } from "../ui/case";

// A function, so the inline list and the dialog each get their own icons.
const commands = (): CommandAction[] => [
  { value: "New note", icon: <PlusIcon />, keywords: ["create", "add"], shortcut: "⌘N", group: "Notes" },
  { value: "Trip to Kyoto", icon: <FileIcon />, group: "Notes" },
  { value: "Reading list", icon: <FileIcon />, group: "Notes" },
  {
    value: "Preferences",
    icon: <SettingsIcon />,
    keywords: ["settings", "options"],
    shortcut: "⌘,",
    group: "Settings",
  },
  { value: "Billing", icon: <SettingsIcon />, disabled: true, group: "Settings" },
];

const folders: CommandAction[] = ["Inbox", "Personal", "Work", "Travel"].map((folder) => ({
  value: folder,
  icon: <ArchiveIcon />,
}));

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
        <Case
          title="Inline"
          description="Type to filter: “sett” finds Preferences by keyword. ↑ ↓ move, Enter runs, Billing is disabled. group puts items under headings."
          layout="fill"
        >
          <Command items={commands()} onSelect={run} />
        </Case>
        <Case
          title="Short list, no groups"
          description="Items straight in the list, with their own empty text."
          layout="fill"
        >
          <Command
            label="Move note"
            placeholder="Move to…"
            empty="No folder by that name."
            items={folders}
            onSelect={run}
          />
        </Case>
      </Cases>
      <Case
        title="Palette in a dialog"
        description="Command.Dialog takes the same items; open it with the button, or ⌘K / Ctrl+K anywhere on this page."
      >
        <Button
          label={
            <>
              Open command palette <kbd class="yosegi-command-shortcut">⌘K</kbd>
            </>
          }
          variant="outline"
          onClick={() => setOpen(true)}
        />
        <Command.Dialog
          open={open()}
          onOpenChange={setOpen}
          label="Command palette"
          items={commands()}
          onSelect={run}
        />
      </Case>
    </>
  );
}
