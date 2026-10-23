import type { Component } from "solid-js";
import { createMemo, Show } from "solid-js";
import { createTag } from "../../primitives/create-part";
import { Button, type ButtonTriggerProps } from "./button";

export interface ButtonTriggerSlotProps {
  /** Text for the label, or a Button's props. */
  trigger?: string | ButtonTriggerProps;
  /** The component's Trigger part, which renders the Button through `as`. */
  part: Component<any>;
}

/**
 * The trigger of a component built from its props, like Popover's: an outline
 * Button by default, wired by the component's own Trigger part.
 */
export function ButtonTriggerSlot(props: ButtonTriggerSlotProps) {
  const Part = createTag(() => props.part);
  // Read once: the object builds its icon again on every read.
  const button = createMemo(() => {
    const trigger = props.trigger;
    return typeof trigger === "string" ? { label: trigger } : { ...trigger };
  });

  // Keyed: the part gets plain props, and a new trigger object builds it again.
  return (
    <Show when={button()} keyed>
      {(button) => <Part as={Button} variant="outline" {...button} />}
    </Show>
  );
}
