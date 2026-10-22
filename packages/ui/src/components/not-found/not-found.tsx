import { createPart } from "../../primitives/create-part";
import styles from "./not-found.module.scss";

/** A centred message for a page or item that doesn't exist. */
export const NotFound = Object.assign(createPart("section", styles.root, "yosegi-not-found"), {
  /** A large decorative code such as "404", hidden from screen readers. */
  Code: createPart<HTMLParagraphElement>("p", styles.code, "yosegi-not-found-code", { "aria-hidden": "true" }),
  /** An h1 by default. */
  Title: createPart<HTMLHeadingElement>("h1", styles.title, "yosegi-not-found-title"),
  Description: createPart<HTMLParagraphElement>("p", styles.description, "yosegi-not-found-description"),
  Actions: createPart("div", styles.actions, "yosegi-not-found-actions"),
});
