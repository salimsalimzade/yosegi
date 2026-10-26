import { For } from "solid-js";
import { ArrowRightIcon } from "yosegi-solid";
import { SiteHeader } from "../components/site-header";
import styles from "./examples.module.scss";

const examples = [
  {
    href: "/examples/dashboard",
    title: "Dashboard",
    description:
      "A tea shop's back office: figures for a range, a revenue chart, recent activity, and a table of orders to search, filter, select and open. ⌘K opens a command palette.",
    parts: ["Table", "Filter", "Tabs", "Item", "ButtonGroup", "Command", "Dialog", "Tooltip", "Kbd", "Toast"],
    preview: "dashboard",
  },
] as const;

/** Pages built with Yosegi, each a whole screen made only of its components. */
export function Examples() {
  return (
    <>
      <SiteHeader />
      <main class={styles.main}>
        <div class={styles.intro}>
          <h1>Examples</h1>
          <p class={styles.lead}>Real pages built with Yosegi. Open one to click around, or read its source.</p>
        </div>
        <div class={styles.grid}>
          <For each={examples}>
            {(example) => (
              <a class={styles.card} href={example.href}>
                {/* A sketch of the page's layout, in lines and blocks. */}
                <div class={styles.preview} data-preview={example.preview} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div class={styles.body}>
                  <h2 class={styles.title}>
                    {example.title}
                    <ArrowRightIcon />
                  </h2>
                  <p class={styles.description}>{example.description}</p>
                  <ul class={styles.parts} aria-label="Components">
                    <For each={example.parts}>{(part) => <li>{part}</li>}</For>
                  </ul>
                </div>
              </a>
            )}
          </For>
        </div>
      </main>
    </>
  );
}
