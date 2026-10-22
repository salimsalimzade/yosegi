import { For } from "solid-js";
import { ChevronRightIcon, Item } from "yosegi";
import { catalog, groups, playgroundPath } from "../catalog";
import styles from "./page.module.scss";

/** Every component, by group, as rows you can open. */
export function Overview() {
  return (
    <article>
      <header class={styles.header}>
        <p class={styles.eyebrow}>Yosegi</p>
        <h1 class={styles.title}>Components</h1>
        <p class={styles.summary}>
          Small, plain pieces that fit together. Each page shows one component, case by case, as the design system
          describes it.
        </p>
      </header>
      <div class={styles.overview}>
        <For each={groups}>
          {(group) => (
            <section class={styles["overview-group"]}>
              <h2>{group}</h2>
              <Item.Group>
                <For each={catalog.filter((entry) => entry.group === group)}>
                  {(entry, index) => (
                    <>
                      {index() > 0 && <Item.Separator />}
                      <Item as="a" href={playgroundPath(entry.slug)} size="sm">
                        <Item.Content>
                          <Item.Title>{entry.name}</Item.Title>
                          <Item.Description>{entry.summary}</Item.Description>
                        </Item.Content>
                        <Item.Actions>
                          <ChevronRightIcon />
                        </Item.Actions>
                      </Item>
                    </>
                  )}
                </For>
              </Item.Group>
            </section>
          )}
        </For>
      </div>
    </article>
  );
}
