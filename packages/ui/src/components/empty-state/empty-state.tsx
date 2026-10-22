import { createPart } from "../../primitives/create-part";
import styles from "./empty-state.module.scss";

/** A centred message for a list or page with nothing in it yet. */
export const EmptyState = Object.assign(createPart("section", styles.root, "yosegi-empty-state"), {
  Icon: createPart("div", styles.icon, "yosegi-empty-state-icon", { "aria-hidden": "true" }),
  /** An h2 by default. */
  Title: createPart<HTMLHeadingElement>("h2", styles.title, "yosegi-empty-state-title"),
  Description: createPart<HTMLParagraphElement>("p", styles.description, "yosegi-empty-state-description"),
  Actions: createPart("div", styles.actions, "yosegi-empty-state-actions"),
});
