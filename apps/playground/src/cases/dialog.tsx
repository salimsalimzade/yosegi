import { createSignal } from "solid-js";
import { Button, Dialog, TextField, toast, TrashIcon } from "yosegi";
import { Case } from "../ui/case";
import { createTask } from "../ui/task";

export function DialogPage() {
  const [confirmOpen, setConfirmOpen] = createSignal(false);
  const [renameOpen, setRenameOpen] = createSignal(false);
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
      <Case title="Confirmation" description='role="alertdialog" for a choice that interrupts. Escape or Cancel closes; the main action shows it is busy.'>
        <Dialog open={confirmOpen()} onOpenChange={setConfirmOpen}>
          <Dialog.Trigger as={Button} variant="danger" icon={<TrashIcon />}>
            Delete project
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content role="alertdialog">
              <Dialog.Header>
                <Dialog.Title>Delete “Trip to Kyoto”?</Dialog.Title>
                <Dialog.CloseButton />
              </Dialog.Header>
              <Dialog.Description>This removes the project and its 4 notes for everyone. You can't undo it.</Dialog.Description>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" loading={deleting()} loadingText="Deleting…" onClick={confirmDelete}>
                  Delete project
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </Case>

      <Case title="A short form" description="Fields go in Dialog.Body, between the description and the footer.">
        <Dialog open={renameOpen()} onOpenChange={setRenameOpen}>
          <Dialog.Trigger as={Button} variant="outline">
            Rename project
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Rename project</Dialog.Title>
                <Dialog.CloseButton />
              </Dialog.Header>
              <Dialog.Body>
                <TextField label="Name" value={name()} onChange={setName} description="Shown in the sidebar and in shared links." />
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setRenameOpen(false)}>
                  Cancel
                </Button>
                <Button loading={saving()} loadingText="Saving…" onClick={rename}>
                  Save
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </Case>

      <Case title="Information" description="A plain dialog with one way out. Clicking outside also closes it.">
        <Dialog>
          <Dialog.Trigger as={Button} variant="ghost">
            What's new
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>What's new in Yosegi</Dialog.Title>
                <Dialog.CloseButton />
              </Dialog.Header>
              <Dialog.Description>
                Red Hat Mono and Red Hat Text, a command palette, toasts, and buttons with icons on either side.
              </Dialog.Description>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </Case>
    </>
  );
}
