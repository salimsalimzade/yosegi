import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button, Toaster, toast } from "yosegi-solid";

const wait = (ms: number, fail = false) =>
  new Promise<string>((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error("Network")) : resolve("Trip to Kyoto")), ms),
  );

// toast() is a function, not a component: the stories are buttons that call it, and the
// table documents <Toaster>, which Storybook mounts once for every story.
const meta = {
  title: "Feedback/Toast",
  component: Toaster,
  parameters: {
    docs: {
      description: {
        component:
          "A short message in a corner of the screen that confirms something happened, and goes away by itself. Mount one `<Toaster />` near the root, then call `toast(…)`, `toast.success`, `toast.error`, `toast.loading`, `toast.promise` or `toast.dismiss` from anywhere.",
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A short message. It goes after 4 seconds; hovering holds it. */
export const Plain: Story = {
  render: () => <Button label="Show toast" variant="outline" onClick={() => toast("Note saved")} />,
};

export const SuccessWithADescription: Story = {
  name: "Success, with a description",
  render: () => (
    <Button
      label="Show success"
      variant="outline"
      onClick={() => toast.success("Project created", { description: "You can invite people now." })}
    />
  ),
};

/** Errors are announced straight away (role="alert"). */
export const ErrorWithAnAction: Story = {
  name: "Error, with an action",
  render: () => (
    <Button
      label="Show error"
      variant="outline"
      onClick={() =>
        toast.error("Couldn't save your note", {
          description: "Check your connection.",
          action: { label: "Retry", onClick: () => toast("Retrying…") },
        })
      }
    />
  ),
};

/** An action button closes the toast when used. */
export const Undo: Story = {
  render: () => (
    <Button
      label="Delete a note"
      variant="outline"
      onClick={() =>
        toast("Note deleted", { action: { label: "Undo", onClick: () => toast.success("Note restored") } })
      }
    />
  ),
};

/** toast.promise shows a loading toast that turns into success or error. */
export const FromAPromise: Story = {
  name: "From a promise",
  render: () => (
    <>
      <Button
        label="Save, succeeds"
        variant="outline"
        onClick={() =>
          toast.promise(wait(1500), { loading: "Saving…", success: (name) => `${name} saved`, error: "Couldn't save" })
        }
      />
      <Button
        label="Save, fails"
        variant="outline"
        onClick={() =>
          toast.promise(wait(1500, true), {
            loading: "Saving…",
            success: "Saved",
            error: "Couldn't save: you're offline",
          })
        }
      />
    </>
  ),
};

/** At most 3 show; the oldest make room. Dismiss all clears them. */
export const ManyAtOnce: Story = {
  name: "Many at once",
  render: () => (
    <>
      <Button
        label="Show five"
        variant="outline"
        onClick={() =>
          ["One", "Two", "Three", "Four", "Five"].forEach((n, i) => setTimeout(() => toast(`Toast ${n}`), i * 150))
        }
      />
      <Button label="Dismiss all" variant="ghost" onClick={() => toast.dismiss()} />
    </>
  ),
};
