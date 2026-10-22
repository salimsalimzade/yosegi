import { createPart } from "../../primitives/create-part";
import styles from "./error-state.module.scss";

/**
 * A centred message for something that failed to load or save. Renders
 * role="alert"; pass role={undefined} when the error is shown on purpose.
 */
export const ErrorState = Object.assign(
  createPart("section", styles.root, "yosegi-error-state", { role: "alert" }),
  {
    Icon: createPart("div", styles.icon, "yosegi-error-state-icon", { "aria-hidden": "true" }),
    /** An h2 by default. */
    Title: createPart<HTMLHeadingElement>("h2", styles.title, "yosegi-error-state-title"),
    Description: createPart<HTMLParagraphElement>("p", styles.description, "yosegi-error-state-description"),
    /** An error code or reference ID people can copy and send to support. */
    Detail: createPart<HTMLParagraphElement>("p", styles.detail, "yosegi-error-state-detail"),
    Actions: createPart("div", styles.actions, "yosegi-error-state-actions"),
  },
);
