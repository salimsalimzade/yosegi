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
        <NotFound
          code="404"
          title="No such component"
          description="Pick one from the list on the left."
          actions={<Button label="All components" as="a" href={playgroundPath()} />}
        />
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
