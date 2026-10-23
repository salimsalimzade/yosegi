import { For } from "solid-js";
import { Button, CalendarIcon, InfoIcon, PlusIcon, Tooltip, type TooltipProps } from "yosegi";
import { Case } from "../ui/case";

export function TooltipPage() {
  return (
    <>
      <Case
        title="On hover and focus"
        description="Hover for 300ms, or Tab to a button: keyboard focus opens it right away. Escape closes it."
      >
        <For
          each={
            [
              ["Archive", "Move to the archive"],
              ["Share", "Copy a link"],
            ] as const
          }
        >
          {([label, tip]) => (
            <Tooltip>
              <Tooltip.Trigger as={Button} variant="outline">
                {label}
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content>
                  <Tooltip.Arrow />
                  {tip}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip>
          )}
        </For>
      </Case>

      <Case
        title="Naming icon buttons"
        description="The tooltip adds a description; the button still has its own aria-label."
      >
        <For
          each={
            [
              ["New note", PlusIcon],
              ["Pick a date", CalendarIcon],
              ["Synced 2 min ago", InfoIcon],
            ] as const
          }
        >
          {([tip, Icon]) => (
            <Tooltip>
              <Tooltip.Trigger as={Button} variant="ghost" icon={<Icon />} aria-label={tip} />
              <Tooltip.Portal>
                <Tooltip.Content>
                  <Tooltip.Arrow />
                  {tip}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip>
          )}
        </For>
      </Case>

      <Case title="Placements" description="Always open here, so each side is visible at once." layout="center">
        <div style={{ display: "flex", gap: "96px", padding: "48px 72px" }}>
          <For each={["top", "right", "bottom", "left"] as TooltipProps["placement"][]}>
            {(placement) => (
              <Tooltip open placement={placement}>
                <Tooltip.Trigger as={Button} variant="outline" size="sm">
                  {placement}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content>
                    <Tooltip.Arrow />
                    {placement}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip>
            )}
          </For>
        </div>
      </Case>

      <Case title="Instant and disabled" description="openDelay={0} opens at once; disabled never opens.">
        <Tooltip openDelay={0}>
          <Tooltip.Trigger as={Button} variant="outline">
            No delay
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content>
              <Tooltip.Arrow />
              Right away
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip>
        <Tooltip disabled>
          <Tooltip.Trigger as={Button} variant="outline">
            Disabled tooltip
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content>Never shown</Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip>
      </Case>
    </>
  );
}
