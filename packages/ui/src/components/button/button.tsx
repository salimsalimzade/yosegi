import { isDev, type JSX, type ValidComponent } from "@solidjs/web";
import { children, omit, onSettled, Show } from "solid-js";
import { callHandler, dataAttr } from "../../primitives/dom";
import { createTag } from "../../primitives/create-part";
import { Spinner } from "../spinner/spinner";
import styles from "./button.module.scss";

/** A single clickable action, in one level with no parts. */
export interface ButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> {
  /** solid by default. */
  variant?: "solid" | "outline" | "ghost" | "danger";
  /** sm 28px, md 36px (default), lg 44px. */
  size?: "sm" | "md" | "lg";
  /**
   * An icon next to the label. With no label, the button becomes a square
   * icon button, which needs an aria-label.
   */
  icon?: JSX.Element;
  /** Which side of the label the icon sits on. start (default) is the left, or the right in right-to-left text. */
  iconPosition?: "start" | "end";
  /**
   * Shows a Spinner in the icon's place (at the start when there is no icon),
   * sets aria-busy and ignores clicks. Keeps the colour.
   */
  loading?: boolean;
  /** The label while loading, such as "Saving…". Without it the label stays as it is. */
  loadingText?: JSX.Element;
  /** A toggle's state. A boolean is written as "true" or "false". */
  "aria-pressed"?: boolean | "true" | "false" | "mixed";
  /** Render another element, such as a link, with the button's look. */
  as?: ValidComponent;
  href?: string;
  target?: string;
  rel?: string;
  download?: boolean | string;
}

export function Button(props: ButtonProps) {
  const Tag = createTag(() => props.as ?? "button");
  const isButton = () => (props.as ?? "button") === "button";
  // Resolved once each: reading a JSX prop again would create it again.
  const label = children(() => props.children);
  const icon = children(() => props.icon);
  const hasIcon = () => icon.toArray().length > 0;
  const iconOnly = () => hasIcon() && label.toArray().length === 0;
  const position = () => props.iconPosition ?? "start";
  const rest = omit(
    props,
    "as", "variant", "size", "icon", "iconPosition", "loading", "loadingText",
    "class", "type", "disabled", "onClick", "children", "aria-pressed",
  );

  if (isDev) {
    onSettled(() => {
      if (iconOnly() && !props["aria-label"] && !props["aria-labelledby"]) {
        console.warn("[yosegi] A Button with an icon and no label needs an aria-label that says what it does.");
      }
    });
  }

  // The icon, or the spinner in its place while loading, so nothing jumps.
  const slot = (side: "start" | "end") => (
    <Show when={(hasIcon() && position() === side) || (props.loading && side === "start" && !hasIcon())}>
      <span class={[styles.icon, "yosegi-button-icon"]} data-position={side} aria-hidden="true">
        {props.loading ? <Spinner /> : icon()}
      </span>
    </Show>
  );

  return (
    <Tag
      {...rest}
      class={[styles.root, "yosegi-button", props.class]}
      // Solid renders `true` as an empty attribute, but ARIA needs the word.
      aria-pressed={typeof props["aria-pressed"] === "boolean" ? String(props["aria-pressed"]) : props["aria-pressed"]}
      type={isButton() ? (props.type ?? "button") : undefined}
      disabled={isButton() ? props.disabled : undefined}
      aria-disabled={!isButton() && props.disabled ? "true" : undefined}
      aria-busy={props.loading ? "true" : undefined}
      data-variant={props.variant ?? "solid"}
      data-size={props.size ?? "md"}
      data-icon-only={dataAttr(iconOnly())}
      data-icon-position={hasIcon() ? position() : undefined}
      data-loading={dataAttr(props.loading)}
      data-disabled={dataAttr(props.disabled)}
      onClick={(event: MouseEvent) => {
        if (props.loading || props.disabled) {
          event.preventDefault();
          return;
        }
        callHandler(props.onClick, event);
      }}
    >
      {slot("start")}
      {props.loading && props.loadingText && !iconOnly() ? props.loadingText : label()}
      {slot("end")}
    </Tag>
  );
}
