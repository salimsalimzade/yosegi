import { Button, EmptyState, GridIcon } from "yosegi-solid";
import { SiteHeader } from "../components/site-header";
import styles from "./examples.module.scss";

/** Pages and apps built with Yosegi. Empty for now. */
export function Examples() {
  return (
    <>
      <SiteHeader />
      <main class={styles.main}>
        <div class={styles.intro}>
          <h1>Examples</h1>
          <p class={styles.lead}>
            Real pages and apps built with Yosegi. Open one to click around, or read its source.
          </p>
        </div>
        <EmptyState
          class={styles.empty}
          icon={<GridIcon />}
          title="No examples yet"
          description="They're on the way. Until then, every piece on the front page works."
          actions={<Button as="a" href="/" variant="outline" label="Back to the front page" />}
        />
      </main>
    </>
  );
}
