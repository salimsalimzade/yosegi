import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

export type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonProps) {
  const rest = omit(props, "type");
  return <button type={props.type ?? "button"} {...rest} />;
}
