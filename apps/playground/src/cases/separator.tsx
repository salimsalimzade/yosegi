import { Button, Separator } from "yosegi";
import { Case, Cases } from "../ui/case";

export function SeparatorPage() {
  return (
    <Cases>
      <Case title="Horizontal" description="Across the full width, between groups." layout="fill">
        <div style={{ display: "grid", gap: "12px" }}>
          <p>Account</p>
          <Separator />
          <p style={{ color: "var(--yosegi-color-fg-muted)" }}>Profile, email and password.</p>
        </div>
      </Case>
      <Case title="Vertical" description="Down, between items in a row." layout="fill">
        <div style={{ display: "flex", "align-items": "center", gap: "12px", height: "20px" }}>
          <span>Docs</span>
          <Separator orientation="vertical" />
          <span>Changelog</span>
          <Separator orientation="vertical" />
          <span>Support</span>
        </div>
      </Case>
      <Case title="With a label" description="Two lines with a word between them." layout="fill">
        <div style={{ display: "grid", gap: "12px" }}>
          <Button label="Continue with GitHub" variant="outline" />
          <Separator>or</Separator>
          <Button label="Continue with email" />
        </div>
      </Case>
      <Case title="Announced" description={'decorative={false} gives it role="separator", for groups that matter.'} layout="fill">
        <div style={{ display: "grid", gap: "12px" }}>
          <p>Edit</p>
          <Separator decorative={false} />
          <p>Delete</p>
        </div>
      </Case>
    </Cases>
  );
}
