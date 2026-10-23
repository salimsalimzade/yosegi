import { createSignal } from "solid-js";
import { Button, Dialog, TextField, toast, TrashIcon } from "yosegi";
import { Case } from "../ui/case";
import { createTask } from "../ui/task";

export function DialogPage() {
  const [confirmOpen, setConfirmOpen] = createSignal(false);
  const [renameOpen, setRenameOpen] = createSignal(false);
  const [archiveOpen, setArchiveOpen] = createSignal(false);
  const [deleting, remove] = createTask(1200);
  const [saving, save] = createTask(1200);
  const [name, setName] = createSignal("Trip to Kyoto");

  const confirmDelete = () => {
    remove();
    setTimeout(() => {
      setConfirmOpen(false);
      toast.success("Project deleted");
    }, 1200);
  };

  const rename = () => {
    save();
    setTimeout(() => {
      setRenameOpen(false);
      toast.success(`Renamed to “${name()}”`);
    }, 1200);
  };

  return (
    <>
      <Case
        title="Confirmation"
        description='role="alertdialog" for a choice that interrupts. Escape or Cancel closes; the main action shows it is busy.'
      >
        <Dialog
          open={confirmOpen()}
          onOpenChange={setConfirmOpen}
          role="alertdialog"
          trigger={{ label: "Delete project", variant: "danger", icon: <TrashIcon /> }}
          title="Delete “Trip to Kyoto”?"
          description="This removes the project and its 4 notes for everyone. You can't undo it."
          footer={
            <>
              <Button label="Cancel" variant="outline" onClick={() => setConfirmOpen(false)} />
              <Button
                label="Delete project"
                variant="danger"
                loading={deleting()}
                loadingText="Deleting…"
                onClick={confirmDelete}
              />
            </>
          }
        />
      </Case>

      <Case
        title="A short form"
        description="The children go between the description and the footer. Text as the trigger is an outline Button."
      >
        <Dialog
          open={renameOpen()}
          onOpenChange={setRenameOpen}
          trigger="Rename project"
          title="Rename project"
          footer={
            <>
              <Button label="Cancel" variant="outline" onClick={() => setRenameOpen(false)} />
              <Button label="Save" loading={saving()} loadingText="Saving…" onClick={rename} />
            </>
          }
        >
          <TextField
            label="Name"
            value={name()}
            onChange={setName}
            description="Shown in the sidebar and in shared links."
          />
        </Dialog>
      </Case>

      <Case title="Information" description="A plain dialog with one way out. Clicking outside also closes it.">
        <Dialog
          trigger={{ label: "What's new", variant: "ghost" }}
          title="What's new in Yosegi"
          description="Red Hat Mono and Red Hat Text, a command palette, toasts, and buttons with icons on either side."
        />
      </Case>

      <Case
        title="Without a trigger"
        description="A title is enough to build it; open it from anywhere with open and onOpenChange."
      >
        <Button label="Archive 3 notes" variant="outline" onClick={() => setArchiveOpen(true)} />
        <Dialog
          open={archiveOpen()}
          onOpenChange={setArchiveOpen}
          title="Archive 3 notes?"
          description="They leave the sidebar but stay in search."
          footer={
            <Button
              label="Archive"
              onClick={() => {
                setArchiveOpen(false);
                toast.success("3 notes archived");
              }}
            />
          }
        />
      </Case>
    </>
  );
}
