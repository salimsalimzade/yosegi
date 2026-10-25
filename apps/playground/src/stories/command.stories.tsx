import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, onSettled } from "solid-js";
import { ArchiveIcon, Button, Command, type CommandAction, FileIcon, PlusIcon, SettingsIcon, toast } from "yosegi";

// A function, so each story gets its own icons.
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

const folders = (): CommandAction[] =>
  ["Inbox", "Personal", "Work", "Travel"].map((folder) => ({ value: folder, icon: <ArchiveIcon /> }));

const run = (name: string) => toast(`Ran “${name}”`);

const meta = {
  title: "Navigation/Command",
  component: Command,
  parameters: {
    stage: "field",
    docs: {
      description: { component: "A searchable list of actions, for a command palette or a quick switcher." },
    },
  },
  args: { label: "Commands", placeholder: "Type a command or search…", empty: "No results." },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    empty: { control: "text" },
  },
  render: (args) => <Command {...args} items={commands()} onSelect={run} />,
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/**
 * Type to filter: “sett” finds Preferences by keyword. ↑ ↓ move, Enter runs, Billing is disabled.
 * group puts items under headings.
 */
export const Inline: Story = {
  render: () => <Command items={commands()} onSelect={run} />,
};

/** Items straight in the list, with their own empty text. */
export const ShortListNoGroups: Story = {
  name: "Short list, no groups",
  render: () => (
    <Command
      label="Move note"
      placeholder="Move to…"
      empty="No folder by that name."
      items={folders()}
      onSelect={run}
    />
  ),
};

/** Command.Dialog takes the same items; open it with the button, or ⌘K / Ctrl+K while this story is shown. */
export const PaletteInADialog: Story = {
  name: "Palette in a dialog",
  parameters: { stage: "row" },
  render: () => {
    const [open, setOpen] = createSignal(false);

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
          onSelect={(name) => {
            setOpen(false);
            run(name);
          }}
        />
      </>
    );
  },
};
