import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal } from "solid-js";
import { Button, Dialog, TextField, toast, TrashIcon } from "yosegi-solid";
import { createTask } from "../ui/task";

const meta = {
  title: "Overlays/Dialog",
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component:
          "A window over the page for a decision or a short form that has to be finished, or cancelled, before going on.",
      },
    },
  },
  args: {
    trigger: "What's new",
    title: "What's new in Yosegi",
    description: "Red Hat Mono and Red Hat Text, a command palette, toasts, and buttons with icons on either side.",
    role: "dialog",
  },
  argTypes: {
    trigger: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    role: { control: "inline-radio", options: ["dialog", "alertdialog"] },
    footer: { control: false },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** role="alertdialog" for a choice that interrupts. Escape or Cancel closes; the main action shows it is busy. */
export const Confirmation: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    const [deleting, remove] = createTask(1200);
    const confirm = () => {
      remove();
      setTimeout(() => {
        setOpen(false);
        toast.success("Project deleted");
      }, 1200);
    };
    return (
      <Dialog
        open={open()}
        onOpenChange={setOpen}
        role="alertdialog"
        trigger={{ label: "Delete project", variant: "danger", icon: <TrashIcon /> }}
        title="Delete “Trip to Kyoto”?"
        description="This removes the project and its 4 notes for everyone. You can't undo it."
        footer={
          <>
            <Button label="Cancel" variant="outline" onClick={() => setOpen(false)} />
            <Button
              label="Delete project"
              variant="danger"
              loading={deleting()}
              loadingText="Deleting…"
              onClick={confirm}
            />
          </>
        }
      />
    );
  },
};

/** The children go between the description and the footer. Text as the trigger is an outline Button. */
export const AShortForm: Story = {
  name: "A short form",
  render: () => {
    const [open, setOpen] = createSignal(false);
    const [saving, save] = createTask(1200);
    const [name, setName] = createSignal("Trip to Kyoto");
    const rename = () => {
      save();
      setTimeout(() => {
        setOpen(false);
        toast.success(`Renamed to “${name()}”`);
      }, 1200);
    };
    return (
      <Dialog
        open={open()}
        onOpenChange={setOpen}
        trigger="Rename project"
        title="Rename project"
        footer={
          <>
            <Button label="Cancel" variant="outline" onClick={() => setOpen(false)} />
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
    );
  },
};

/** A plain dialog with one way out. Clicking outside also closes it. */
export const Information: Story = {
  render: () => (
    <Dialog
      trigger={{ label: "What's new", variant: "ghost" }}
      title="What's new in Yosegi"
      description="Red Hat Mono and Red Hat Text, a command palette, toasts, and buttons with icons on either side."
    />
  ),
};

/** A title is enough to build it; open it from anywhere with open and onOpenChange. */
export const WithoutATrigger: Story = {
  name: "Without a trigger",
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button label="Archive 3 notes" variant="outline" onClick={() => setOpen(true)} />
        <Dialog
          open={open()}
          onOpenChange={setOpen}
          title="Archive 3 notes?"
          description="They leave the sidebar but stay in search."
          footer={
            <Button
              label="Archive"
              onClick={() => {
                setOpen(false);
                toast.success("3 notes archived");
              }}
            />
          }
        />
      </>
    );
  },
};
