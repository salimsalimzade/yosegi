import { Button } from "yosegi-solid";
import { storybookUrl } from "../storybook";
import { theme, toggleTheme } from "../theme";
import styles from "./site-header.module.scss";

/** The wordmark, the main links and the theme switch, at the top of every page. */
export function SiteHeader() {
  const label = () => (theme() === "dark" ? "Switch to light theme" : "Switch to dark theme");

  return (
    <header class={styles.root}>
      <div class={styles.start}>
        <a class={styles.wordmark} href="/">
          Yosegi
        </a>
        <nav class={styles.nav} aria-label="Main">
          <a class={styles.link} href="/examples">
            Examples
          </a>
          <a class={styles.link} href={storybookUrl} target="_blank" rel="noopener noreferrer">
            Storybook
          </a>
        </nav>
      </div>
      <Button
        variant="ghost"
        class={styles.toggle}
        data-theme={theme()}
        aria-label={label()}
        title={label()}
        icon={
          <>
            <svg class={styles.moon} viewBox="0 0 16 16" aria-hidden="true">
              <path d="M13.9 6.9A6.5 6.5 0 1 1 6.4 1.6a5.2 5.2 0 0 0 7.5 5.3z" />
            </svg>
            <svg class={styles.sun} viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="2.75" />
              <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06" />
            </svg>
          </>
        }
        onClick={(event) => toggleTheme(event.currentTarget)}
      />
    </header>
  );
}
