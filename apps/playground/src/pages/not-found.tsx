import { Button, NotFound as NotFoundState } from "yosegi";
import { playgroundPath } from "../catalog";
import styles from "./page.module.scss";

/** Any address outside the playground's pages. */
export function NotFound() {
  return (
    <main class={styles["not-found"]}>
      <NotFoundState
        code="404"
        title="Page not found"
        description="There's nothing at this address."
        actions={<Button label="Open the playground" as="a" href={playgroundPath()} />}
      />
    </main>
  );
}
