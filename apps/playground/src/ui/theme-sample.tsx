import { Button, Checkbox, Tabs, TextField } from "yosegi";
import styles from "./theme-sample.module.scss";

interface ThemeSampleProps {
  /** The class that holds an example's tokens. */
  class?: string;
  /** Sets data-yosegi-theme on the sample, to force a theme on this part of the page. */
  theme?: string;
}

/** The same few components in every theming example, so each change is easy to compare. */
export function ThemeSample(props: ThemeSampleProps) {
  return (
    <div class={[styles.sample, props.class]} data-yosegi-theme={props.theme}>
      <Tabs
        aria-label="Notes"
        defaultValue="all"
        tabs={[
          { value: "all", label: "All", count: 12 },
          { value: "pinned", label: "Pinned", count: 3 },
          { value: "archive", label: "Archive" },
        ]}
      />
      <TextField label="Project name" placeholder="e.g. Reading list" description="You can change it later." />
      <Checkbox label="Send me a weekly summary" defaultChecked />
      <div class={styles.actions}>
        <Button label="Save" />
        <Button label="Cancel" variant="outline" />
        <Button label="Delete" variant="danger" />
      </div>
    </div>
  );
}
