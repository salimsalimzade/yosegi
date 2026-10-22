import { Button, toast } from "yosegi";
import { Case } from "../ui/case";

const wait = (ms: number, fail = false) =>
  new Promise<string>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Network")) : resolve("Trip to Kyoto")), ms));

export function ToastPage() {
  return (
    <>
      <Case title="Plain" description="A short message. It goes after 4 seconds; hovering holds it.">
        <Button variant="outline" onClick={() => toast("Note saved")}>
          Show toast
        </Button>
      </Case>

      <Case title="Success, with a description">
        <Button variant="outline" onClick={() => toast.success("Project created", { description: "You can invite people now." })}>
          Show success
        </Button>
      </Case>

      <Case title="Error, with an action" description={'Errors are announced straight away (role="alert").'}>
        <Button
          variant="outline"
          onClick={() =>
            toast.error("Couldn't save your note", {
              description: "Check your connection.",
              action: { label: "Retry", onClick: () => toast("Retrying…") },
            })
          }
        >
          Show error
        </Button>
      </Case>

      <Case title="Undo" description="An action button closes the toast when used.">
        <Button
          variant="outline"
          onClick={() => toast("Note deleted", { action: { label: "Undo", onClick: () => toast.success("Note restored") } })}
        >
          Delete a note
        </Button>
      </Case>

      <Case title="From a promise" description="toast.promise shows a loading toast that turns into success or error.">
        <Button
          variant="outline"
          onClick={() => toast.promise(wait(1500), { loading: "Saving…", success: (name) => `${name} saved`, error: "Couldn't save" })}
        >
          Save, succeeds
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.promise(wait(1500, true), { loading: "Saving…", success: "Saved", error: "Couldn't save: you're offline" })}
        >
          Save, fails
        </Button>
      </Case>

      <Case title="Many at once" description="At most 3 show; the oldest make room. Dismiss all clears them.">
        <Button variant="outline" onClick={() => ["One", "Two", "Three", "Four", "Five"].forEach((n, i) => setTimeout(() => toast(`Toast ${n}`), i * 150))}>
          Show five
        </Button>
        <Button variant="ghost" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </Case>
    </>
  );
}
