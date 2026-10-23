import { Button, NotFound as NotFoundState } from "yosegi";
import { playgroundPath } from "../catalog";
import styles from "./page.module.scss";

/** Any address outside the playground's pages. */
export function NotFound() {
  return (
    <main class={styles["not-found"]}>
      <NotFoundState>
        <NotFoundState.Code>404</NotFoundState.Code>
        <NotFoundState.Title>Page not found</NotFoundState.Title>
        <NotFoundState.Description>There's nothing at this address.</NotFoundState.Description>
        <NotFoundState.Actions>
          <Button label="Open the playground" as="a" href={playgroundPath()} />
        </NotFoundState.Actions>
      </NotFoundState>
    </main>
  );
}
