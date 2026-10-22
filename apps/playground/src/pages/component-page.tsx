import { useParams } from "@solidjs/router";
import { dynamic } from "@solidjs/web";
import { Show } from "solid-js";
import { Button, NotFound } from "yosegi";
import { findEntry, playgroundPath } from "../catalog";
import styles from "./page.module.scss";

/** One component: its group, name, summary and parts, then each of its cases. */
export function ComponentPage() {
  const params = useParams();
  const entry = () => findEntry(params.slug);
  const Cases = dynamic(() => entry()?.page);

  return (
    <Show
      when={entry()}
      fallback={
        <NotFound>
          <NotFound.Code>404</NotFound.Code>
          <NotFound.Title>No such component</NotFound.Title>
          <NotFound.Description>Pick one from the list on the left.</NotFound.Description>
          <NotFound.Actions>
            <Button as="a" href={playgroundPath()}>
              All components
            </Button>
          </NotFound.Actions>
        </NotFound>
      }
    >
      {(found) => (
        <article>
          <header class={styles.header}>
            <p class={styles.eyebrow}>{found().group}</p>
            <h1 class={styles.title}>{found().name}</h1>
            <p class={styles.summary}>{found().summary}</p>
            <p class={styles.parts}>{found().parts}</p>
          </header>
          <div class={styles.cases}>
            <Cases />
          </div>
        </article>
      )}
    </Show>
  );
}
