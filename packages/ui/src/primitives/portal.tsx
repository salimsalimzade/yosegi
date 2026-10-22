import { Portal as WebPortal, type JSX } from "@solidjs/web";

export interface PortalProps {
  /** Where to render; `document.body` by default. */
  mount?: Element;
  children?: JSX.Element;
}

/** Moves its children to `<body>`, out of any overflow or stacking context. */
export function Portal(props: PortalProps) {
  return <WebPortal mount={props.mount}>{props.children}</WebPortal>;
}
