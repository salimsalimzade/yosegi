import { Button, Spinner } from "yosegi";
import { Case } from "../ui/case";

export function SpinnerPage() {
  return (
    <>
      <Case title="Sizes" description="16px by default; set size for others.">
        <Spinner size={12} label="Loading" />
        <Spinner label="Loading" />
        <Spinner size={20} label="Loading" />
        <Spinner size={24} label="Loading" />
      </Case>
      <Case title="Colour follows text" description="It draws in currentColor, so it matches what's around it.">
        <Spinner style={{ color: "var(--yosegi-color-fg-muted)" }} label="Loading" />
        <Spinner style={{ color: "var(--yosegi-color-fg-accent)" }} label="Loading" />
        <Button label="Save" loading loadingText="Saving…" />
      </Case>
      <Case title="With words" description="Decorative next to visible text; label it when it stands alone.">
        <span
          style={{ display: "inline-flex", "align-items": "center", gap: "8px", color: "var(--yosegi-color-fg-muted)" }}
        >
          <Spinner />
          Loading notes…
        </span>
      </Case>
    </>
  );
}
