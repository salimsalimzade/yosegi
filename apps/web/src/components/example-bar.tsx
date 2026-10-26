import { ChevronLeftIcon, FileIcon } from "yosegi-solid";
import styles from "./example-bar.module.scss";

const source = "https://github.com/salimsalimzade/yosegi/blob/main/apps/web/src/pages";

/** Under the site header on an example: the way back, its name, and a link to its source. */
export function ExampleBar(props: { title: string; file: string }) {
  return (
    <div class={styles.root}>
      <a class={styles.back} href="/examples">
        <ChevronLeftIcon />
        Examples
      </a>
      <span class={styles.slash} aria-hidden="true">
        /
      </span>
      <span class={styles.title}>{props.title}</span>
      <a class={styles.source} href={`${source}/${props.file}`} target="_blank" rel="noopener noreferrer">
        <FileIcon />
        View source
      </a>
    </div>
  );
}
